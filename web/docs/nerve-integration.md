# Nylvex ↔ Nerve integration (Phase 9 + Phase 10)

Nylvex and Nerve are two separate applications with two separate PostgreSQL
databases. Nylvex never connects to Nerve's database, and Nerve never
connects to Nylvex's. The only connection between them is a
server-to-server HTTPS API call, made from Nylvex's server (never the
browser) to Nerve's authenticated API.

```
Nylvex ProductAccess.externalReference
        ↓  (opaque string, no foreign key)
Nerve Business.id
```

There is **no database foreign key** between the two systems —
`externalReference` is just a `text` column holding whatever id Nerve
returned. Nylvex treats it as an opaque reference, not a key it can join
against.

## Server-to-server boundary

- All Nerve communication happens from `src/lib/nerve/client.ts`, a
  `server-only`-guarded module. The `server-only` package makes it a build
  error for this module to end up in a client bundle.
- `NERVE_API_URL` and `NERVE_API_KEY` are read from `process.env` only
  inside that module, at request time. Neither is ever passed to a client
  component, embedded in a `NEXT_PUBLIC_*` variable, or returned from a
  server action.
- The browser only ever calls Nylvex's own server actions (e.g. "Request
  Nerve" on `/dashboard`), which take **no parameters** — the organization,
  business identity, and Nerve credentials are all resolved server-side from
  the authenticated session. There is no code path for a client to supply an
  organization id, a Nerve business id, or `externalReference` directly.

## Authentication

Nylvex authenticates to Nerve with `Authorization: Bearer <NERVE_API_KEY>`
on every request. The key lives only in `NERVE_API_KEY` (never
`NEXT_PUBLIC_*`) and is never included in a thrown error, a log line, or a
response sent to the browser — see `src/lib/nerve/client.ts`, which logs
only the request path and HTTP status on failure.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NERVE_API_URL` | Base URL of Nerve's API (e.g. `https://nerve.example.com`). Server-only. |
| `NERVE_API_KEY` | Bearer token Nylvex uses to authenticate to Nerve. Server-only, never `NEXT_PUBLIC_*`. |
| `NEXT_PUBLIC_META_APP_ID` | Meta App ID, used client-side to initialize Meta's JS SDK for WhatsApp Embedded Signup (Phase 10). Not a secret — comparable to an OAuth `client_id` — but must match the App ID Nerve uses server-side for the code exchange (Nerve's `META_APP_ID`). |
| `NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID` | Facebook Login for Business configuration id for the Embedded Signup flow (Phase 10). Not a secret. Created in the Meta App Dashboard; identifies which permissions/flow the client sees, nothing more. |

## Provisioning flow

1. A logged-in user clicks **Request Nerve** on `/dashboard`.
2. The `requestNerve()` server action (`src/app/dashboard/actions.ts`) reads
   the session, then calls `requestNerveProvisioning(session.user.id)`
   (`src/lib/nerve/provisioning.ts`).
3. That function resolves the user's organization, then ensures exactly one
   `ProductAccess` row exists for `(organizationId, "nerve")` via
   `INSERT ... ON CONFLICT DO NOTHING` against a unique index on
   `(organization_id, product_slug)`.
4. If the row is already `active`, it's returned as-is — no Nerve call.
5. If it's `provisioning` with an `externalReference` already set, Nylvex
   calls `GET /api/v1/businesses/{id}` to check on it rather than
   re-provisioning.
6. Otherwise (`requested` or `failed`), Nylvex claims the row with a
   conditional `UPDATE ... WHERE status IN ('requested','failed')`, then
   calls `POST /api/v1/businesses` with a stable `external_provisioning_id`
   and business info derived from the organization/consultation data. The
   returned `business_id` is stored in `externalReference` and the status is
   updated to whatever Nerve reports (`provisioning` or `active`).

## `external_provisioning_id` strategy

`external_provisioning_id` is **derived, not stored**: it's a SHA-256 hash
of `nylvex:<productSlug>:<organizationId>` (`src/lib/nerve/provisioning-id.ts`).
Because it's a pure function of data that never changes, it is:

- stable across retries, duplicate clicks, page refreshes, and server
  restarts — nothing needs to persist it, and nothing can regenerate a
  different value for the same org+product,
- exactly what makes Nerve's own idempotency guarantee usable: repeat calls
  with the same id resolve to the same Business instead of creating a new
  one.

## Idempotency and partial failure

There is no distributed transaction across the two databases — a Nylvex→
Nerve→Nylvex round trip cannot be made atomic, so the design assumes the
network step can fail *after* Nerve has already acted:

- **Retry after a lost response**: if Nylvex calls Nerve, Nerve creates the
  Business, and the response never arrives (timeout, crash, dropped
  connection), the ProductAccess row is left in `provisioning` or gets
  reset. The next call to `requestNerveProvisioning` uses the *same*
  `external_provisioning_id`, so Nerve returns the *existing* Business
  instead of creating a second one, and Nylvex reconciles by storing that
  business id.
- **Concurrency**: two simultaneous "Request Nerve" clicks are made safe by
  the database, not an in-process lock (which wouldn't hold across
  serverless instances). The unique index on `(organization_id,
  product_slug)` guarantees at most one row; the conditional claim update
  means at most one request typically calls Nerve, but even if both did,
  Nerve's own idempotency on `external_provisioning_id` collapses them onto
  one Business.
- **Nerve unavailable**: the ProductAccess row is marked `failed` and the
  user gets a safe, generic message. Nylvex never fabricates an `active`
  status it hasn't actually observed from Nerve.

## ProductAccess status values

`requested → provisioning → active`, with `failed` reachable from a
provisioning attempt that errored, and `suspended` reserved for future
manual/administrative use. `failed` is safe to retry — the next "Request
Nerve" click reuses the same `external_provisioning_id`.

## WhatsApp onboarding flow (Phase 10)

Once a Nerve `Business` exists (`ProductAccess.status === "provisioning"`
with `externalReference` set), `/dashboard` shows a **Connect WhatsApp**
button instead of a generic "Provisioning..." badge — see
`src/app/dashboard/page.tsx`'s `readyToConnectWhatsapp` check, which
distinguishes "still calling Nerve" from "Business exists, waiting on
WhatsApp" using `externalReference` rather than a second status value.

```
Browser (ConnectWhatsappButton)
      |  Meta JS SDK: FB.login({ config_id, response_type: "code", ... })
      v
Meta returns, to the browser only:
  - postMessage: { type: "WA_EMBEDDED_SIGNUP", event: "FINISH",
                    data: { waba_id, phone_number_id } }
  - FB.login callback: { authResponse: { code } }   <- 30s TTL, single use
      |
      |  once both have arrived
      v
connectWhatsapp() server action (src/app/dashboard/actions.ts)
      |  reads the session; rejects if logged out or input is malformed
      v
connectWhatsappForUser() (src/lib/nerve/whatsapp.ts)
      |  resolves organization -> ProductAccess -> externalReference
      |  (never from client input)
      v
Nerve: POST /api/v1/businesses/{business_id}/whatsapp
      |  { code, waba_id, phone_number_id } -- no Meta access token
      v
Nerve exchanges the code, verifies the number, subscribes the webhook,
registers the number, and returns safe status + display metadata only.
```

**This browser component never receives, stores, or forwards a Meta
access token.** Nylvex forwards only what Meta's own Embedded Signup
completion event hands to the browser — a short-lived authorization code
and Meta's own identifiers — through an authenticated server action.
Nerve (which owns `META_APP_ID`/`META_APP_SECRET`) is the only system in
this integration that ever exchanges the code for a credential; see
Nerve's `docs/NYLVEX_API.md` §8a for that side of the contract. The
credential itself is stored only in Nerve's database
(`businesses.whatsapp_access_token`) — Nylvex's own `whatsapp_integrations`
table (`src/lib/db/schema.ts`) holds only safe, display-only state:
onboarding status, WABA id, phone number id, display phone number,
business display name, connected timestamp, and a generic failure reason.

### State machine

`whatsappIntegrations.status`: `not_connected → connecting → connected`,
with `failed` reachable from a failed attempt. There is no separate
terminal failure state distinct from `not_connected` in practice — both
are safe to retry from, and a retry always requires a fresh Meta
authorization code (the previous one is single-use and expires in 30s),
so there is no meaningful difference between "never tried" and "tried and
failed" from a retryability standpoint. `connectWhatsappForUser` does not
gate a retry on the row's current status (unlike provisioning's
conditional claim) — a `connecting` row that never resolved (crashed
process, lost response) would otherwise become permanently unretryable,
since nothing else moves it out of that state. Safety instead comes from
Nerve's own idempotency/conflict handling and the single-use Meta code.

Once WhatsApp connects, `connectWhatsappForUser` also flips
`ProductAccess.status` to `"active"` — mirroring Nerve's own derived
status (a `Business` with `whatsapp_phone_number_id` set is `"active"`),
kept in sync explicitly rather than re-derived, since Nylvex's dashboard
needs it independent of a live Nerve read.

### Idempotency and conflicts

- A same-business retry (e.g. token needs refreshing) succeeds again
  without creating a duplicate row — enforced by the `productAccessId`
  unique index on `whatsapp_integrations`.
- Nerve rejects (`409`) reassigning a different number to a business that
  already has one, or a number already claimed by a different business.
  `connectWhatsappForUser` maps a `409` to a specific, still-safe message
  ("already connected elsewhere"); every other Nerve failure maps to a
  generic retry message. Neither ever surfaces Nerve's raw error text.

### What Phase 10 does NOT implement

- Disconnecting or replacing an already-connected WhatsApp number
- Appointment booking, calendar integration, payments
- AI configuration UI, CRM, customer/conversation UI
- Admin dashboard, multi-seat organizations, billing, subscriptions
- Email/iMessage/voice integration
- Any direct browser → Nerve communication (the browser talks to Meta's
  own SDK and to Nylvex's server action, never to Nerve)
- A real, tested Meta Embedded Signup call — see the Phase 10 final
  report for what has and hasn't been verified against a live Meta
  environment.
- Production deployment

## What Phase 9 does NOT implement

- Appointment booking, calendar integration, payments
- AI configuration UI, CRM, customer/conversation UI
- Admin dashboard, multi-seat organizations, billing
- Any direct browser → Nerve communication
- Production deployment
