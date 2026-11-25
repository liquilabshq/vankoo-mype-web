import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    // e2e/ son pruebas de Playwright contra un despliegue real (pnpm test:e2e), no de Vitest.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
