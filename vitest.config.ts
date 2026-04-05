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
