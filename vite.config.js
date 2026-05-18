import { execSync } from 'node:child_process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function resolveDevBranchLabel(env) {
  const worktreeLabel = env.VITE_WORKTREE_LABEL?.trim()
  if (worktreeLabel) {
    return worktreeLabel
  }

  try {
    const abbr = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: [ 'pipe', 'pipe', 'ignore' ],
    }).trim()

    if (abbr && abbr !== 'HEAD') {
      return abbr
    }

    if (abbr === 'HEAD') {
      const sha = execSync('git rev-parse --short HEAD', {
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: [ 'pipe', 'pipe', 'ignore' ],
      }).trim()
      return sha ? `detached @ ${sha}` : 'detached'
    }
  } catch {
    // Not a git checkout, or git unavailable
  }

  const fromEnv = env.VITE_BRANCH_NAME?.trim()
  if (fromEnv) {
    return fromEnv
  }

  return 'local'
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const parsedPort = Number.parseInt(env.VITE_PORT ?? '', 10)
  const port = Number.isFinite(parsedPort) ? parsedPort : 5173

  const devBranchLabel =
    mode === 'development' ? resolveDevBranchLabel(env) : ''
  const devServerPort = mode === 'development' ? String(port) : ''
  const devPreviewUrl =
    mode === 'development' ? `http://localhost:${port}/` : ''

  return {
    plugins: [ react() ],
    server: {
      port,
      // When a worktree pins a port via .env.local, fail fast instead of picking another port.
      strictPort: Boolean(env.VITE_PORT?.trim()),
    },
    resolve: {
      dedupe: [ 'react', 'react-dom', '@wordpress/element' ],
      alias: {
        'react': 'react',
        'react-dom': 'react-dom',
      },
    },
    define: {
      __RSM_DEV_BRANCH_LABEL__: JSON.stringify(devBranchLabel),
      __RSM_DEV_SERVER_PORT__: JSON.stringify(devServerPort),
      __RSM_DEV_PREVIEW_URL__: JSON.stringify(devPreviewUrl),
    },
  }
})
