# Invoicer

Simple invoicing for freelancers and small studios. Keep a client list, create invoices with line items, and track what's been sent, paid and overdue.

## Status

Private beta. The app runs against one seeded demo account (Acme Studio). Next up is opening it to the freelancers on our waitlist.

## Stack

- Next.js 16 (App Router, server actions)
- Tailwind CSS 4
- Drizzle ORM on libSQL: a local SQLite file in development, Turso in production

## Getting started

```bash
npm install
npm run dev
```

`npm run dev` applies migrations and seeds the demo data on first run. `npm run db:setup` does the same on its own. Then open http://localhost:3000.

## Environment

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `file:local.db` | libSQL URL. Use the Turso database URL in production. |
| `DATABASE_AUTH_TOKEN` | | Only needed for a remote Turso database. |

## Changing the schema

Edit `db/schema.ts`, run `npm run db:generate` to write a migration to `drizzle/`, then `npm run db:setup` to apply it.

## Deploying

Deploys to Vercel. Set `DATABASE_URL` and `DATABASE_AUTH_TOKEN` in the project's environment variables.
