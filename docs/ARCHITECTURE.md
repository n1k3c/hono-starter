# Architecture

**Date:** 2026-04-05

## Layered Architecture

The API follows a **Controller → Service → Schema** layered pattern. Each layer has a single responsibility and dependencies flow inward.

```
Request → Controller → Service → DB
              ↓            ↓
           Schema       Exceptions
```

## Project Structure

```
src/
├── app.ts                      # Hono app — mounts controllers, CORS, docs
├── index.ts                    # Server entry point — starts @hono/node-server
├── controllers/
│   ├── auth.controller.ts      # Better Auth catch-all + OpenAPI docs
│   └── todo.controller.ts      # Todo CRUD (POST, PATCH, DELETE)
├── services/
│   └── todo.service.ts         # Todo business logic — DB queries + txid
├── schemas/
│   └── todo.schema.ts          # Zod schemas — validation + OpenAPI types
├── middlewares/
│   └── auth.middleware.ts      # Session validation — sets user on context
├── lib/
│   └── auth.ts                 # Better Auth config — Drizzle adapter, email+password
├── exceptions/
│   └── http-exceptions.ts      # Custom HTTPException subclasses
├── db/
│   ├── index.ts                # Drizzle instance (pg driver + DATABASE_URL)
│   ├── schema.ts               # Re-exports all tables + defines relations
│   ├── schema/
│   │   ├── users.ts            # users table
│   │   ├── accounts.ts         # accounts table (Better Auth)
│   │   ├── sessions.ts         # sessions table (Better Auth)
│   │   ├── verifications.ts    # verifications table (Better Auth)
│   │   └── todos.ts            # todos table
│   └── migrations/             # Generated + custom SQL migrations
└── core/                       # Shared utilities
```

## Layers

### Schema (`src/schemas/`)

Single source of truth for request/response validation and types. Each resource gets one schema file.

- Define Zod schemas with OpenAPI metadata via `@hono/zod-openapi`
- Export inferred TypeScript types via `z.infer<>`
- Naming: `{resource}.schema.ts`

### Controller (`src/controllers/`)

Thin HTTP layer. Creates an `OpenAPIHono` instance, defines routes with `createRoute()`, validates input, and delegates to the service.

- Use `createRoute()` + `.openapi()` for documented endpoints
- Never contain business logic — delegate to services
- Return appropriate HTTP status codes
- Naming: `{resource}.controller.ts`

### Service (`src/services/`)

Pure business logic. No HTTP concepts (no `c` context, no status codes).

- Receive typed input, return typed output
- Throw `HTTPException` subclasses for error cases
- Interact with the database via Drizzle ORM
- Run mutations in transactions, return `txid` for Electric sync
- Naming: `{resource}.service.ts`

### Auth (`src/lib/auth.ts` + `src/middlewares/auth.middleware.ts`)

Authentication is handled by Better Auth:

- **Config** (`src/lib/auth.ts`): Drizzle adapter, email+password enabled, `basePath: '/api/v1/auth'`
- **Controller** (`src/controllers/auth.controller.ts`): OpenAPI route docs registered via registry, all requests delegated to `auth.handler()`
- **Middleware** (`src/middlewares/auth.middleware.ts`): Validates session cookie, sets `user` and `session` on Hono context. Applied to protected routes.

### DB (`src/db/`)

Database connection and schema definitions:

- `src/db/index.ts` — Drizzle instance using `pg` driver with `DATABASE_URL`
- `src/db/schema.ts` — barrel file: re-exports all tables, defines relations via `defineRelations`
- `src/db/schema/` — individual table definitions (Drizzle `pgTable`)
- `src/db/migrations/` — SQL migrations including custom `updatedAt` trigger

All tables use UUID primary keys, `timestamptz` dates, and a PostgreSQL trigger for auto-updating `updatedAt`.

### Exceptions (`src/exceptions/`)

Custom error classes extending Hono's `HTTPException`. Thrown in services, caught automatically by Hono.

## Adding a New Resource

1. Create `src/db/schema/{resource}.ts` — define Drizzle table
2. Export from `src/db/schema.ts` — add to re-exports and relations
3. Run `pnpm db:generate` then `pnpm db:migrate`
4. Create `src/schemas/{resource}.schema.ts` — Zod schemas with OpenAPI metadata
5. Create `src/services/{resource}.service.ts` — business logic with DB queries
6. Create `src/controllers/{resource}.controller.ts` — OpenAPI routes, auth middleware
7. Mount in `src/app.ts` — `app.route('/api/v1/{resource}', controller)`
8. Add tests

## Data Flow Example

```
POST /api/v1/todos (with session cookie)
  → authMiddleware (validates session, sets c.user)
    → todoController (validates body with CreateTodoSchema)
      → todoService.create(data, userId)
        → db.transaction: INSERT todo, SELECT pg_current_xact_id()
        → returns { todo, txid }
      → c.json({ todo, txid }, 201)
```

The frontend receives `txid` and passes it to Electric Cloud to ensure the mutation is visible before rendering.
