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

- `DATABASE_URL` — Postgres connection string for the Nylvex database (see below).
- `AUTH_SECRET` — random secret used to sign Auth.js session tokens. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- `RESEND_API_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` — third-party service keys.

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
