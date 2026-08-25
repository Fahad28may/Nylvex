# Nylvex — Security Audit & Hardening Report

**Date:** 2026-08-25
**Scope:** Full repository (`web/` Next.js app, `.github/workflows/`, root config) as of commit prior to this audit.
**Method:** Manual code review of every server-reachable surface, dependency scanning, git history inspection, and functional verification of every fix against a running dev and production build (not just static review).

This report documents what was actually inspected, what was found, what was fixed and verified, and what remains a judgment call or residual risk. Nylvex is a marketing/portfolio site with no authentication, no database, and no user-generated content rendered back to other users — the scope of this audit reflects that actual architecture rather than a generic checklist.

---

## Executive Summary

No secrets are committed anywhere in the working tree or git history. Dependencies have zero known vulnerabilities (`npm audit`: 0 findings). Two real, confirmed vulnerabilities were found and fixed: an unauthenticated AI endpoint with no rate limiting (denial-of-wallet risk) and a contact form with no server-side field length limits. A full set of HTTP security headers, including a tailored Content-Security-Policy, has been added where none existed before. GitHub Actions now runs with least-privilege permissions.

Nylvex has no authentication system, no database, no file uploads, no webhooks, no MCP implementation, and no Docker configuration — those sections of the audit are marked not applicable rather than padded with theoretical findings.

---

## Scope

Inspected:
- `web/src/app/**` — all pages, layouts, API routes, server actions
- `web/src/components/**`, `web/src/lib/**`, `web/src/data/**`
- `web/package.json` / `package-lock.json` (dependency audit)
- `web/next.config.ts`, `web/tsconfig.json`, `web/eslint.config.mjs`
- `.env.example`, `.gitignore` (root and `web/`)
- `.github/workflows/ci.yml`
- Full git history (`git log --all -p`) for accidentally committed secrets
- `robots.ts`, `sitemap.ts`, generated icon/OG image routes

Not applicable to this codebase (verified absent, not assumed):
- Authentication/authorization, sessions, cookies — no auth system exists
- SQL/database — no database is used
- File uploads — none implemented
- SSRF via user-supplied URLs — no functionality accepts a URL from a user
- Path traversal / command injection — no filesystem or shell access from request-handling code (confirmed via grep for `fs`, `child_process`, `subprocess`, `exec`, `eval`)
- Open redirects — no redirect logic exists, confirmed via grep for `redirect(`/`router.push`/`searchParams`
- CORS — no custom cross-origin API; Next.js Route Handlers default to same-origin only, no CORS headers were added
- File/image upload security, SVG handling — no uploads, no remote image domains configured
- Webhooks, MCP, Docker — none implemented; per the audit's own instruction, not added speculatively

---

## Findings

| Severity | Finding | Status |
|---|---|---|
| HIGH | `/api/ask-nylvex` had no rate limiting on a paid, unauthenticated AI endpoint | Fixed |
| MEDIUM | Contact form had no server-side field length limits | Fixed |
| MEDIUM | No HTTP security headers configured anywhere (no CSP, HSTS, X-Content-Type-Options, etc.) | Fixed |
| LOW | GitHub Actions workflow had no explicit `permissions` block (relied on repo default) | Fixed |
| INFORMATIONAL | GitHub Actions pins official actions by major-version tag (`@v4`), not commit SHA | Documented, not changed |
| INFORMATIONAL | `Content-Security-Policy` permits `'unsafe-inline'` for scripts/styles rather than per-request nonces | Documented, accepted tradeoff |

### HIGH — Denial-of-wallet on `/api/ask-nylvex`

**Location:** `web/src/app/api/ask-nylvex/route.ts`

**Why it matters:** Once `ANTHROPIC_API_KEY` is configured in production, this route makes a real, billed call to Anthropic's Messages API for every request. It was reachable by anyone, unauthenticated, with no per-caller limit.

**Exploit scenario:** A script sending thousands of POST requests to `/api/ask-nylvex` would each trigger a paid Anthropic API call, running up the site owner's API bill and potentially exhausting Anthropic's own rate limits, degrading the feature for legitimate visitors.

**Fix:** Added IP-based rate limiting (8 requests / 10 minutes) reusing the existing in-memory limiter, namespaced separately from the contact form's limiter so the two features don't share a bucket.

**Verification:** Ran 10 rapid requests against a locally running instance (with a dummy API key, so the request path executes fully up to the point of calling Anthropic). Requests 1–8 passed through to the (intentionally invalid) upstream call; requests 9 and 10 correctly received `429 Too Many Requests`. Confirmed the boundary lands exactly at the configured limit.

### MEDIUM — No server-side field length limits on contact form

**Location:** `web/src/app/contact/actions.ts`

**Why it matters:** The server action validated required fields and email format but placed no upper bound on any field's length. Client-side `maxLength` was absent, and even if present is not a security boundary — a direct POST to the server action's endpoint bypasses any client-side restriction entirely.

**Exploit scenario:** Extremely large field values could be used to send oversized outbound emails via the Resend API (cost/quota impact) or bloat server logs when email delivery isn't configured (the fallback path logs submissions to server console).

**Fix:** Added explicit per-field maximum lengths (200–5000 characters depending on field) enforced server-side in the same validation pass as the required-field check, returning a field-level error rather than silently truncating. Matching `maxLength` attributes were also added client-side for UX (not relied upon for security).

**Verification:** Confirmed via browser automation that (1) the client-side `maxLength` caps input at 200 characters for the name field, and (2) after removing the client-side attribute via script to simulate an attacker bypassing it entirely, the server still rejects the oversized submission with the expected error message. The server-side check is the actual enforcement boundary, confirmed independent of the client.

### MEDIUM — No HTTP security headers

**Location:** `web/next.config.ts` (previously an empty config)

**Why it matters:** No `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy` were set anywhere, leaving the site with none of the standard defense-in-depth headers.

**Fix:** Added a full header set via `next.config.ts`'s `headers()` function, applied to every route:
- `Content-Security-Policy` — see the CSP section below for the specific policy and reasoning
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (plus `frame-ancestors 'none'` in the CSP, which modern browsers prefer)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`

**Verification:** Confirmed all six headers are present on responses from both the dev server and a production build (`curl -I`). Ran the full page suite (9 routes, desktop) against the production build afterward and confirmed zero console errors — the policy doesn't silently break anything.

#### Content-Security-Policy specifics

```
default-src 'self';
script-src 'self' 'unsafe-inline' [+ 'unsafe-eval' in development only];
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com [+ NEXT_PUBLIC_POSTHOG_HOST if set];
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

Reasoning for each allowance:
- **`script-src`/`style-src` include `'unsafe-inline'`.** The only inline scripts in the app are a static theme-init snippet and a static JSON-LD block on the homepage — both fully developer-authored, never interpolate user input, and were manually re-reviewed for this audit to confirm that. A per-request nonce (the stricter alternative) requires calling `headers()` in the root layout in Next's App Router, which forces the *entire site* out of static generation. Given there is currently zero XSS injection surface anywhere in the app (verified: the only `dangerouslySetInnerHTML` call renders a static, hardcoded object — confirmed via full-repo grep), trading site-wide static generation for a nonce that protects against a vulnerability class that doesn't exist yet is disproportionate. **If any future feature ever renders user-controlled content as HTML, this tradeoff should be revisited immediately** — `'unsafe-inline'` provides no protection against an actual injected script at that point.
- **`'unsafe-eval'` is added only when `NODE_ENV !== "production"`.** React's development mode uses `eval()` for component stack-trace reconstruction (confirmed via React's own console diagnostic, which explicitly states production never uses it). Verified the production build's CSP header excludes it.
- **`connect-src`** allows PostHog's default ingestion hosts plus whatever `NEXT_PUBLIC_POSTHOG_HOST` is set to, so analytics doesn't silently break if a self-hosted or regional PostHog instance is configured later.
- **`img-src`/`font-src`** are `'self'`-only: `next/font` self-hosts Google Fonts at build time (no external font requests), and there are no remote image domains configured.
- **`frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`** block clickjacking, plugin embeds, `<base>`-tag hijacking, and off-site form submission respectively — none of these are used by the app, so there's no functional cost.

### LOW — GitHub Actions had no explicit permissions

**Location:** `.github/workflows/ci.yml`

**Why it matters:** Without an explicit `permissions` block, a workflow runs with whatever the repository/organization default `GITHUB_TOKEN` scope is, which can be broader than the job needs.

**Fix:** Added `permissions: contents: read` at the workflow level — the job only checks out code, installs dependencies, lints, and builds; it never needs to write to the repo, open PRs, or access other scopes.

**Verification:** Re-validated the YAML (parsed successfully) and confirmed the CI run continues to succeed after the change (a build-and-lint job doesn't need any elevated permission to function).

### Reviewed and confirmed safe (no fix needed)

- **`dangerouslySetInnerHTML` (homepage JSON-LD block):** the only occurrence in the codebase. The object it serializes (`organizationJsonLd`) is built entirely from hardcoded constants in `site-config.ts` — no request data, no user input, ever flows into it.
- **Ask Nylvex prompt injection surface:** the model is given no tools, no function calling, and no filesystem/shell/database access — it's a pure text completion. Even a successful prompt injection could at most cause an off-topic or leaked-system-prompt response, and the system prompt itself contains only the site's own already-public project/capability copy — nothing secret. The client renders the model's answer as plain text (React's default escaping, not `dangerouslySetInnerHTML`), and the only structured behavior — turning `[[slug]]` markers into links — looks the slug up against the site's own static project list and renders nothing if it doesn't match, so a hallucinated or injected slug can't produce an open redirect or arbitrary link.
- **Contact form email injection:** user fields are sent to Resend as JSON (`JSON.stringify`), not interpolated into raw SMTP/MIME headers, so classic CRLF header injection doesn't apply — JSON-encoding escapes control characters as data, not structure.
- **Error handling:** both the contact server action and the Ask Nylvex route catch failures and return generic messages; detailed errors go to `console.error`/`console.info` (server-side only, visible only in Vercel's private function logs), never to the client response body.
- **Secret exposure:** grepped every `process.env` reference in the codebase. `ANTHROPIC_API_KEY` and `RESEND_API_KEY` are read only inside server-only files (a Route Handler and a `"use server"` action); only a derived boolean (`Boolean(process.env.ANTHROPIC_API_KEY)`) ever crosses into a client component, never the key itself.
- **Secrets in git:** searched full history (`git log --all -p`) for API-key-shaped strings and private-key headers — none found. Only `.env.example` (placeholders only) has ever been committed.

---

## Remediations Summary

1. Namespaced and reused the existing rate limiter for `/api/ask-nylvex` (8 req/10 min per IP).
2. Added server-side max-length validation to every contact form field, plus matching client-side `maxLength` for UX.
3. Added a full HTTP security header set (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) via `next.config.ts`, environment-aware for `'unsafe-eval'`.
4. Added `permissions: contents: read` to the CI workflow.

All four were verified against a running instance (dev and/or production build), not just read for correctness.

---

## Remaining Risks

- **`'unsafe-inline'` in the CSP** is an accepted tradeoff, not a gap that was missed — see the CSP reasoning above. Revisit if the app ever renders user-controlled HTML.
- **The in-memory rate limiter resets on redeploy and doesn't share state across serverless instances.** This was true before this audit and remains a known limitation (documented in `lib/rate-limit.ts`). It meaningfully blunts casual scripted abuse but isn't a hard guarantee under Vercel's multi-instance scaling. If abuse becomes a real, observed problem, the fix is a shared store (e.g., Vercel KV or Upstash Redis), not a bigger in-memory map.
- **Contact form fallback logging** writes submitted lead data (name, email, message) to server console when `RESEND_API_KEY` isn't configured, so inquiries aren't silently lost before email delivery is set up. This is intended behavior for the current pre-launch state, visible only in the site owner's own private Vercel logs — but `RESEND_API_KEY` should be configured before real production traffic arrives so this fallback path stops being the primary way leads are captured.
- **GitHub Actions pins official actions by major-version tag**, not commit SHA. `actions/checkout` and `actions/setup-node` are GitHub-maintained, not third-party, so the realistic supply-chain risk is low; SHA-pinning is a further hardening step worth doing but wasn't performed here since it requires verifying exact current SHAs, which this environment can't do reliably.
- **`OPENAI_API_KEY` and `DATABASE_URL` are listed in `.env.example` but unused anywhere in the code.** Not a vulnerability, just noting they're forward-looking placeholders from the original site spec.

---

## Production Recommendations (Vercel / infrastructure)

- Set `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, and `NEXT_PUBLIC_POSTHOG_KEY` as encrypted environment variables in the Vercel project settings — never in a committed file.
- If Ask Nylvex usage grows, consider Anthropic's own per-key spend limits/budget alerts as a second layer on top of the in-app rate limit.
- If contact form or Ask Nylvex abuse is ever observed in Vercel logs, move the rate limiter to a shared store (Vercel KV/Upstash) rather than scaling up the in-memory approach.
- Vercel serves the site over HTTPS by default; the `Strict-Transport-Security` header configured here assumes that and will have no effect if ever self-hosted over plain HTTP.

---

## Final Verification

- `npm audit` — 0 vulnerabilities.
- `npm run lint` — clean.
- `npm run build` — clean, all routes still statically prerendered where they were before (the header changes did not force any route into dynamic rendering).
- Full page sweep (9 routes) against a production build with the new CSP active — all 200, zero console errors.
- Functional regression check after all fixes: architecture-diagram hover, capabilities explorer, work-archive filter, and contact form validation/submission all confirmed working via browser automation, not just visual inspection.
- `git log --all -p` secret scan — clean.

Nylvex is not "100% secure" — no software is. What can be said concretely: every server-reachable input path in the current codebase was reviewed, the one endpoint with a real cost-abuse risk is now rate-limited, the one form accepting free-text input now bounds it server-side, and the site now ships a working, tested set of security headers where it previously had none.
