# Extract Data Layer — Hono API

**Date:** 2026-04-05

## Goal

Set up Hono as the API backend with database schemas, authentication, and todo CRUD mutations. This project becomes the single source of truth for data and auth.

## Target Architecture

```
src/
├── db/
│   ├── index.ts              # Drizzle instance (pg driver)
│   ├── schema.ts             # Re-exports all tables, defines relations
│   └── schema/
│       ├── users.ts          # users table
│       ├── accounts.ts       # accounts table
│       ├── sessions.ts       # sessions table
│       ├── verifications.ts  # verifications table
│       └── todos.ts          # todos table
├── schemas/
│   └── todo.schema.ts        # Zod request/response schemas for OpenAPI
├── services/
│   └── todo.service.ts       # Todo business logic (DB queries, txid)
├── controllers/
│   ├── todo.controller.ts    # Todo CRUD routes
│   └── auth.controller.ts    # Better Auth catch-all mount
├── middlewares/
│   └── auth.middleware.ts     # Session validation middleware
├── lib/
│   └── auth.ts               # Better Auth instance config
├── app.ts                    # Mount all controllers + CORS
└── index.ts                  # Server bootstrap
```

## Files to Create

- `src/db/schema/users.ts`
- `src/db/schema/accounts.ts`
- `src/db/schema/sessions.ts`
- `src/db/schema/verifications.ts`
- `src/db/schema/todos.ts`
- `src/db/schema.ts`
- `src/lib/auth.ts`
- `src/controllers/auth.controller.ts`
- `src/middlewares/auth.middleware.ts`

## Files to Update

- `src/db/index.ts` — replace placeholder with real Drizzle instance using `pg` Pool
- `src/schemas/todo.schema.ts` — new Zod schemas for create/update/response with OpenAPI
- `src/services/todo.service.ts` — replace in-memory with DB queries + transactions
- `src/controllers/todo.controller.ts` — rewrite routes for CRUD with auth
- `src/app.ts` — mount auth controller, add CORS middleware, apply auth middleware to todo routes
- `src/app.test.ts` — rewrite tests for DB-backed auth-protected endpoints
- `drizzle.config.ts` — point schema to `./src/db/schema/` directory
- `.env.example` — add BETTER_AUTH_SECRET, BETTER_AUTH_URL, CORS_ORIGIN
- `.env.local` — add same vars with dev values

## Database Schemas

Ported from TanStack project. All tables use UUID PKs with `gen_random_uuid()`, `timestamptz` for dates, cascade deletes on FKs.

### users
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default random |
| name | text | NOT NULL |
| email | text | NOT NULL, UNIQUE |
| emailVerified | boolean | NOT NULL |
| image | text | nullable |
| createdAt | timestamptz | NOT NULL, default now |
| updatedAt | timestamptz | NOT NULL, default now |

### accounts
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default random |
| userId | uuid | FK → users.id, cascade delete, NOT NULL |
| providerId | text | NOT NULL |
| accountId | text | NOT NULL |
| accessToken | text | nullable |
| refreshToken | text | nullable |
| idToken | text | nullable |
| scope | text | nullable |
| password | text | nullable |
| accessTokenExpiresAt | timestamptz | nullable |
| refreshTokenExpiresAt | timestamptz | nullable |
| createdAt | timestamptz | NOT NULL, default now |
| updatedAt | timestamptz | NOT NULL, default now |

Unique constraint: `(userId, providerId)`

### sessions
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default random |
| userId | uuid | FK → users.id, cascade delete, NOT NULL |
| token | text | NOT NULL, UNIQUE |
| ipAddress | text | nullable |
| userAgent | text | nullable |
| expiresAt | timestamptz | NOT NULL |
| createdAt | timestamptz | NOT NULL, default now |
| updatedAt | timestamptz | NOT NULL, default now |

Index: `(userId, expiresAt DESC)`

### verifications
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default random |
| identifier | text | NOT NULL |
| value | text | NOT NULL |
| expiresAt | timestamptz | NOT NULL |
| createdAt | timestamptz | NOT NULL, default now |
| updatedAt | timestamptz | NOT NULL, default now |

Index: `(identifier, expiresAt DESC)`

### todos
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, default random |
| title | varchar(256) | NOT NULL |
| completed | boolean | NOT NULL, default false |
| ownerId | uuid | FK → users.id, cascade delete, NOT NULL |
| createdAt | timestamptz | NOT NULL, default now |
| updatedAt | timestamptz | NOT NULL, default now |

Index: `(ownerId, createdAt)`

### updatedAt trigger

A PostgreSQL trigger function auto-updates `updatedAt` on every row update. Applied to all tables via custom migration.

## Authentication

### Better Auth config (`src/lib/auth.ts`)

- Adapter: `drizzleAdapter` with `pg` provider, mapping custom table names (user→users, session→sessions, etc.)
- Email + password enabled
- UUID generation handled by PostgreSQL (`generateId: false`)
- Secret from `BETTER_AUTH_SECRET` env var
- Base URL from `BETTER_AUTH_URL` env var
- No TanStack cookies plugin — standard Hono adapter

### Auth controller (`src/controllers/auth.controller.ts`)

Mounts Better Auth handler as catch-all at `/api/v1/auth/**`. Better Auth manages all sub-routes internally.

### Auth middleware (`src/middlewares/auth.middleware.ts`)

1. Reads session from request headers (cookie-based)
2. Calls `auth.api.getSession({ headers })`
3. If no valid session, returns 401
4. Sets `user` on Hono context for downstream handlers

Applied to all `/api/v1/todos/*` routes.

## API Endpoints

### `ALL /api/v1/auth/**` (no auth)
Better Auth catch-all.

### `POST /api/v1/todos` (auth required)
Create todo. Client sends `{ id: uuid, title?: string }`. ID is client-generated for optimistic inserts.
Returns `201` with `{ todo, txid }`.

### `PATCH /api/v1/todos/:id` (auth required)
Update todo. Body: `{ title?, completed? }`. Verifies ownership (id + ownerId).
Returns `200` with `{ todo, txid }`. Returns `404` if not found or not owned.

### `DELETE /api/v1/todos/:id` (auth required)
Delete todo. Verifies ownership.
Returns `200` with `{ todo, txid }`. Returns `404` if not found or not owned.

### `GET /api/v1/ping` (no auth)
Health check. Returns `"pong"`.

### `GET /api/v1/openapi.json` (no auth)
OpenAPI spec.

### `GET /api/v1/docs` (basic auth)
Scalar API docs.

## Transaction ID (txid)

Every mutation runs in a PostgreSQL transaction and returns:
```sql
SELECT pg_current_xact_id()::xid::text::int as txid
```
The client uses txid to tell Electric Cloud "wait until this transaction is synced."

## CORS

Hono must allow cross-origin requests from the frontend:
- Allow origin: configurable via `CORS_ORIGIN` env var
- Allow credentials: true (session cookies)
- Allow methods: GET, POST, PATCH, DELETE, OPTIONS
- Allow headers: Content-Type, Cookie

## Environment Variables

### .env.example
```
NODE_ENV=local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hono_starter
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
DOCS_USERNAME=
DOCS_PASSWORD=
```

## What This Spec Does NOT Cover

- Electric Cloud (fully client-side, not this project's concern)
- Frontend changes (covered in TanStack project's own spec)
- Production deployment
- New features beyond todo CRUD + auth
