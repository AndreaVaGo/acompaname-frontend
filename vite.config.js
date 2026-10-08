import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // Los tests e2e los ejecuta Playwright, no Vitest
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
})
