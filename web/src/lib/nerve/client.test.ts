import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const FAKE_KEY = "super-secret-nerve-key-12345";

function setEnv() {
  process.env.NERVE_API_URL = "https://nerve.internal.test";
  process.env.NERVE_API_KEY = FAKE_KEY;
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

function textResponse(raw: string, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => raw,
  } as Response;
}

describe("nerve client", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    setEnv();
    vi.stubGlobal("fetch", vi.fn());
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    consoleErrorSpy.mockRestore();
    process.env = { ...ORIGINAL_ENV };
  });

  function assertNoSecretLeaked(...haystacks: unknown[]) {
    for (const h of haystacks) {
      const text = typeof h === "string" ? h : JSON.stringify(h);
      expect(text).not.toContain(FAKE_KEY);
    }
    for (const call of consoleErrorSpy.mock.calls) {
      expect(JSON.stringify(call)).not.toContain(FAKE_KEY);
    }
  }

  const validBusiness = { business_id: "biz_1", name: "Acme", status: "provisioning" };

  it("provisions a business successfully (201)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(validBusiness, 201));
    const { provisionBusiness } = await import("./client");

    const result = await provisionBusiness({
      externalProvisioningId: "epid_1",
      businessName: "Acme",
      industry: "General",
      description: "test",
      location: "",
      contact: "a@example.com",
    });

    expect(result).toEqual({ businessId: "biz_1", name: "Acme", status: "provisioning" });
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${FAKE_KEY}`);
    assertNoSecretLeaked(result);
  });

  it("treats an idempotent replay (200, same business) as success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ...validBusiness, status: "active" }, 200));
    const { provisionBusiness } = await import("./client");

    const result = await provisionBusiness({
      externalProvisioningId: "epid_1",
      businessName: "Acme",
      industry: "General",
      description: "test",
      location: "",
      contact: "a@example.com",
    });

    expect(result.businessId).toBe("biz_1");
    expect(result.status).toBe("active");
  });

  it("wraps a timeout as a NerveClientError with kind 'timeout'", async () => {
    const timeoutError = new Error("The operation was aborted");
    timeoutError.name = "TimeoutError";
    vi.mocked(fetch).mockRejectedValueOnce(timeoutError);
    const { provisionBusiness } = await import("./client");

    await expect(
      provisionBusiness({
        externalProvisioningId: "epid_1",
        businessName: "Acme",
        industry: "General",
        description: "test",
        location: "",
        contact: "a@example.com",
      })
    ).rejects.toMatchObject({ kind: "timeout" });
    assertNoSecretLeaked();
  });

  it("wraps a network failure as kind 'network'", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("fetch failed"));
    const { getBusiness } = await import("./client");

    await expect(getBusiness("biz_1")).rejects.toMatchObject({ kind: "network" });
    assertNoSecretLeaked();
  });

  it.each([401, 403, 404, 409, 422, 500])("maps a %d response to kind 'http'", async (status) => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ error: "denied", secret: FAKE_KEY }, status));
    const { getBusiness } = await import("./client");

    await expect(getBusiness("biz_1")).rejects.toMatchObject({ kind: "http", status });
    assertNoSecretLeaked();
  });

  it("rejects malformed (non-JSON) responses as kind 'invalid_response'", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(textResponse("<html>not json</html>", 200));
    const { getBusiness } = await import("./client");

    await expect(getBusiness("biz_1")).rejects.toMatchObject({ kind: "invalid_response" });
  });

  it("rejects a response missing required fields as kind 'invalid_response'", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ business_id: "biz_1" }, 200));
    const { getBusiness } = await import("./client");

    await expect(getBusiness("biz_1")).rejects.toMatchObject({ kind: "invalid_response" });
  });

  it("rejects a response with an invalid status enum as kind 'invalid_response'", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ business_id: "biz_1", name: "Acme", status: "deleted" }, 200)
    );
    const { getBusiness } = await import("./client");

    await expect(getBusiness("biz_1")).rejects.toMatchObject({ kind: "invalid_response" });
  });

  it("throws a config error without revealing which variable is missing", async () => {
    delete process.env.NERVE_API_URL;
    delete process.env.NERVE_API_KEY;
    const { getBusiness } = await import("./client");

    await expect(getBusiness("biz_1")).rejects.toMatchObject({ kind: "config" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("never includes the API key in a thrown error's message", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ error: "denied" }, 401));
    const { getBusiness } = await import("./client");

    try {
      await getBusiness("biz_1");
      expect.unreachable();
    } catch (error) {
      assertNoSecretLeaked((error as Error).message, error);
    }
  });

  describe("connectWhatsapp", () => {
    const validConnection = {
      business_id: "biz_1",
      status: "connected",
      waba_id: "waba_1",
      phone_number_id: "phone_1",
      display_phone_number: "+1 555 0100",
      verified_name: "Acme Dental",
      connected_at: "2026-08-28T12:00:00.000000Z",
    };

    it("connects successfully and never sends a Meta access token in the request", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(validConnection, 200));
      const { connectWhatsapp } = await import("./client");

      const result = await connectWhatsapp("biz_1", {
        code: "fake-embedded-signup-code",
        wabaId: "waba_1",
        phoneNumberId: "phone_1",
      });

      expect(result).toEqual({
        businessId: "biz_1",
        wabaId: "waba_1",
        phoneNumberId: "phone_1",
        displayPhoneNumber: "+1 555 0100",
        verifiedName: "Acme Dental",
        connectedAt: "2026-08-28T12:00:00.000000Z",
      });

      const [url, init] = vi.mocked(fetch).mock.calls[0];
      expect(String(url)).toContain("/api/v1/businesses/biz_1/whatsapp");
      const body = JSON.parse(String(init?.body));
      expect(Object.keys(body)).toEqual(["code", "waba_id", "phone_number_id"]);
      expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${FAKE_KEY}`);
    });

    it("maps a 409 conflict to kind 'http' with status 409", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        jsonResponse({ detail: "This WhatsApp number is already connected to a different business." }, 409)
      );
      const { connectWhatsapp } = await import("./client");

      await expect(
        connectWhatsapp("biz_1", { code: "c", wabaId: "w", phoneNumberId: "p" })
      ).rejects.toMatchObject({ kind: "http", status: 409 });
      assertNoSecretLeaked();
    });

    it("rejects a response missing required fields as kind 'invalid_response'", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ business_id: "biz_1" }, 200));
      const { connectWhatsapp } = await import("./client");

      await expect(
        connectWhatsapp("biz_1", { code: "c", wabaId: "w", phoneNumberId: "p" })
      ).rejects.toMatchObject({ kind: "invalid_response" });
    });

    it("never leaks the Nerve API key through a connectWhatsapp failure", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ detail: "Could not complete WhatsApp onboarding." }, 502));
      const { connectWhatsapp } = await import("./client");

      try {
        await connectWhatsapp("biz_1", { code: "c", wabaId: "w", phoneNumberId: "p" });
        expect.unreachable();
      } catch (error) {
        assertNoSecretLeaked((error as Error).message, error);
      }
    });
  });
});
