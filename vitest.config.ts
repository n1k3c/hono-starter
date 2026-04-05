import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      DOCS_USERNAME: 'developer',
      DOCS_PASSWORD: 'pass12345',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/hono_starter_test',
      BETTER_AUTH_SECRET: 'test-secret-key',
      BETTER_AUTH_URL: 'http://localhost:3000',
      CORS_ORIGIN: 'http://localhost:3001',
    },
  },
})
