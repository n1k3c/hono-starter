# Plan: Extract Data Layer — Hono API

**Date:** 2026-04-05

Implements spec: [`docs/spec/02-extract-data-layer.md`](../spec/02-extract-data-layer.md)

---

## Phase 1 — Database schemas & connection

Port Drizzle schemas, switch to standard `pg` driver.

1. Create `src/db/schema/users.ts` — port from TanStack `src/db/auth/users.ts`
2. Create `src/db/schema/accounts.ts` — port from TanStack `src/db/auth/accounts.ts`
3. Create `src/db/schema/sessions.ts` — port from TanStack `src/db/auth/sessions.ts`
4. Create `src/db/schema/verifications.ts` — port from TanStack `src/db/auth/verifications.ts`
5. Create `src/db/schema/todos.ts` — port from TanStack `src/db/todos.ts`
6. Create `src/db/schema.ts` — re-export all tables, define relations with `defineRelations`
7. Update `src/db/index.ts` — Drizzle instance using `pg` Pool with `DATABASE_URL`
8. Update `drizzle.config.ts` — point schema to `./src/db/schema/` glob pattern
9. Create custom migration for `updatedAt` trigger (port from TanStack `drizzle/0000_updated_at_trigger.sql`)
10. Run `pnpm db:generate` then `pnpm db:up && pnpm db:migrate` to verify

## Phase 2 — Authentication

Set up Better Auth with Hono adapter.

1. Create `src/lib/auth.ts` — Better Auth config: `drizzleAdapter`, `pg` provider, email+password, schema mapping, `generateId: false`
2. Create `src/controllers/auth.controller.ts` — catch-all route at `/api/v1/auth/**`
3. Create `src/middlewares/auth.middleware.ts` — session validation, sets user on context
4. Mount auth controller in `src/app.ts`
5. Update `.env.example` and `.env.local` with `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
6. Test: signup + signin + session via Better Auth endpoints

## Phase 3 — CORS

1. Add CORS middleware to `src/app.ts` — origin from `CORS_ORIGIN` env var, credentials allowed
2. Add `CORS_ORIGIN` to `.env.example` and `.env.local`

## Phase 4 — Todo CRUD endpoints

Replace in-memory todos with DB-backed authenticated endpoints.

1. Update `src/schemas/todo.schema.ts` — Zod schemas for create (id + title), update (partial title + completed), response (todo + txid), OpenAPI route defs
2. Rewrite `src/services/todo.service.ts`:
   - `create(data, userId)` — insert in transaction, return todo + txid
   - `update(id, data, userId)` — verify ownership, update in transaction, return todo + txid
   - `delete(id, userId)` — verify ownership, delete in transaction, return todo + txid
   - `getTxId(tx)` — `pg_current_xact_id()` helper
3. Rewrite `src/controllers/todo.controller.ts` — POST, PATCH, DELETE with auth middleware
4. Mount in `src/app.ts` with auth middleware applied
5. Rewrite `src/app.test.ts` for new DB-backed auth-protected endpoints

## Phase 5 — Cleanup & verify

1. Remove leftover in-memory todo logic
2. Verify OpenAPI docs reflect new endpoints
3. Run `pnpm test`
4. Run `pnpm dev` and manually test endpoints

---

## Unresolved questions

1. Shared database — will Hono and TanStack use the same PostgreSQL instance?
2. Test DB — should tests use Docker Compose DB or a separate test database?
