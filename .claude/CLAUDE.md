# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hono web server starter project running on Node.js via `@hono/node-server`. TypeScript with ESM modules.

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
2. Service (`src/services/`) — business logic, no HTTP concerns, throws HTTPExceptions
3. Controller (`src/controllers/`) — routes + validation via `zValidator`, delegates to service
4. Mount controller in `src/app.ts` via `app.route()`

## Hono official documentation

Official Hono documetnation: https://hono.dev/llms.txt

## Technical stack

- Hono
- TypeScript
- ESM modules
- Node.js
- pnpm
- Drizzle ORM 
- PostgreSQL
- Zod
- OpenAPI documentation
- Better-Auth

## Commands

- **Dev server (local):** `pnpm dev` — loads `.env.local`, hot reload on port 3000
- **Dev server (remote DB):** `pnpm dev:remote` — loads `.env.development`
- **Build:** `pnpm build` — compiles TypeScript to `dist/`
- **Start (production):** `pnpm start` — loads `.env.production`, runs `node dist/index.js`
- **Run all tests:** `pnpm test` (vitest)
- **Run a single test file:** `pnpm vitest run src/app.test.ts`
- **DB start:** `pnpm db:up` — starts local PostgreSQL via Docker Compose
- **DB stop:** `pnpm db:down` — stops local PostgreSQL
- **DB generate migration:** `pnpm db:generate` — generates SQL from schema changes
- **DB run migrations:** `pnpm db:migrate` — applies pending migrations
- **DB studio:** `pnpm db:studio` — opens Drizzle Studio GUI

## Environments

Three environments configured via separate `.env` files:

| Environment | Env File          | Database              |
|-------------|-------------------|-----------------------|
| Local       | `.env.local`      | Docker Compose PostgreSQL |
| Development | `.env.development`| Hosted PostgreSQL     |
| Production  | `.env.production` | Hosted PostgreSQL     |

Template with all required keys: `.env.example` (committed to git).

## Tests

- Tests use Hono's built-in `app.request()` — no HTTP server needed
- Tests must be written first and then code for implementation should follow
- Tests must pass before merging
