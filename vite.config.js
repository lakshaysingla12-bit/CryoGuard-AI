import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  appType: 'mpa',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        landing: resolve(process.cwd(), 'index.html'),
        manager: resolve(process.cwd(), 'portals/manager/index.html'),
        worker: resolve(process.cwd(), 'portals/worker/index.html'),
        auditor: resolve(process.cwd(), 'portals/auditor/index.html'),
      },
    },
  },
})
