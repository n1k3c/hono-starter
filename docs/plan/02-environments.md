# Environment Configuration Implementation Plan

**Date:** 2026-04-05

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up multi-environment configuration (local/development/production) with Docker Compose for local PostgreSQL and Drizzle ORM database connection.

**Architecture:** Environment-specific `.env` files loaded via Node's `--env-file` flag in package.json scripts. Local development uses a Docker Compose PostgreSQL container. Database connection via Drizzle ORM reading `DATABASE_URL` from environment.

**Tech Stack:** Docker Compose, PostgreSQL 17, Drizzle ORM, node-postgres (`pg`), Node.js `--env-file`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `docker-compose.yml` | Create | PostgreSQL service for local dev |
| `.env.example` | Create | Template with all env keys, no secrets |
| `.env.local` | Create | Local dev values (Docker DB) |
| `src/db/index.ts` | Create | Drizzle ORM connection using `DATABASE_URL` |
| `src/db/schema.ts` | Create | Barrel file for Drizzle table schemas |
| `drizzle.config.ts` | Create | Drizzle Kit CLI configuration |
| `package.json` | Modify | Update scripts, add `pg` dependency |
| `.gitignore` | Modify | Add `!.env.example` exception |
| `vitest.config.ts` | Modify | Add `DATABASE_URL` to test env |
| `.claude/CLAUDE.md` | Modify | Document new commands |
| `docs/ARCHITECTURE.md` | Modify | Document DB layer |

---

### Task 1: Install `pg` dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install node-postgres**

Run:
```bash
pnpm add pg
pnpm add -D @types/pg
```

- [ ] **Step 2: Verify installation**

Run:
```bash
pnpm test
```
Expected: All existing tests still pass.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add pg driver for PostgreSQL"
```

---

### Task 2: Create Docker Compose for local PostgreSQL

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Create `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:17-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: hono_starter
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 2: Verify container starts**

Run:
```bash
docker compose up -d
```
Expected: Container starts, port 5432 exposed.

Run:
```bash
docker compose ps
```
Expected: `postgres` service shows `running`.

- [ ] **Step 3: Stop the container**

Run:
```bash
docker compose down
```

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml
git commit -m "chore: add Docker Compose for local PostgreSQL"
```

---

### Task 3: Create environment files

**Files:**
- Create: `.env.example`
- Create: `.env.local`
- Modify: `.gitignore`

- [ ] **Step 1: Create `.env.example`**

```env
NODE_ENV=local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hono_starter
DOCS_USERNAME=
DOCS_PASSWORD=
```

- [ ] **Step 2: Create `.env.local`**

```env
NODE_ENV=local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hono_starter
DOCS_USERNAME=developer
DOCS_PASSWORD=pass12345
```

- [ ] **Step 3: Add `.env.example` exception to `.gitignore`**

In `.gitignore`, after the existing `.env.*` line, add:

```gitignore
!.env.example
```

So the env section becomes:

```gitignore
# env
.env
.env.*
!.env.example
```

- [ ] **Step 4: Delete the old `.env` file**

The old `.env` file is replaced by `.env.local`. Remove it:

```bash
rm .env
```

- [ ] **Step 5: Commit**

```bash
git add .env.example .gitignore
git rm .env --cached 2>/dev/null; true
git commit -m "chore: add multi-environment .env setup"
```

---

### Task 4: Update package.json scripts

**Files:**
- Modify: `package.json:4-8` (scripts section)

- [ ] **Step 1: Update scripts**

Replace the existing `scripts` block in `package.json` with:

```json
"scripts": {
  "dev": "tsx watch --env-file=.env.local src/index.ts",
  "dev:remote": "tsx watch --env-file=.env.development src/index.ts",
  "build": "tsc",
  "start": "node --env-file=.env.production dist/index.js",
  "test": "vitest run",
  "db:up": "docker compose up -d",
  "db:down": "docker compose down",
  "db:generate": "drizzle-kit generate --config=drizzle.config.ts",
  "db:migrate": "drizzle-kit migrate --config=drizzle.config.ts",
  "db:studio": "drizzle-kit studio --config=drizzle.config.ts"
}
```

- [ ] **Step 2: Verify tests still pass**

Run:
```bash
pnpm test
```
Expected: All existing tests pass (tests don't use `--env-file`, they use vitest.config.ts env).

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: update scripts for multi-environment support"
```

---

### Task 5: Create Drizzle config

**Files:**
- Create: `drizzle.config.ts`

- [ ] **Step 1: Create `drizzle.config.ts`**

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add drizzle.config.ts
git commit -m "chore: add Drizzle Kit configuration"
```

---

### Task 6: Create database connection module

**Files:**
- Create: `src/db/index.ts`
- Create: `src/db/schema.ts`
- Delete: `src/db/.gitkeep`

- [ ] **Step 1: Create `src/db/schema.ts`**

Empty barrel file for future table definitions:

```typescript
// Table schemas are exported from here.
// Example: export { todos } from './tables/todos.js'
```

- [ ] **Step 2: Create `src/db/index.ts`**

```typescript
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema.js'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

export const db = drizzle(databaseUrl, { schema })
```

- [ ] **Step 3: Remove `.gitkeep`**

```bash
rm src/db/.gitkeep
```

- [ ] **Step 4: Verify tests still pass**

Run:
```bash
pnpm test
```
Expected: All existing tests pass. `src/db/index.ts` is not imported by any test or app code yet, so the missing `DATABASE_URL` does not cause failures.

- [ ] **Step 5: Commit**

```bash
git add src/db/index.ts src/db/schema.ts
git rm src/db/.gitkeep
git commit -m "feat: add Drizzle ORM database connection"
```

---

### Task 7: Update vitest.config.ts

**Files:**
- Modify: `vitest.config.ts`

- [ ] **Step 1: Add `DATABASE_URL` to test environment**

Replace the `env` block in `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      DOCS_USERNAME: 'developer',
      DOCS_PASSWORD: 'pass12345',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/hono_starter_test',
    },
  },
})
```

Note: uses `hono_starter_test` database name to avoid colliding with development data.

- [ ] **Step 2: Verify tests still pass**

Run:
```bash
pnpm test
```
Expected: All existing tests pass.

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: add DATABASE_URL to test environment"
```

---

### Task 8: Update documentation

**Files:**
- Modify: `.claude/CLAUDE.md`
- Modify: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Update CLAUDE.md commands section**

Replace the `## Commands` section with:

```markdown
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
```

- [ ] **Step 2: Add environment info to CLAUDE.md**

After the `## Commands` section, add:

```markdown
## Environments

Three environments configured via separate `.env` files:

| Environment | Env File          | Database              |
|-------------|-------------------|-----------------------|
| Local       | `.env.local`      | Docker Compose PostgreSQL |
| Development | `.env.development`| Hosted PostgreSQL     |
| Production  | `.env.production` | Hosted PostgreSQL     |

Template with all required keys: `.env.example` (committed to git).
```

- [ ] **Step 3: Update ARCHITECTURE.md DB section**

In `docs/ARCHITECTURE.md`, replace the `### DB` section with:

```markdown
### DB (`src/db/`)

Database connection and Drizzle ORM setup.

- `src/db/index.ts` — creates and exports the Drizzle `db` instance using `DATABASE_URL`
- `src/db/schema.ts` — barrel file exporting all table schemas
- `src/db/migrations/` — generated SQL migrations (via `pnpm db:generate`)
```

- [ ] **Step 4: Verify tests still pass**

Run:
```bash
pnpm test
```
Expected: All existing tests pass.

- [ ] **Step 5: Commit**

```bash
git add .claude/CLAUDE.md docs/ARCHITECTURE.md
git commit -m "docs: update for multi-environment setup and DB commands"
```

---

## Unresolved Questions

1. Drizzle Kit `db:generate` and `db:migrate` need `--env-file` — pass via script or expect user to have Docker running?
2. Should `db:generate`/`db:migrate` scripts hardcode `--env-file=.env.local` or leave flexible?
