"use server";

import { headers } from "next/headers";
import { isRateLimited } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const REQUIRED_FIELDS = ["name", "email", "project", "problem"] as const;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot: real users never fill this hidden field.
  if (formData.get("company_website")) {
    return { status: "success" };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return {
      status: "error",
      message: "Too many submissions. Please try again later, or email us directly.",
    };
  }

  const fields = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    companyName: String(formData.get("companyName") ?? "").trim(),
    project: String(formData.get("project") ?? "").trim(),
    problem: String(formData.get("problem") ?? "").trim(),
    existingSystem: String(formData.get("existingSystem") ?? "").trim(),
    integrations: String(formData.get("integrations") ?? "").trim(),
    budget: String(formData.get("budget") ?? "").trim(),
    timeline: String(formData.get("timeline") ?? "").trim(),
  };

  const fieldErrors: Record<string, string> = {};
  for (const field of REQUIRED_FIELDS) {
    if (!fields[field]) {
      fieldErrors[field] = "This field is required.";
    }
  }
  if (fields.email && !isValidEmail(fields.email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Nylvex <notifications@${new URL(siteConfig.url).hostname}>`,
          to: siteConfig.email,
          reply_to: fields.email,
          subject: `New project inquiry from ${fields.name}`,
          text: [
            `Name: ${fields.name}`,
            `Email: ${fields.email}`,
            `Company: ${fields.companyName || "—"}`,
            `Project: ${fields.project}`,
            `Problem: ${fields.problem}`,
            `Existing system: ${fields.existingSystem || "—"}`,
            `Integrations: ${fields.integrations || "—"}`,
            `Budget: ${fields.budget || "—"}`,
            `Timeline: ${fields.timeline || "—"}`,
          ].join("\n"),
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend responded with ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to send contact form email", error);
      return {
        status: "error",
        message: "Something went wrong sending your message. Please email us directly.",
      };
    }
  } else {
    console.info("Contact form submission received (email delivery not configured):", fields);
  }

  return {
    status: "success",
    message: "Thanks — I'll get back to you shortly.",
  };
}
