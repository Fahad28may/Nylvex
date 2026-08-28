This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values. Never commit `.env.local`.

- `DATABASE_URL` — Postgres connection string for the Nylvex database (see below). This is a separate database from Nerve's — Nylvex never queries Nerve's database directly.
- `AUTH_SECRET` — random secret used to sign Auth.js session tokens. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- `NERVE_API_URL` / `NERVE_API_KEY` — base URL and bearer token for Nerve's server-to-server API. Server-only, never `NEXT_PUBLIC_*`. See [`docs/nerve-integration.md`](./docs/nerve-integration.md) for the full architecture.
- `NEXT_PUBLIC_META_APP_ID` / `NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID` — Meta App ID and Facebook Login for Business configuration id used client-side to launch WhatsApp Embedded Signup from `/dashboard`. Not secrets (comparable to an OAuth `client_id`), but the App ID must match the Meta App whose secret is configured on the Nerve server. See [`docs/nerve-integration.md`](./docs/nerve-integration.md#whatsapp-onboarding-flow-phase-10).
- `RESEND_API_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` — unchanged from before.

## Local development database

A `docker-compose.yml` is included for a local Postgres instance:

```bash
docker compose up -d
```

This starts Postgres on `localhost:5434` (chosen to avoid colliding with other local Postgres instances) with database `nylvex`, user `postgres`, password `postgres` — dev-only defaults, not used anywhere else. Point `DATABASE_URL` at it:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/nylvex
```

### Migrations

Schema lives in `src/lib/db/schema.ts`, managed with Drizzle ORM/Kit.

```bash
npm run db:generate   # generate a new migration from schema changes
npm run db:migrate    # apply pending migrations to DATABASE_URL
npm run db:studio     # browse the database in Drizzle Studio
```

Run `db:migrate` once against a fresh database before starting the app.

## Testing

```bash
npm run test
```

Runs the Vitest suite (`vitest run`). The Nerve client tests mock `fetch`
and need no external service. The Nerve provisioning and WhatsApp
onboarding tests exercise the real `ProductAccess`/`whatsapp_integrations`
tables (so the unique-index concurrency guarantees are verified against
real Postgres, not a mock of them) and are skipped automatically if
`DATABASE_URL` isn't set — start the local dev database first (see above)
to run them. Test files run sequentially (`fileParallelism: false` in
`vitest.config.mts`), since more than one file wipes shared tables between
tests against the same database.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
