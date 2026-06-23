import { defineConfig } from 'vitest/config'

// Scope vitest to THIS package so it never walks up and discovers an ancestor
// repo's config or test files.
export default defineConfig({
  root: __dirname,
  test: {
    include: ['test/**/*.test.ts'],
  },
})
