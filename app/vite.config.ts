/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  define: {
    global: 'globalThis',   // ⬅️ crea alias de global para el browser
    // opcional si alguna lib lee process.env:
    // 'process.env': {}
  },
    optimizeDeps: {
    // ayuda a preempaquetar correctamente
    include: ['pouchdb-browser', 'pouchdb-find', 'events'],
  },
})
