"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { normalizeEmail } from "@/lib/normalize-email";
import { isRateLimited } from "@/lib/rate-limit";

export type LoginFormState = {
  status: "idle" | "error";
  message?: string;
};

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(`login:${ip}`, { windowMs: 10 * 60 * 1000, maxRequests: 10 })) {
    return {
      status: "error",
      message: "Too many attempts. Please try again later.",
    };
  }

  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Enter your email and password." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: "Invalid email or password." };
    }
    throw error;
  }

  return { status: "idle" };
}
