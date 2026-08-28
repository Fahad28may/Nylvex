import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("@/lib/nerve/provisioning", () => ({
  requestNerveProvisioning: vi.fn(),
}));
vi.mock("@/lib/nerve/whatsapp", () => ({
  connectWhatsappForUser: vi.fn(),
}));
// Mocked so tests are independent of the real limiter's shared in-memory
// state (which would otherwise let one test's calls exhaust another
// test's budget for the same mocked user id) -- rate-limited behavior
// itself is tested explicitly below with this mock instead.
vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: vi.fn(() => false),
}));

describe("requestNerve server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("takes no arguments — there is no parameter a client could use to target another org", async () => {
    const { requestNerve } = await import("./actions");
    expect(requestNerve.length).toBe(0);
  });

  it("refuses to provision when there is no session (logged-out user)", async () => {
    const { auth } = await import("@/lib/auth");
    const { requestNerveProvisioning } = await import("@/lib/nerve/provisioning");
    (auth as unknown as Mock).mockResolvedValueOnce(null);

    const { requestNerve } = await import("./actions");
    const result = await requestNerve();

    expect(result.status).toBe("failed");
    expect(requestNerveProvisioning).not.toHaveBeenCalled();
  });

  it("only ever passes the authenticated session's own userId, never anything client-supplied", async () => {
    const { auth } = await import("@/lib/auth");
    const { requestNerveProvisioning } = await import("@/lib/nerve/provisioning");
    (auth as unknown as Mock).mockResolvedValueOnce({
      user: { id: "user-123", role: "client", name: "Test", email: "test@example.com" },
      expires: "2099-01-01",
    });
    vi.mocked(requestNerveProvisioning).mockResolvedValueOnce({ status: "requested" });

    const { requestNerve } = await import("./actions");
    await requestNerve();

    expect(requestNerveProvisioning).toHaveBeenCalledExactlyOnceWith("user-123");
  });

  it("never returns a NERVE_API_KEY-shaped field to the caller", async () => {
    const { auth } = await import("@/lib/auth");
    const { requestNerveProvisioning } = await import("@/lib/nerve/provisioning");
    (auth as unknown as Mock).mockResolvedValueOnce({
      user: { id: "user-123", role: "client", name: "Test", email: "test@example.com" },
      expires: "2099-01-01",
    });
    vi.mocked(requestNerveProvisioning).mockResolvedValueOnce({ status: "active" });

    const { requestNerve } = await import("./actions");
    const result = await requestNerve();

    expect(Object.keys(result)).not.toContain("apiKey");
    expect(JSON.stringify(result)).not.toMatch(/nerve_api_key/i);
  });

  it("refuses to provision when rate limited, without calling the service", async () => {
    const { auth } = await import("@/lib/auth");
    const { requestNerveProvisioning } = await import("@/lib/nerve/provisioning");
    const { isRateLimited } = await import("@/lib/rate-limit");
    (auth as unknown as Mock).mockResolvedValueOnce({
      user: { id: "user-123", role: "client", name: "Test", email: "test@example.com" },
      expires: "2099-01-01",
    });
    vi.mocked(isRateLimited).mockReturnValueOnce(true);

    const { requestNerve } = await import("./actions");
    const result = await requestNerve();

    expect(result.status).toBe("failed");
    expect(requestNerveProvisioning).not.toHaveBeenCalled();
  });
});

describe("connectWhatsapp server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validInput = { code: "fake-code", wabaId: "waba-1", phoneNumberId: "phone-1" };

  it("takes only code/wabaId/phoneNumberId — no organizationId/businessId parameter exists", async () => {
    const { connectWhatsapp } = await import("./actions");
    expect(connectWhatsapp.length).toBe(1);
  });

  it("refuses to connect when there is no session (logged-out user)", async () => {
    const { auth } = await import("@/lib/auth");
    const { connectWhatsappForUser } = await import("@/lib/nerve/whatsapp");
    (auth as unknown as Mock).mockResolvedValueOnce(null);

    const { connectWhatsapp } = await import("./actions");
    const result = await connectWhatsapp(validInput);

    expect(result.status).toBe("failed");
    expect(connectWhatsappForUser).not.toHaveBeenCalled();
  });

  it("only ever passes the authenticated session's own userId, never anything client-supplied", async () => {
    const { auth } = await import("@/lib/auth");
    const { connectWhatsappForUser } = await import("@/lib/nerve/whatsapp");
    (auth as unknown as Mock).mockResolvedValueOnce({
      user: { id: "user-123", role: "client", name: "Test", email: "test@example.com" },
      expires: "2099-01-01",
    });
    vi.mocked(connectWhatsappForUser).mockResolvedValueOnce({ status: "connected" });

    const { connectWhatsapp } = await import("./actions");
    await connectWhatsapp(validInput);

    expect(connectWhatsappForUser).toHaveBeenCalledExactlyOnceWith("user-123", validInput);
  });

  it.each([
    { code: "", wabaId: "w", phoneNumberId: "p" },
    { code: "c", wabaId: "", phoneNumberId: "p" },
    { code: "c", wabaId: "w", phoneNumberId: "" },
    { code: 123, wabaId: "w", phoneNumberId: "p" },
  ])("rejects malformed input %o before calling the service", async (badInput) => {
    const { auth } = await import("@/lib/auth");
    const { connectWhatsappForUser } = await import("@/lib/nerve/whatsapp");
    (auth as unknown as Mock).mockResolvedValueOnce({
      user: { id: "user-123", role: "client", name: "Test", email: "test@example.com" },
      expires: "2099-01-01",
    });

    const { connectWhatsapp } = await import("./actions");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await connectWhatsapp(badInput as any);

    expect(result.status).toBe("failed");
    expect(connectWhatsappForUser).not.toHaveBeenCalled();
  });

  it("never returns a Meta access token or Nerve API key to the caller", async () => {
    const { auth } = await import("@/lib/auth");
    const { connectWhatsappForUser } = await import("@/lib/nerve/whatsapp");
    (auth as unknown as Mock).mockResolvedValueOnce({
      user: { id: "user-123", role: "client", name: "Test", email: "test@example.com" },
      expires: "2099-01-01",
    });
    vi.mocked(connectWhatsappForUser).mockResolvedValueOnce({ status: "connected" });

    const { connectWhatsapp } = await import("./actions");
    const result = await connectWhatsapp(validInput);

    expect(JSON.stringify(result)).not.toMatch(/access_token|nerve_api_key/i);
  });

  it("refuses to connect when rate limited, without calling the service", async () => {
    const { auth } = await import("@/lib/auth");
    const { connectWhatsappForUser } = await import("@/lib/nerve/whatsapp");
    const { isRateLimited } = await import("@/lib/rate-limit");
    (auth as unknown as Mock).mockResolvedValueOnce({
      user: { id: "user-123", role: "client", name: "Test", email: "test@example.com" },
      expires: "2099-01-01",
    });
    vi.mocked(isRateLimited).mockReturnValueOnce(true);

    const { connectWhatsapp } = await import("./actions");
    const result = await connectWhatsapp(validInput);

    expect(result.status).toBe("failed");
    expect(connectWhatsappForUser).not.toHaveBeenCalled();
  });
});
