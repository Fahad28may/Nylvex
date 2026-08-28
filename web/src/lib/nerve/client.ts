import "server-only";

const REQUEST_TIMEOUT_MS = 10_000;

export type NerveBusinessStatus = "provisioning" | "active";

export type NerveBusiness = {
  businessId: string;
  name: string;
  status: NerveBusinessStatus;
};

export type NerveBusinessSummary = Record<string, unknown>;

export type NerveProvisionInput = {
  externalProvisioningId: string;
  businessName: string;
  industry: string;
  description: string;
  location: string;
  contact: string;
};

export type NerveErrorKind =
  | "config"
  | "timeout"
  | "network"
  | "http"
  | "invalid_response";

export class NerveClientError extends Error {
  readonly kind: NerveErrorKind;
  readonly status?: number;

  constructor(kind: NerveErrorKind, message: string, status?: number) {
    super(message);
    this.name = "NerveClientError";
    this.kind = kind;
    this.status = status;
  }
}

function getConfig() {
  const baseUrl = process.env.NERVE_API_URL;
  const apiKey = process.env.NERVE_API_KEY;

  if (!baseUrl || !apiKey) {
    // Deliberately generic — this must never hint at which var is missing
    // in a way that could leak into a user-facing surface.
    throw new NerveClientError("config", "Nerve integration is not configured.");
  }

  return { baseUrl, apiKey };
}

async function nerveFetch(path: string, init: RequestInit): Promise<unknown> {
  const { baseUrl, apiKey } = getConfig();

  let response: Response;
  try {
    response = await fetch(new URL(path, baseUrl), {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        ...init.headers,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  } catch (error) {
    // fetch() throws on network failure and on AbortSignal.timeout() firing.
    // The underlying error is logged (no headers, no key) but never surfaced
    // to the caller as-is, since some runtimes attach request details to it.
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    console.error(`Nerve request failed (${isTimeout ? "timeout" : "network"})`, path);
    throw new NerveClientError(
      isTimeout ? "timeout" : "network",
      isTimeout ? "Nerve did not respond in time." : "Could not reach Nerve."
    );
  }

  const rawBody = await response.text();
  let parsed: unknown;
  try {
    parsed = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    console.error("Nerve returned a non-JSON response", path, response.status);
    throw new NerveClientError("invalid_response", "Nerve returned an unexpected response.");
  }

  if (!response.ok) {
    // Log the status and path for diagnostics, never the response body
    // verbatim (it may contain internal details) and never the Authorization
    // header or key.
    console.error("Nerve returned an error response", path, response.status);
    throw new NerveClientError(
      "http",
      `Nerve request failed with status ${response.status}.`,
      response.status
    );
  }

  return parsed;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function parseBusiness(payload: unknown, context: string): NerveBusiness {
  if (
    !payload ||
    typeof payload !== "object" ||
    !isNonEmptyString((payload as Record<string, unknown>).business_id) ||
    !isNonEmptyString((payload as Record<string, unknown>).name) ||
    ((payload as Record<string, unknown>).status !== "provisioning" &&
      (payload as Record<string, unknown>).status !== "active")
  ) {
    console.error("Nerve response failed shape validation", context);
    throw new NerveClientError("invalid_response", "Nerve returned an unexpected response.");
  }

  const record = payload as { business_id: string; name: string; status: NerveBusinessStatus };
  return { businessId: record.business_id, name: record.name, status: record.status };
}

export async function provisionBusiness(input: NerveProvisionInput): Promise<NerveBusiness> {
  const payload = await nerveFetch("/api/v1/businesses", {
    method: "POST",
    body: JSON.stringify({
      external_provisioning_id: input.externalProvisioningId,
      business_name: input.businessName,
      industry: input.industry,
      description: input.description,
      location: input.location,
      contact: input.contact,
    }),
  });

  return parseBusiness(payload, "provisionBusiness");
}

export async function getBusiness(businessId: string): Promise<NerveBusiness> {
  const payload = await nerveFetch(`/api/v1/businesses/${encodeURIComponent(businessId)}`, {
    method: "GET",
  });

  return parseBusiness(payload, "getBusiness");
}

export type NerveWhatsappConnectInput = {
  code: string;
  wabaId: string;
  phoneNumberId: string;
};

export type NerveWhatsappConnection = {
  businessId: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  connectedAt: string;
};

function parseWhatsappConnection(payload: unknown, context: string): NerveWhatsappConnection {
  if (
    !payload ||
    typeof payload !== "object" ||
    !isNonEmptyString((payload as Record<string, unknown>).business_id) ||
    !isNonEmptyString((payload as Record<string, unknown>).waba_id) ||
    !isNonEmptyString((payload as Record<string, unknown>).phone_number_id) ||
    !isNonEmptyString((payload as Record<string, unknown>).connected_at)
  ) {
    console.error("Nerve whatsapp response failed shape validation", context);
    throw new NerveClientError("invalid_response", "Nerve returned an unexpected response.");
  }

  const record = payload as {
    business_id: string;
    waba_id: string;
    phone_number_id: string;
    display_phone_number: unknown;
    verified_name: unknown;
    connected_at: string;
  };

  return {
    businessId: record.business_id,
    wabaId: record.waba_id,
    phoneNumberId: record.phone_number_id,
    displayPhoneNumber: isNonEmptyString(record.display_phone_number) ? record.display_phone_number : null,
    verifiedName: isNonEmptyString(record.verified_name) ? record.verified_name : null,
    connectedAt: record.connected_at,
  };
}

// `input.code` is the short-lived (30s TTL), single-use Embedded Signup
// authorization code from Meta -- never a Meta access token, which this
// client (and Nylvex generally) never holds. Nerve owns the code exchange
// server-side; see docs/NERVE_INTEGRATION.md and Nerve's own
// docs/NYLVEX_API.md §8a.
export async function connectWhatsapp(
  businessId: string,
  input: NerveWhatsappConnectInput
): Promise<NerveWhatsappConnection> {
  const payload = await nerveFetch(`/api/v1/businesses/${encodeURIComponent(businessId)}/whatsapp`, {
    method: "POST",
    body: JSON.stringify({
      code: input.code,
      waba_id: input.wabaId,
      phone_number_id: input.phoneNumberId,
    }),
  });

  return parseWhatsappConnection(payload, "connectWhatsapp");
}

export async function getBusinessSummary(businessId: string): Promise<NerveBusinessSummary> {
  const payload = await nerveFetch(
    `/api/v1/businesses/${encodeURIComponent(businessId)}/summary`,
    { method: "GET" }
  );

  if (!payload || typeof payload !== "object") {
    console.error("Nerve summary response failed shape validation");
    throw new NerveClientError("invalid_response", "Nerve returned an unexpected response.");
  }

  return payload as NerveBusinessSummary;
}
