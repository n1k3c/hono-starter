import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      DOCS_USERNAME: 'developer',
      DOCS_PASSWORD: 'pass12345',
    },
  },
})
