"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { organizationMembers, organizations, users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/password";
import { normalizeEmail } from "@/lib/normalize-email";
import { signIn } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export type SignupFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const MAX_LENGTHS = {
  name: 200,
  email: 254,
  password: 200,
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signup(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(`signup:${ip}`, { windowMs: 10 * 60 * 1000, maxRequests: 5 })) {
    return {
      status: "error",
      message: "Too many attempts. Please try again later.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};

  if (!name) fieldErrors.name = "This field is required.";
  else if (name.length > MAX_LENGTHS.name) fieldErrors.name = "Keep this under 200 characters.";

  if (!email) fieldErrors.email = "This field is required.";
  else if (!isValidEmail(email)) fieldErrors.email = "Enter a valid email address.";
  else if (email.length > MAX_LENGTHS.email) fieldErrors.email = "Keep this under 254 characters.";

  if (!password) fieldErrors.password = "This field is required.";
  else if (password.length < 8) fieldErrors.password = "Use at least 8 characters.";
  else if (password.length > MAX_LENGTHS.password) fieldErrors.password = "Keep this under 200 characters.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return {
      status: "error",
      message: "An account with this email already exists.",
      fieldErrors: { email: "This email is already registered." },
    };
  }

  const passwordHash = await hashPassword(password);

  try {
    await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ name, email, passwordHash, role: "client" })
        .returning({ id: users.id });

      const [organization] = await tx
        .insert(organizations)
        .values({ name: `${name}'s Organization` })
        .returning({ id: organizations.id });

      await tx.insert(organizationMembers).values({
        organizationId: organization.id,
        userId: user.id,
        role: "owner",
      });
    });
  } catch (error) {
    // Unique violation on email (race with a concurrent signup) — the
    // pre-check above already handles the common case.
    console.error("Signup failed", error);
    return {
      status: "error",
      message: "An account with this email already exists.",
      fieldErrors: { email: "This email is already registered." },
    };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Account created, but automatic sign-in failed. Please log in.",
      };
    }
    throw error;
  }

  return { status: "idle" };
}
