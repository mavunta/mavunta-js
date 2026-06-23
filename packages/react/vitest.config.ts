import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Scoped to this package; jsdom for component rendering.
export default defineConfig({
  plugins: [react()],
  root: __dirname,
  test: {
    include: ['test/**/*.test.tsx'],
    environment: 'jsdom',
    // Enables @testing-library/react's automatic DOM cleanup between tests.
    globals: true,
  },
})
