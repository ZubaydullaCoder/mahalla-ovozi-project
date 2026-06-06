import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['scripts/**/*.ts', 'apps/**/*.test.ts', 'apps/**/*.spec.ts'],
    environment: 'node',
  },
})
