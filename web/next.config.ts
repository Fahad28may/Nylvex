import type { NextConfig } from "next";

const posthogHosts = new Set(["https://us.i.posthog.com", "https://us-assets.i.posthog.com"]);
if (process.env.NEXT_PUBLIC_POSTHOG_HOST) {
  posthogHosts.add(process.env.NEXT_PUBLIC_POSTHOG_HOST);
}

const contentSecurityPolicy = [
  "default-src 'self'",
  // Inline scripts here are limited to the theme-init snippet and the
  // homepage JSON-LD block — both static, developer-authored, and never
  // interpolate user input. A per-request nonce would be stronger, but in
  // Next's App Router that requires calling headers() in the root layout,
  // which opts the entire site out of static generation. Not a proportionate
  // trade for two inline scripts with no user-controlled content.
  // 'unsafe-eval' is dev-only: React's dev mode uses eval() for component
  // stack traces and never does in production (React's own diagnostic
  // message confirms this), so it's dropped from the production policy.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self' ${[...posthogHosts].join(" ")}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
