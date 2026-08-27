"use server";

import { revalidatePath } from "next/cache";
import { signOut, auth } from "@/lib/auth";
import { requestNerveProvisioning, type NerveProvisioningResult } from "@/lib/nerve/provisioning";

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

  const result = await requestNerveProvisioning(session.user.id);
  revalidatePath("/dashboard");
  return result;
}
