# Hono Starter

Hono backend API for a TODO application with real-time data sync. Owns the database, authentication, and business logic. The frontend (TanStack Start) runs separately and consumes this API, using Electric Cloud for real-time sync.

## Tech Stack

- **Framework:** [Hono](https://hono.dev/)
- **Language:** TypeScript (ESM)
- **Runtime:** Node.js
- **Database:** PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/)
- **Auth:** [Better Auth](https://better-auth.com/) (email + password)
- **Validation:** [Zod](https://zod.dev/)
- **API Docs:** OpenAPI + [Scalar](https://scalar.com/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Infrastructure:** Docker Compose (PostgreSQL + ElectricSQL)
- **Env Management:** [dotenvx](https://dotenvx.com/)

## Getting Started

### Prerequisites

- Node.js & pnpm
- Docker (for local PostgreSQL + ElectricSQL)

### Setup

```bash
pnpm install
cp .env.example .env.local    # fill in your values
pnpm dc:up:d                  # start PostgreSQL + ElectricSQL containers
pnpm db:generate              # generate migration from schema
pnpm db:migrate               # run migrations
pnpm dev                      # start dev server on http://localhost:3000
```

### Other Commands

```bash
pnpm dev:remote       # dev server with remote DB (.env.development)
pnpm build            # compile TypeScript to dist/
pnpm start            # run production build
pnpm test             # run all tests (vitest)
pnpm db:studio        # open Drizzle Studio UI
pnpm dc:down          # stop Docker containers
pnpm dc:reset         # destroy volumes and restart
```
