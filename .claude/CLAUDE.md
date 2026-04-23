# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hono API backend for a TODO application. Owns the database, authentication, and business logic. The frontend (TanStack Start) is a separate project that consumes this API and uses Electric Cloud for real-time sync.

Tech: Hono + Node.js + TypeScript (ESM) + Drizzle ORM + PostgreSQL + Better Auth + Zod + OpenAPI.

## Specs & Plans

- [`docs/OVERVIEW.md`](../docs/OVERVIEW.md) – **What** this project is and why it exists.
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) – **How** it is structured (layers, data flow, adding new resources). **Read this before implementing any new feature.**
- [`docs/plan/*`](../docs/plan/) – The **phase-by-phase implementation plan** you must follow. Follow name convention XX-some-plan-name.md (example: 03-electric-cloud.md)
- [`docs/spec/*`](../docs/spec/) – The **phase-by-phase implementation spec** you must follow. Follow name convention XX-some-spec-name.md (example: 03-electric-cloud.md)
- Every spec must have a matching plan with the same name
- Both must include a `**Date:** YYYY-MM-DD` field after the title
- Make plans in phases (numbered list)
- At the end of each plan, give me a numbered list of unresolved questions to answer, if any. Make a question extremely concise, sacrificing grammar for the sake of concision.

## Architecture (quick reference)

New features must follow the **Controller → Service → Schema** layered pattern defined in `docs/ARCHITECTURE.md`:

1. Schema (`src/schemas/`) — Zod validation + type inference (single source of truth)
2. Service (`src/services/`) — business logic, DB queries via Drizzle, throws HTTPExceptions
3. Controller (`src/controllers/`) — routes + OpenAPI validation, delegates to service
4. Mount controller in `src/app.ts` via `app.route()`

## Authentication

- **Better Auth** handles signup, login, sessions, and password hashing
- Config: `src/lib/auth.ts` — Drizzle adapter, email+password, `basePath: '/api/v1/auth'`
- Controller: `src/controllers/auth.controller.ts` — catch-all delegates to `auth.handler()`
- Middleware: `src/middlewares/auth.middleware.ts` — validates session, sets `user` on context
- Auth endpoints are documented in OpenAPI via registry (not validated by Hono — Better Auth handles the request)
- All todo endpoints require authentication via `authMiddleware`

## Database

- **Drizzle ORM** with `pg` driver (standard node-postgres)
- Schemas: `src/db/schema/` — users, accounts, sessions, verifications, todos
- Relations: `src/db/schema.ts` — re-exports tables + defines relations via `defineRelations`
- Instance: `src/db/index.ts` — creates `db` from `DATABASE_URL`
- Migrations: `src/db/migrations/` — includes custom `updatedAt` trigger
- All tables use UUID PKs, `timestamptz` dates, cascade deletes

## Transaction IDs (txid)

Mutation endpoints (create/update/delete todo) run inside PostgreSQL transactions and return `txid` via `pg_current_xact_id()`. The frontend passes this to Electric Cloud to ensure sync consistency.

## Hono official documentation

Official Hono documentation: https://hono.dev/llms.txt

## Technical stack

- Hono
- TypeScript (ESM modules)
- Node.js
- pnpm
- Drizzle ORM (PostgreSQL)
- Better Auth (email + password)
- Zod
- OpenAPI + Scalar docs
- Docker Compose (PostgreSQL + ElectricSQL for local dev)
- dotenvx (env file loading)

## Commands

- **Dev server (local):** `pnpm dev` — loads `.env.local`, hot reload on port 3000
- **Dev server (remote DB):** `pnpm dev:remote` — loads `.env.development`
- **Build:** `pnpm build` — compiles TypeScript to `dist/`
- **Start (production):** `pnpm start` — loads `.env.production`
- **Run all tests:** `pnpm test` (vitest)
- **Run a single test file:** `pnpm vitest run src/app.test.ts`
- **Docker up:** `pnpm dc:up:d` — starts PostgreSQL + ElectricSQL
- **Docker down:** `pnpm dc:down`
- **Docker reset:** `pnpm dc:reset` — destroys volumes and restarts
- **DB generate migration:** `pnpm db:generate`
- **DB run migrations:** `pnpm db:migrate` (local), `pnpm db:migrate:dev`, `pnpm db:migrate:prod`
- **DB push schema:** `pnpm db:push` (local), `pnpm db:push:dev`, `pnpm db:push:prod`
- **DB studio:** `pnpm db:studio` (local), `pnpm db:studio:dev`, `pnpm db:studio:prod`

## Environments

Three environments configured via separate `.env` files, loaded by `dotenvx`:

| Environment | Env File          | Database              | ElectricSQL         |
|-------------|-------------------|-----------------------|---------------------|
| Local       | `.env.local`      | Docker Compose PostgreSQL | Docker Compose (port 4000) |
| Development | `.env.development`| Hosted PostgreSQL     | Electric Cloud      |
| Production  | `.env.production` | Hosted PostgreSQL     | Electric Cloud      |

Template with all required keys: `.env.example` (committed to git).

### Required env vars

- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — secret for session signing
- `BETTER_AUTH_URL` — base URL of this API (e.g., `http://localhost:3000`)
- `CORS_ORIGIN` — allowed frontend origin (e.g., `http://localhost:3001`)
- `DOCS_USERNAME` / `DOCS_PASSWORD` — Scalar docs basic auth (currently disabled)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/sign-up/email` | No | Register (name, email, password) |
| POST | `/api/v1/auth/sign-in/email` | No | Login (email, password) |
| GET | `/api/v1/auth/get-session` | Cookie | Get current session |
| POST | `/api/v1/auth/sign-out` | Cookie | Logout |
| POST | `/api/v1/todos` | Yes | Create todo (returns todo + txid) |
| PATCH | `/api/v1/todos/:id` | Yes | Update todo (returns todo + txid) |
| DELETE | `/api/v1/todos/:id` | Yes | Delete todo (returns todo + txid) |
| GET | `/api/v1/ping` | No | Health check |
| GET | `/api/v1/openapi.json` | No | OpenAPI spec |
| GET | `/api/v1/docs` | No | Scalar API docs |

## Tests

- Tests use Hono's built-in `app.request()` — no HTTP server needed
- Tests must be written first and then code for implementation should follow
- Tests must pass before merging
- Test DB configured in `vitest.config.ts`
