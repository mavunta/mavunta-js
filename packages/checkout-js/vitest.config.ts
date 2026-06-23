import { defineConfig } from 'vitest/config'

// Scope vitest to this package so it never discovers an ancestor repo's config.
export default defineConfig({
  root: __dirname,
  test: {
    include: ['test/**/*.test.ts'],
  },
})
