import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

vi.mock("./client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./client")>();
  return {
    ...actual,
    provisionBusiness: vi.fn(),
    getBusiness: vi.fn(),
  };
});

// These tests exercise the real ProductAccess table (via a local dev
// Postgres — see docker-compose.yml) so that the unique-index-based
// concurrency guarantee is verified against real database behavior rather
// than a hand-rolled mock of it. Only the Nerve HTTP boundary is mocked.
// If DATABASE_URL isn't set, skip instead of failing a contributor's
// machine that hasn't started the dev database.
const hasDb = Boolean(process.env.DATABASE_URL);
const describeWithDb = hasDb ? describe : describe.skip;

describeWithDb("requestNerveProvisioning (real db, mocked Nerve client)", () => {
  let db: typeof import("@/lib/db").db;
  let schema: typeof import("@/lib/db/schema");
  let requestNerveProvisioning: typeof import("./provisioning").requestNerveProvisioning;
  let provisionBusiness: ReturnType<typeof vi.fn>;
  let getBusiness: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    ({ db } = await import("@/lib/db"));
    schema = await import("@/lib/db/schema");
    ({ requestNerveProvisioning } = await import("./provisioning"));
    ({ provisionBusiness, getBusiness } = (await import("./client")) as unknown as {
      provisionBusiness: ReturnType<typeof vi.fn>;
      getBusiness: ReturnType<typeof vi.fn>;
    });
    provisionBusiness.mockReset();
    getBusiness.mockReset();

    await db.delete(schema.consultationRequests);
    await db.delete(schema.productAccess);
    await db.delete(schema.organizationMembers);
    await db.delete(schema.organizations);
    await db.delete(schema.users);
  });

  afterAll(async () => {
    const client = (await import("@/lib/db")).db;
    await client.$client.end();
  });

  async function createOrg(label: string) {
    const [user] = await db
      .insert(schema.users)
      .values({
        name: label,
        email: `${label.toLowerCase()}-${Math.random().toString(36).slice(2)}@example.com`,
        passwordHash: "irrelevant-for-these-tests",
        role: "client",
      })
      .returning();
    const [organization] = await db
      .insert(schema.organizations)
      .values({ name: `${label}'s Org` })
      .returning();
    await db
      .insert(schema.organizationMembers)
      .values({ organizationId: organization.id, userId: user.id, role: "owner" });
    return { user, organization };
  }

  it("A: provisions a fresh org and stores the returned business id", async () => {
    const { user, organization } = await createOrg("OrgA");
    provisionBusiness.mockResolvedValueOnce({
      businessId: "biz_a",
      name: organization.name,
      status: "provisioning",
    });

    const result = await requestNerveProvisioning(user.id);

    expect(result.status).toBe("provisioning");
    expect(provisionBusiness).toHaveBeenCalledTimes(1);

    const [row] = await db
      .select()
      .from(schema.productAccess)
      .where(eq(schema.productAccess.organizationId, organization.id));
    expect(row.externalReference).toBe("biz_a");
    expect(row.status).toBe("provisioning");
  });

  it("B: does not re-provision when already active", async () => {
    const { user, organization } = await createOrg("OrgB");
    provisionBusiness.mockResolvedValueOnce({
      businessId: "biz_b",
      name: organization.name,
      status: "active",
    });

    await requestNerveProvisioning(user.id);
    const second = await requestNerveProvisioning(user.id);

    expect(second.status).toBe("active");
    expect(provisionBusiness).toHaveBeenCalledTimes(1);
    expect(getBusiness).not.toHaveBeenCalled();
  });

  it("C: reconciles a provisioning row via getBusiness instead of re-provisioning", async () => {
    const { user, organization } = await createOrg("OrgC");
    provisionBusiness.mockResolvedValueOnce({
      businessId: "biz_c",
      name: organization.name,
      status: "provisioning",
    });
    getBusiness.mockResolvedValueOnce({
      businessId: "biz_c",
      name: organization.name,
      status: "active",
    });

    await requestNerveProvisioning(user.id);
    const second = await requestNerveProvisioning(user.id);

    expect(second.status).toBe("active");
    expect(provisionBusiness).toHaveBeenCalledTimes(1);
    expect(getBusiness).toHaveBeenCalledTimes(1);
    expect(getBusiness).toHaveBeenCalledWith("biz_c");
  });

  it("D: retries with the same external_provisioning_id after a simulated partial failure", async () => {
    const { user, organization } = await createOrg("OrgD");
    provisionBusiness.mockResolvedValueOnce({
      businessId: "biz_d",
      name: organization.name,
      status: "provisioning",
    });
    await requestNerveProvisioning(user.id);

    // Simulate "Nerve created the business but Nylvex never recorded the
    // response" by resetting local state back to requested while Nerve's
    // side (mocked here) still remembers the same business for a repeat
    // call with the same external_provisioning_id.
    await db
      .update(schema.productAccess)
      .set({ status: "requested" })
      .where(eq(schema.productAccess.organizationId, organization.id));

    provisionBusiness.mockResolvedValueOnce({
      businessId: "biz_d",
      name: organization.name,
      status: "active",
    });

    const result = await requestNerveProvisioning(user.id);

    expect(result.status).toBe("active");
    const [row] = await db
      .select()
      .from(schema.productAccess)
      .where(eq(schema.productAccess.organizationId, organization.id));
    expect(row.externalReference).toBe("biz_d");

    const [[firstCallArg], [secondCallArg]] = provisionBusiness.mock.calls;
    expect(firstCallArg.externalProvisioningId).toBe(secondCallArg.externalProvisioningId);
  });

  it("E: two concurrent requests result in exactly one ProductAccess row and one Nerve call", async () => {
    const { user, organization } = await createOrg("OrgE");
    provisionBusiness.mockResolvedValue({
      businessId: "biz_e",
      name: organization.name,
      status: "provisioning",
    });

    await Promise.all([requestNerveProvisioning(user.id), requestNerveProvisioning(user.id)]);

    const rows = await db
      .select()
      .from(schema.productAccess)
      .where(eq(schema.productAccess.organizationId, organization.id));
    expect(rows).toHaveLength(1);
    expect(provisionBusiness).toHaveBeenCalledTimes(1);
  });

  it("F: Nerve unavailable — ProductAccess is marked failed, no crash, no fabricated success", async () => {
    const { user, organization } = await createOrg("OrgF");
    provisionBusiness.mockRejectedValueOnce(new Error("Could not reach Nerve."));

    const result = await requestNerveProvisioning(user.id);

    expect(result.status).toBe("failed");
    const [row] = await db
      .select()
      .from(schema.productAccess)
      .where(eq(schema.productAccess.organizationId, organization.id));
    expect(row.status).toBe("failed");
    expect(row.externalReference).toBeNull();
  });

  it("never touches another organization's ProductAccess row", async () => {
    const { user: userA, organization: orgA } = await createOrg("IsoA");
    const { organization: orgB } = await createOrg("IsoB");
    provisionBusiness.mockResolvedValueOnce({
      businessId: "biz_iso_a",
      name: orgA.name,
      status: "active",
    });
    await db.insert(schema.productAccess).values({
      organizationId: orgB.id,
      productSlug: "nerve",
      status: "requested",
    });

    await requestNerveProvisioning(userA.id);

    const [rowB] = await db
      .select()
      .from(schema.productAccess)
      .where(eq(schema.productAccess.organizationId, orgB.id));
    expect(rowB.status).toBe("requested");
    expect(rowB.externalReference).toBeNull();
  });
});
