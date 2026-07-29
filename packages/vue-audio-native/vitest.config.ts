import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    coverage: {
      exclude: ['src/index.ts', 'src/types.ts'],
      include: ['src/**/*.{ts,vue}'],
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      thresholds: {
        branches: 80,
        functions: 85,
        lines: 85,
        statements: 85
      }
    },
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts']
  }
})
