import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { productAccess, whatsappIntegrations } from "@/lib/db/schema";
import type { WhatsappIntegrationStatus } from "@/lib/db/schema";
import { getOrganizationForUser } from "@/lib/db/queries";
import { connectWhatsapp as connectWhatsappOnNerve, NerveClientError } from "@/lib/nerve/client";

const NERVE_PRODUCT_SLUG = "nerve";

export type WhatsappConnectInput = {
  code: string;
  wabaId: string;
  phoneNumberId: string;
};

export type WhatsappConnectResult = {
  status: WhatsappIntegrationStatus;
  message?: string;
};

/**
 * Completes WhatsApp Embedded Signup for the given user's organization.
 *
 * Mirrors requestNerveProvisioning's shape (see lib/nerve/provisioning.ts):
 * the only input is an authenticated userId plus what the browser captured
 * from Meta's Embedded Signup completion event -- there is no
 * organizationId, businessId, or externalReference parameter, so there is
 * no code path for a client to target another org's integration or claim
 * a WhatsApp number on behalf of a business it doesn't own. The Nerve
 * Business id used to call Nerve always comes from this organization's own
 * ProductAccess.externalReference, read server-side, never from the
 * caller.
 */
export async function connectWhatsappForUser(
  userId: string,
  input: WhatsappConnectInput
): Promise<WhatsappConnectResult> {
  const organization = await getOrganizationForUser(userId);
  if (!organization) {
    return { status: "failed", message: "No organization found for this account." };
  }

  const [access] = await db
    .select()
    .from(productAccess)
    .where(
      and(
        eq(productAccess.organizationId, organization.id),
        eq(productAccess.productSlug, NERVE_PRODUCT_SLUG)
      )
    )
    .limit(1);

  // WhatsApp can only be connected once a Nerve Business exists -- there
  // is nothing to call Nerve about otherwise.
  if (!access || !access.externalReference) {
    return { status: "failed", message: "Request Nerve before connecting WhatsApp." };
  }

  await db
    .insert(whatsappIntegrations)
    .values({ productAccessId: access.id, status: "not_connected" })
    .onConflictDoNothing({ target: whatsappIntegrations.productAccessId });

  const [row] = await db
    .select()
    .from(whatsappIntegrations)
    .where(eq(whatsappIntegrations.productAccessId, access.id))
    .limit(1);

  if (!row) {
    return { status: "failed", message: "Could not start WhatsApp onboarding." };
  }

  if (row.status === "connected") {
    return { status: "connected" };
  }

  // Unlike requestNerveProvisioning's conditional claim, this does not
  // gate on the row's current status before proceeding: doing so would
  // let a "connecting" row that never resolved (a crashed process, a
  // lost response) become permanently unretryable, since nothing else
  // ever moves it out of that state. Safety instead comes from Nerve's
  // own idempotency and conflict handling (see Nerve's docs/NYLVEX_API.md
  // §8a.6) -- a genuine double-submission from two concurrent requests is
  // resolved there, not by a lock here. Each attempt also requires a
  // fresh, single-use Meta authorization code, which itself rules out two
  // requests successfully replaying the same completion.
  await db
    .update(whatsappIntegrations)
    .set({ status: "connecting", updatedAt: new Date() })
    .where(eq(whatsappIntegrations.id, row.id));

  try {
    const connection = await connectWhatsappOnNerve(access.externalReference, input);

    await db
      .update(whatsappIntegrations)
      .set({
        status: "connected",
        wabaId: connection.wabaId,
        phoneNumberId: connection.phoneNumberId,
        displayPhoneNumber: connection.displayPhoneNumber,
        businessDisplayName: connection.verifiedName,
        failureReason: null,
        connectedAt: new Date(connection.connectedAt),
        updatedAt: new Date(),
      })
      .where(eq(whatsappIntegrations.id, row.id));

    // Mirrors Nerve's own derived status: a Business with a WhatsApp
    // number configured is "active", not just "provisioning".
    await db
      .update(productAccess)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(productAccess.id, access.id));

    return { status: "connected" };
  } catch (error) {
    // Nerve's 409s mean "already connected differently" (see Nerve's
    // docs/NYLVEX_API.md §8a.6) -- everything else is a generic
    // reachability/validation failure. Neither path ever surfaces Nerve's
    // raw error text to the client.
    const message =
      error instanceof NerveClientError && error.status === 409
        ? "This WhatsApp number is already connected elsewhere. Contact support if this seems wrong."
        : "We couldn't connect WhatsApp right now. Please try again.";

    await db
      .update(whatsappIntegrations)
      .set({ status: "failed", failureReason: message, updatedAt: new Date() })
      .where(eq(whatsappIntegrations.id, row.id));

    return { status: "failed", message };
  }
}
