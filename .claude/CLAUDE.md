# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hono web server starter project running on Node.js via `@hono/node-server`. TypeScript with ESM modules.

## Specs & Plans

- [`docs/OVERVIEW.md`](../docs/OVERVIEW.md) – **What** This project is and why it exists.
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) – **How** it is structured (packages, layers, data flow).
- [`docs/plan/*`](../docs/plan/) – The **phase-by-phase implementation plan** you must follow. Follow name convention XX-some-plan-name.md (example: 03-electric-cloud.md)
- [`docs/spec/*`](../docs/spec/) – The **phase-by-phase implementation spec** you must follow. Follow name convention XX-some-spec-name.md (example: 03-electric-cloud.md)
- Every spec must have a matching plan with the same name
- Both must include a `**Date:** YYYY-MM-DD` field after the title
- Make plans in phases (numbered list)
- At the end of each plan, give me a numbered list of unresolved questions to answer, if any. Make a question extremely concise, sacrificing grammar for the sake of concision.

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
