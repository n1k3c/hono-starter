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

- **Dev server:** `pnpm dev` — runs `tsx watch src/index.ts` with hot reload on port 3000
- **Build:** `pnpm build` — compiles TypeScript to `dist/`
- **Start:** `pnpm start` — runs compiled `node dist/index.js`
- **Run all tests:** `pnpm test` (vitest)
- **Run a single test file:** `pnpm vitest run src/app.test.ts`

## Tests

- Tests use Hono's built-in `app.request()` — no HTTP server needed
- Tests must be written first and then code for implementation should follow
- Tests must pass before merging
