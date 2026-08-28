import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

vi.mock("./client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./client")>();
  return {
    ...actual,
    connectWhatsapp: vi.fn(),
  };
});

// Same approach as provisioning.test.ts: real ProductAccess/whatsappIntegrations
// tables via the local dev Postgres, only the Nerve HTTP boundary mocked.
const hasDb = Boolean(process.env.DATABASE_URL);
const describeWithDb = hasDb ? describe : describe.skip;

describeWithDb("connectWhatsappForUser (real db, mocked Nerve client)", () => {
  let db: typeof import("@/lib/db").db;
  let schema: typeof import("@/lib/db/schema");
  let connectWhatsappForUser: typeof import("./whatsapp").connectWhatsappForUser;
  let connectWhatsapp: ReturnType<typeof vi.fn>;
  let NerveClientError: typeof import("./client").NerveClientError;

  beforeEach(async () => {
    vi.resetModules();
    ({ db } = await import("@/lib/db"));
    schema = await import("@/lib/db/schema");
    ({ connectWhatsappForUser } = await import("./whatsapp"));
    ({ connectWhatsapp, NerveClientError } = (await import("./client")) as unknown as {
      connectWhatsapp: ReturnType<typeof vi.fn>;
      NerveClientError: typeof import("./client").NerveClientError;
    });
    connectWhatsapp.mockReset();

    await db.delete(schema.consultationRequests);
    await db.delete(schema.whatsappIntegrations);
    await db.delete(schema.productAccess);
    await db.delete(schema.organizationMembers);
    await db.delete(schema.organizations);
    await db.delete(schema.users);
  });

  afterAll(async () => {
    const client = (await import("@/lib/db")).db;
    await client.$client.end();
  });

  async function createOrgWithNerveBusiness(label: string, businessId: string) {
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
    const [access] = await db
      .insert(schema.productAccess)
      .values({
        organizationId: organization.id,
        productSlug: "nerve",
        status: "provisioning",
        externalReference: businessId,
      })
      .returning();
    return { user, organization, access };
  }

  const input = { code: "fake-code", wabaId: "waba-1", phoneNumberId: "phone-1" };

  it("A: fails safely when the user has no organization", async () => {
    const [user] = await db
      .insert(schema.users)
      .values({
        name: "Orphan",
        email: `orphan-${Math.random().toString(36).slice(2)}@example.com`,
        passwordHash: "irrelevant",
        role: "client",
      })
      .returning();

    const result = await connectWhatsappForUser(user.id, input);

    expect(result.status).toBe("failed");
    expect(connectWhatsapp).not.toHaveBeenCalled();
  });

  it("B: fails safely when Nerve has not been requested yet (no ProductAccess row)", async () => {
    const [user] = await db
      .insert(schema.users)
      .values({
        name: "NoNerve",
        email: `nonerve-${Math.random().toString(36).slice(2)}@example.com`,
        passwordHash: "irrelevant",
        role: "client",
      })
      .returning();
    const [organization] = await db.insert(schema.organizations).values({ name: "No Nerve Org" }).returning();
    await db
      .insert(schema.organizationMembers)
      .values({ organizationId: organization.id, userId: user.id, role: "owner" });

    const result = await connectWhatsappForUser(user.id, input);

    expect(result.status).toBe("failed");
    expect(connectWhatsapp).not.toHaveBeenCalled();
  });

  it("C: fails safely when Nerve is still provisioning (no externalReference yet)", async () => {
    const { user, organization } = await createOrgWithNerveBusiness("Pending", "biz-pending");
    await db
      .update(schema.productAccess)
      .set({ externalReference: null })
      .where(eq(schema.productAccess.organizationId, organization.id));

    const result = await connectWhatsappForUser(user.id, input);

    expect(result.status).toBe("failed");
    expect(connectWhatsapp).not.toHaveBeenCalled();
  });

  it("D: connects successfully, persists safe metadata, and flips ProductAccess to active", async () => {
    const { user, organization, access } = await createOrgWithNerveBusiness("Active", "biz-active");
    connectWhatsapp.mockResolvedValueOnce({
      businessId: "biz-active",
      wabaId: "waba-1",
      phoneNumberId: "phone-1",
      displayPhoneNumber: "+1 555 0100",
      verifiedName: "Acme Dental",
      connectedAt: "2026-08-28T12:00:00.000000Z",
    });

    const result = await connectWhatsappForUser(user.id, input);

    expect(result.status).toBe("connected");
    expect(connectWhatsapp).toHaveBeenCalledExactlyOnceWith("biz-active", input);

    const [integration] = await db
      .select()
      .from(schema.whatsappIntegrations)
      .where(eq(schema.whatsappIntegrations.productAccessId, access.id));
    expect(integration.status).toBe("connected");
    expect(integration.wabaId).toBe("waba-1");
    expect(integration.phoneNumberId).toBe("phone-1");
    expect(integration.displayPhoneNumber).toBe("+1 555 0100");
    expect(integration.businessDisplayName).toBe("Acme Dental");
    expect(integration.connectedAt).not.toBeNull();

    const [productAccessRow] = await db
      .select()
      .from(schema.productAccess)
      .where(eq(schema.productAccess.organizationId, organization.id));
    expect(productAccessRow.status).toBe("active");

    // The row never stores a Meta access token -- only safe display metadata.
    expect(JSON.stringify(integration)).not.toMatch(/access_token/i);
  });

  it("E: a second call after already-connected is idempotent and does not call Nerve again", async () => {
    const { user } = await createOrgWithNerveBusiness("Idempotent", "biz-idempotent");
    connectWhatsapp.mockResolvedValueOnce({
      businessId: "biz-idempotent",
      wabaId: "waba-1",
      phoneNumberId: "phone-1",
      displayPhoneNumber: null,
      verifiedName: null,
      connectedAt: "2026-08-28T12:00:00.000000Z",
    });

    await connectWhatsappForUser(user.id, input);
    const second = await connectWhatsappForUser(user.id, input);

    expect(second.status).toBe("connected");
    expect(connectWhatsapp).toHaveBeenCalledTimes(1);
  });

  it("F: Nerve failure marks the integration failed with a safe, generic message", async () => {
    const { user, access } = await createOrgWithNerveBusiness("Failing", "biz-failing");
    connectWhatsapp.mockRejectedValueOnce(new Error("Could not reach Nerve."));

    const result = await connectWhatsappForUser(user.id, input);

    expect(result.status).toBe("failed");
    expect(result.message).toBe("We couldn't connect WhatsApp right now. Please try again.");

    const [integration] = await db
      .select()
      .from(schema.whatsappIntegrations)
      .where(eq(schema.whatsappIntegrations.productAccessId, access.id));
    expect(integration.status).toBe("failed");
    expect(integration.failureReason).toBe(result.message);
  });

  it("G: a 409 from Nerve (number already connected elsewhere) maps to a safe, specific message", async () => {
    const { user } = await createOrgWithNerveBusiness("Conflict", "biz-conflict");
    connectWhatsapp.mockRejectedValueOnce(
      new NerveClientError("http", "This WhatsApp number is already connected to a different business.", 409)
    );

    const result = await connectWhatsappForUser(user.id, input);

    expect(result.status).toBe("failed");
    expect(result.message).toMatch(/already connected elsewhere/i);
  });

  it("H: a failed attempt can be retried and succeeds on the next call", async () => {
    const { user, organization } = await createOrgWithNerveBusiness("Retry", "biz-retry");
    connectWhatsapp.mockRejectedValueOnce(new Error("Could not reach Nerve."));
    connectWhatsapp.mockResolvedValueOnce({
      businessId: "biz-retry",
      wabaId: "waba-1",
      phoneNumberId: "phone-1",
      displayPhoneNumber: null,
      verifiedName: null,
      connectedAt: "2026-08-28T12:00:00.000000Z",
    });

    const first = await connectWhatsappForUser(user.id, input);
    expect(first.status).toBe("failed");

    const second = await connectWhatsappForUser(user.id, input);
    expect(second.status).toBe("connected");

    const [productAccessRow] = await db
      .select()
      .from(schema.productAccess)
      .where(eq(schema.productAccess.organizationId, organization.id));
    expect(productAccessRow.status).toBe("active");
  });

  it("never touches another organization's WhatsApp integration or ProductAccess row", async () => {
    const { user: userA, access: accessA } = await createOrgWithNerveBusiness("IsoA", "biz-iso-a");
    const { access: accessB } = await createOrgWithNerveBusiness("IsoB", "biz-iso-b");
    connectWhatsapp.mockResolvedValueOnce({
      businessId: "biz-iso-a",
      wabaId: "waba-a",
      phoneNumberId: "phone-a",
      displayPhoneNumber: null,
      verifiedName: null,
      connectedAt: "2026-08-28T12:00:00.000000Z",
    });

    await connectWhatsappForUser(userA.id, input);

    expect(connectWhatsapp).toHaveBeenCalledExactlyOnceWith("biz-iso-a", input);

    const [integrationB] = await db
      .select()
      .from(schema.whatsappIntegrations)
      .where(eq(schema.whatsappIntegrations.productAccessId, accessB.id));
    expect(integrationB).toBeUndefined();

    const [productAccessB] = await db
      .select()
      .from(schema.productAccess)
      .where(eq(schema.productAccess.id, accessB.id));
    expect(productAccessB.status).toBe("provisioning");

    // sanity: business A's own row really did get updated
    const [integrationA] = await db
      .select()
      .from(schema.whatsappIntegrations)
      .where(eq(schema.whatsappIntegrations.productAccessId, accessA.id));
    expect(integrationA.status).toBe("connected");
  });
});
