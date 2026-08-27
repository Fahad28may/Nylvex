import "server-only";
import { and, desc, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { consultationRequests, productAccess } from "@/lib/db/schema";
import type { ProductAccessStatus } from "@/lib/db/schema";
import { getOrganizationForUser } from "@/lib/db/queries";
import { getExternalProvisioningId } from "@/lib/nerve/provisioning-id";
import { getBusiness, NerveClientError, provisionBusiness } from "@/lib/nerve/client";

const NERVE_PRODUCT_SLUG = "nerve";

export type NerveProvisioningResult = {
  status: ProductAccessStatus;
  message?: string;
};

async function deriveBusinessInfo(organizationId: string, organizationName: string) {
  const [latest] = await db
    .select()
    .from(consultationRequests)
    .where(eq(consultationRequests.organizationId, organizationId))
    .orderBy(desc(consultationRequests.createdAt))
    .limit(1);

  return {
    businessName: latest?.companyName || organizationName,
    industry: "General",
    description: latest
      ? `${latest.project} ${latest.problem}`.slice(0, 1000)
      : "Provisioned from the Nylvex dashboard.",
    location: "",
    contact: latest?.email ?? "",
  };
}

/**
 * Requests (or reconciles) Nerve access for the given user's organization.
 *
 * There is no distributed transaction across the Nylvex and Nerve
 * databases — this function is written so that it's always safe to call
 * again after a partial failure (lost response, crashed process, concurrent
 * click) rather than pretending the two systems can be updated atomically.
 * Safety comes from two things: a unique (organizationId, productSlug)
 * index in Postgres (so at most one ProductAccess row can ever exist for
 * this org+product) and a stable, deterministic external_provisioning_id
 * that lets Nerve's own idempotency collapse repeat calls onto the same
 * Business instead of creating a new one.
 *
 * The only input is an authenticated userId — there is no organizationId,
 * businessId, or externalReference parameter, so there is no code path for
 * a client to influence whose ProductAccess gets touched or what it's set
 * to.
 */
export async function requestNerveProvisioning(userId: string): Promise<NerveProvisioningResult> {
  const organization = await getOrganizationForUser(userId);
  if (!organization) {
    return { status: "failed", message: "No organization found for this account." };
  }

  await db
    .insert(productAccess)
    .values({ organizationId: organization.id, productSlug: NERVE_PRODUCT_SLUG, status: "requested" })
    .onConflictDoNothing({ target: [productAccess.organizationId, productAccess.productSlug] });

  const [row] = await db
    .select()
    .from(productAccess)
    .where(
      and(
        eq(productAccess.organizationId, organization.id),
        eq(productAccess.productSlug, NERVE_PRODUCT_SLUG)
      )
    )
    .limit(1);

  if (!row) {
    return { status: "failed", message: "Could not create a product access record." };
  }

  if (row.status === "active") {
    return { status: "active" };
  }

  if (row.status === "provisioning" && row.externalReference) {
    // Already provisioning with a known Nerve business — check on it rather
    // than starting a second provisioning call.
    try {
      const business = await getBusiness(row.externalReference);
      if (business.status !== row.status) {
        await db
          .update(productAccess)
          .set({ status: business.status, updatedAt: new Date() })
          .where(eq(productAccess.id, row.id));
      }
      return { status: business.status };
    } catch {
      // Nerve unavailable right now — report the last known state instead
      // of fabricating a result.
      return { status: row.status };
    }
  }

  // Only "requested" or "failed" rows (or a "provisioning" row that never
  // got an externalReference, meaning the original call never completed)
  // reach here. Claim the row with a conditional update so a concurrent
  // request that read the same "requested" row doesn't also fire an
  // outbound call — and if it does anyway, Nerve's own idempotency on
  // external_provisioning_id still prevents a duplicate Business.
  const claimed = await db
    .update(productAccess)
    .set({ status: "provisioning", updatedAt: new Date() })
    .where(
      and(
        eq(productAccess.id, row.id),
        or(eq(productAccess.status, "requested"), eq(productAccess.status, "failed"))
      )
    )
    .returning();

  if (claimed.length === 0) {
    const [current] = await db
      .select()
      .from(productAccess)
      .where(eq(productAccess.id, row.id))
      .limit(1);
    return { status: current?.status ?? row.status };
  }

  const externalProvisioningId = getExternalProvisioningId(organization.id, NERVE_PRODUCT_SLUG);
  const businessInfo = await deriveBusinessInfo(organization.id, organization.name);

  try {
    const business = await provisionBusiness({ externalProvisioningId, ...businessInfo });
    await db
      .update(productAccess)
      .set({
        status: business.status,
        externalReference: business.businessId,
        updatedAt: new Date(),
      })
      .where(eq(productAccess.id, row.id));
    return { status: business.status };
  } catch (error) {
    console.error(
      "Nerve provisioning failed",
      error instanceof NerveClientError ? error.kind : "unknown"
    );
    await db
      .update(productAccess)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(productAccess.id, row.id));
    return {
      status: "failed",
      message: "Nerve is unavailable right now. Please try again shortly.",
    };
  }
}
