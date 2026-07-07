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
    // default de 5s aperta em runners de CI mais lentos pra specs com muitos userEvent.type sequenciais
    // (formulário de cadastro inteiro) rodando sob --coverage; local fica em ~2-3.5s, CI passou de 5s
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      // json-summary alimenta o script de CI que publica % no job summary e atualiza o badge do README
      reporter: ['text', 'html', 'json-summary'],
      // include força a instrumentação da árvore inteira de src/, não só dos arquivos que algum spec importou
      include: ['src/**/*.{ts,tsx}'],
      // Composição pura (wiring de providers/rotas/store) e styled-components — sem lógica de negócio pra
      // testar, mesmo espírito da exclusão de *.module.ts no backend
      exclude: [
        'node_modules/',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/types.ts',
        'src/**/*.d.ts',
        'src/App.tsx',
        'src/theme.ts',
        'src/routes/Routes.tsx',
        'src/store/index.ts',
        'src/services/api/axiosApi.ts',
        'src/**/styles.ts'
      ]
    }
  }
})
