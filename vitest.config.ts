import path from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.spec.ts'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['composables/**/*.ts', 'stores/**/*.ts', 'utils/**/*.ts', 'components/**/*.vue', 'layouts/**/*.vue'],
      exclude: [
        'node_modules/',
        'tests/',
        'pages/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '.nuxt/',
        '.output/',
        'nuxt.config.ts',
        'vitest.config.ts',
        'eslint.config.mjs',
        'types/**/*.ts',
        'plugins/**/*.ts',
        '**/*.d.ts',
        '**/*.config.{js,ts,mjs,cjs}',
        '**/dist/**',
        '**/build/**',
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, '.'),
    },
  },
})
