import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const parsedPort = Number.parseInt(env.VITE_PORT ?? '', 10)
  const port = Number.isFinite(parsedPort) ? parsedPort : 5173

  return {
    plugins: [react()],
    server: {
      port,
      // When a worktree pins a port via .env.local, fail fast instead of picking another port.
      strictPort: Boolean(env.VITE_PORT?.trim()),
    },
    resolve: {
      dedupe: ['react', 'react-dom', '@wordpress/element'],
      alias: {
        'react': 'react',
        'react-dom': 'react-dom',
      },
    },
  }
})
