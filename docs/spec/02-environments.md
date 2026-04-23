# Environment Configuration

**Date:** 2026-04-05

## Overview

Multi-environment setup (local/development/production) with Docker Compose for local PostgreSQL and environment-specific `.env` files.

## Environment Files

| File               | Purpose                          | Git       |
|--------------------|----------------------------------|-----------|
| `.env.example`     | Template with all keys, no secrets | Committed |
| `.env.local`       | Local dev (Docker DB)            | Gitignored |
| `.env.development` | Hosted dev DB                    | Gitignored |
| `.env.production`  | Hosted prod DB                   | Gitignored |

### Required Variables

- `NODE_ENV` — `local` | `development` | `production`
- `DATABASE_URL` — PostgreSQL connection string (e.g. `postgresql://user:password@localhost:5432/hono_starter`)
- `DOCS_USERNAME` — Basic auth username for API docs
- `DOCS_PASSWORD` — Basic auth password for API docs

`.env.example` contains all keys with placeholder values. Actual `.env.*` files are gitignored (already covered by existing `.env.*` pattern in `.gitignore`).

## Docker Compose

Single `docker-compose.yml` at project root.

### Services

**PostgreSQL 17:**
- Image: `postgres:17-alpine`
- Port: `5432:5432`
- Volume: named volume `pgdata` for persistence
- Environment: `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=postgres`, `POSTGRES_DB=hono_starter`

These defaults match the `DATABASE_URL` in `.env.local`.

## Package.json Scripts

| Script           | Env File           | Purpose                     |
|------------------|--------------------|-----------------------------|
| `pnpm dev`       | `.env.local`       | Local dev with Docker DB    |
| `pnpm dev:remote`| `.env.development` | Dev with hosted DB          |
| `pnpm start`     | `.env.production`  | Production                  |
| `pnpm db:up`     | —                  | `docker compose up -d`      |
| `pnpm db:down`   | —                  | `docker compose down`       |

## Database Connection (`src/db/index.ts`)

- Uses `node-postgres` (`pg`) as the driver
- Reads `DATABASE_URL` from `process.env`
- Creates and exports a Drizzle ORM `db` instance
- Throws on missing `DATABASE_URL`

## Drizzle Config (`drizzle.config.ts`)

- Reads `DATABASE_URL` from env (loaded via `--env-file`)
- Schema path: `src/db/schema.ts`
- Output: `src/db/migrations/`
- Dialect: `postgresql`
- Driver: uses connection string directly

## Files Created/Modified

### New Files
- `docker-compose.yml` — PostgreSQL service
- `.env.example` — environment variable template
- `.env.local` — local dev defaults (gitignored)
- `src/db/index.ts` — Drizzle database connection
- `drizzle.config.ts` — Drizzle Kit configuration

### Modified Files
- `package.json` — updated scripts, add `pg` dependency
- `.gitignore` — add `!.env.example` exception to commit the template

## Testing

- Existing tests use in-memory todo service and are unaffected
- Database connection is not imported unless explicitly used by a service
