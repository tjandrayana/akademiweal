import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiHost = (env.VITE_API_HOST || 'localhost').trim()
  const apiPort = (env.VITE_API_PORT || '9001').trim()
  // Full URL for dev proxy (https://api.example.com). When set, host/port below are ignored for the proxy.
  const proxyTarget = (env.VITE_API_PROXY_TARGET || '').trim()
  const target = proxyTarget || `http://${apiHost}:${apiPort}`

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: target.startsWith('https:'),
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
