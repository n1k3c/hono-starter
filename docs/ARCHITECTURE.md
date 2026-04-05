# Architecture

**Date:** 2026-04-05

## Layered Architecture

The API follows a **Controller → Service → Schema** layered pattern. Each layer has a single responsibility and dependencies flow inward.

```
Request → Controller → Service → (DB)
              ↓            ↓
           Schema       Exceptions
```

## Project Structure

```
src/
├── app.ts                  # Hono app — mounts controllers via app.route()
├── index.ts                # Server entry point — starts @hono/node-server
├── controllers/            # HTTP layer — routing, validation, responses
│   └── todo.controller.ts
├── services/               # Business logic — no HTTP concerns
│   └── todo.service.ts
├── schemas/                # Zod schemas — validation + type inference
│   └── todo.schema.ts
├── exceptions/             # Custom HTTPException subclasses
│   └── http-exceptions.ts
├── middlewares/             # Auth, logging, error handling middleware
├── core/                   # Shared utilities (logger, auth helpers, etc.)
└── db/                     # Database setup (Drizzle ORM)
```

## Layers

### Schema (`src/schemas/`)

Single source of truth for validation and types. Each resource gets one schema file.

- Define Zod schemas for request validation and response shapes
- Export inferred TypeScript types via `z.infer<>`
- Naming: `{resource}.schema.ts`

### Controller (`src/controllers/`)

Thin HTTP layer. Creates a `new Hono()` instance, defines routes, validates input, and delegates to the service.

- Validate request input using `zValidator()` from `@hono/zod-validator`
- Never contain business logic — delegate to services
- Return appropriate HTTP status codes
- Naming: `{resource}.controller.ts`

### Service (`src/services/`)

Pure business logic. No HTTP concepts (no `c` context, no status codes).

- Receive typed input, return typed output
- Throw `HTTPException` subclasses from `exceptions/` for error cases
- Interact with the database (when implemented)
- Naming: `{resource}.service.ts`

### Exceptions (`src/exceptions/`)

Custom error classes extending Hono's `HTTPException`. Thrown in services, caught automatically by Hono.

### Middlewares (`src/middlewares/`)

Reusable Hono middleware (auth, logging, etc.). Applied in `app.ts` or individual controllers.

### Core (`src/core/`)

Shared utilities used across layers (logger, auth helpers, mailer, etc.).

### DB (`src/db/`)

Database connection and Drizzle ORM setup.

## Adding a New Resource

1. Create `src/schemas/{resource}.schema.ts` — define Zod schemas and export types
2. Create `src/services/{resource}.service.ts` — implement business logic
3. Create `src/controllers/{resource}.controller.ts` — define routes, validate with schemas, delegate to service
4. Mount in `src/app.ts` — `app.route('/api/{resource}', {resource}Controller)`
5. Add tests in `src/{resource}.test.ts` or `src/controllers/{resource}.test.ts`

## Data Flow Example

```
POST /api/todos
  → todoController (validates body with CreateTodoSchema via zValidator)
    → todoService.create(validatedInput)
      → returns Todo
    → c.json(todo, 201)
```
