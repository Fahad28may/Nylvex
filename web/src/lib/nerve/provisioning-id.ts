import { createHash } from "node:crypto";

/**
 * A stable id for a given (organization, product) pair, used as Nerve's
 * idempotency key (`external_provisioning_id`). It must never change across
 * retries — deriving it deterministically means there is nothing to persist
 * and nothing that a duplicate click or a page refresh can regenerate.
 */
export function getExternalProvisioningId(organizationId: string, productSlug: string): string {
  return createHash("sha256").update(`nylvex:${productSlug}:${organizationId}`).digest("hex");
}
