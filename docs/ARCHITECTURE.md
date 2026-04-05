# Layered Architecture Documentation

- `src/index.ts` — single entry point: creates a Hono app, defines routes, and starts the server
- Uses `@hono/node-server` `serve()` as the HTTP server adapter
- TSConfig targets ESNext with NodeNext module resolution, JSX configured for Hono's JSX (`hono/jsx`)
- Package manager: pnpm
- Documentation available at `api/docs`