"use server";

import { revalidatePath } from "next/cache";
import { signOut, auth } from "@/lib/auth";
import { requestNerveProvisioning, type NerveProvisioningResult } from "@/lib/nerve/provisioning";
import { connectWhatsappForUser, type WhatsappConnectResult } from "@/lib/nerve/whatsapp";
import { isRateLimited } from "@/lib/rate-limit";

const TOO_MANY_REQUESTS_MESSAGE = "Too many attempts. Please wait a moment and try again.";

export async function logout() {
  await signOut({ redirectTo: "/" });
}

// Deliberately takes no arguments — the organization and product are always
// derived from the authenticated session, never from client input, so there
// is no parameter here a browser could use to target another org's access.
export async function requestNerve(): Promise<NerveProvisioningResult> {
  const session = await auth();
  if (!session?.user) {
    return { status: "failed", message: "You must be logged in to request Nerve." };
  }

  // Keyed per authenticated user (not IP) since this action already
  // requires a session -- defense in depth against a compromised/looping
  // client hammering Nerve's provisioning endpoint, independent of
  // whatever limiting Nerve applies on its own side.
  if (isRateLimited(`request-nerve:${session.user.id}`)) {
    return { status: "failed", message: TOO_MANY_REQUESTS_MESSAGE };
  }

  const result = await requestNerveProvisioning(session.user.id);
  revalidatePath("/dashboard");
  return result;
}

export type ConnectWhatsappInput = {
  code: string;
  wabaId: string;
  phoneNumberId: string;
};

// Takes only what the browser captured from Meta's Embedded Signup
// completion event -- a short-lived authorization code and Meta's own
// WABA/phone number identifiers, never a Meta access token (this browser
// never has one) and never an organization/business id (always derived
// from the authenticated session, exactly like requestNerve above).
export async function connectWhatsapp(input: ConnectWhatsappInput): Promise<WhatsappConnectResult> {
  const session = await auth();
  if (!session?.user) {
    return { status: "failed", message: "You must be logged in to connect WhatsApp." };
  }

  if (
    typeof input?.code !== "string" ||
    !input.code ||
    typeof input?.wabaId !== "string" ||
    !input.wabaId ||
    typeof input?.phoneNumberId !== "string" ||
    !input.phoneNumberId
  ) {
    return { status: "failed", message: "Missing data from WhatsApp connection. Please try again." };
  }

  if (isRateLimited(`connect-whatsapp:${session.user.id}`)) {
    return { status: "failed", message: TOO_MANY_REQUESTS_MESSAGE };
  }

  const result = await connectWhatsappForUser(session.user.id, input);
  revalidatePath("/dashboard");
  return result;
}
