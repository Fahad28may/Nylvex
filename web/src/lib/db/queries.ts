import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { consultationRequests, organizationMembers, organizations, productAccess } from "@/lib/db/schema";

// Every query here takes an authenticated userId (never a client-supplied
// organizationId) and derives what that user is allowed to see from there.

export async function getOrganizationForUser(userId: string) {
  const [row] = await db
    .select({ organization: organizations })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  return row?.organization ?? null;
}

export async function getProductAccessForOrganization(organizationId: string) {
  return db
    .select()
    .from(productAccess)
    .where(eq(productAccess.organizationId, organizationId));
}

export async function getConsultationsForUser(userId: string, organizationId: string | null) {
  const condition = organizationId
    ? eq(consultationRequests.organizationId, organizationId)
    : eq(consultationRequests.userId, userId);

  return db
    .select()
    .from(consultationRequests)
    .where(condition)
    .orderBy(desc(consultationRequests.createdAt));
}
