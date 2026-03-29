import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = (env.VITE_API_URL || '').trim()

  /**
   * Dev server only: `/api/*` → backend. Uses `VITE_API_URL` when it’s a full URL
   * (same value as production; typically http://localhost:9001 locally, https://… on CI
   * if you ever run `vite dev` with that env). Otherwise default local backend.
   */
  const devProxyTarget = /^https?:\/\//i.test(apiUrl) ? apiUrl : 'http://localhost:9001'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: devProxyTarget,
          changeOrigin: true,
          secure: devProxyTarget.startsWith('https:'),
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
