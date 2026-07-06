import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@test-utils': fileURLToPath(new URL('./__tests__/test-utils.tsx', import.meta.url))
    }
  },
  server: {
    port: 4000,
    strictPort: true
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.spec.{ts,tsx}'],
    css: true,
    coverage: {
      provider: 'v8',
      // json-summary alimenta o script de CI que publica % no job summary e atualiza o badge do README
      reporter: ['text', 'html', 'json-summary'],
      exclude: ['node_modules/', 'src/main.tsx', 'src/vite-env.d.ts']
    }
  }
})
