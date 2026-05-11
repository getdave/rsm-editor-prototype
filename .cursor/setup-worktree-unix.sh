#!/usr/bin/env bash
# Cursor runs this from the new worktree root when using Agent worktrees, `/worktree`, or CLI.
# See https://cursor.com/docs/configuration/worktrees — use npm ci here, not symlinked node_modules.
set -euo pipefail

REPO_ROOT="$(pwd -P)"
cd "$REPO_ROOT"

npm ci

# Stable port per worktree path (5174–5973) so parallel agents rarely collide. Main clone can stay on 5173.
PORT=$((5174 + $(printf '%s' "$REPO_ROOT" | cksum | awk '{print $1}') % 800))
ENV_LOCAL="$REPO_ROOT/.env.local"
TMP="$REPO_ROOT/.env.local.tmp"

if [[ -f "$ENV_LOCAL" ]]; then
  :
elif [[ -n "${ROOT_WORKTREE_PATH:-}" && -f "${ROOT_WORKTREE_PATH}/.env.local" ]]; then
  cp "${ROOT_WORKTREE_PATH}/.env.local" "$ENV_LOCAL"
fi

{
  if [[ -f "$ENV_LOCAL" ]]; then
    grep -v '^VITE_PORT=' "$ENV_LOCAL" || true
  fi
  printf 'VITE_PORT=%s\n' "$PORT"
} > "$TMP"

mv "$TMP" "$ENV_LOCAL"

echo "Worktree setup complete. VITE_PORT=$PORT (see .env.local)"
