"use client";

import posthog from "posthog-js";

let initialized = false;

function ensureInit() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || initialized) return initialized;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: true,
    persistence: "localStorage+cookie",
  });
  initialized = true;
  return true;
}

export type AnalyticsEvent =
  | "project_view"
  | "project_demo_click"
  | "github_click"
  | "contact_started"
  | "contact_submitted"
  | "capability_view"
  | "lab_demo_click";

export function trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (!ensureInit()) return;
  posthog.capture(event, properties);
}
