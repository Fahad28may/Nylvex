# Nylvex ↔ Nerve integration (Phase 9)

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

## What Phase 9 does NOT implement

- WhatsApp onboarding or credential configuration
- Appointment booking, calendar integration, payments
- AI configuration UI, CRM, customer/conversation UI
- Admin dashboard, multi-seat organizations, billing
- Any direct browser → Nerve communication
- Production deployment

## Future: WhatsApp onboarding phase

The next phase that touches Nerve should build the flow that takes an
`active` Nerve Business and walks the client through connecting WhatsApp
(Meta Embedded Signup or equivalent) and any remaining per-business
configuration — none of which exists yet.
