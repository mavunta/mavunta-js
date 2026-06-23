import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  globalName: 'Coinwaka',
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  platform: 'browser',
  target: 'es2020',
})
