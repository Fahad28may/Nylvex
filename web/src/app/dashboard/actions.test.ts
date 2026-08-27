import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("@/lib/nerve/provisioning", () => ({
  requestNerveProvisioning: vi.fn(),
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
});
