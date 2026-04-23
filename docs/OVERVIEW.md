# Project Overview

## What This Project Is

**Hono API** — the backend for a TODO application with real-time sync.

This project is the **data layer** — it owns the database, authentication, and business logic. A separate TanStack Start frontend consumes this API and uses Electric Cloud for real-time data sync.

## What Users Can Do

- Register and sign in (email + password via Better Auth)
- Create, update, and delete TODO items
- Get real-time sync via Electric Cloud (client-side, not this project)

## Key Design Decisions

- **Better Auth** for authentication — handles signup, login, sessions, password hashing
- **Drizzle ORM** with standard `pg` driver for database access
- **Transaction IDs (txid)** returned on every mutation — the frontend uses these to ensure Electric Cloud sync consistency
- **OpenAPI + Scalar** for API documentation and testing
- **No GET /todos endpoint** — reads go through Electric Cloud directly to the client
- **Electric Cloud** for production sync; self-hosted ElectricSQL via Docker for local dev

## Architecture

Controller → Service → Schema layered pattern. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for details.
