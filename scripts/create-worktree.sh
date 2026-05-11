#!/usr/bin/env bash
# Creates a sibling-directory git worktree. Installs deps with npm ci (no symlinked node_modules).
# https://cursor.com/docs/configuration/worktrees
set -euo pipefail

usage() {
  echo "Usage: $0 <branch-name> [port]" >&2
  echo "  branch-name  Git branch (new or existing). / in names are turned into - for the folder name." >&2
  echo "  port         Dev server port for this worktree (default: 5174)" >&2
  exit 1
}

FEATURE_NAME="${1:-}"
if [[ -z "$FEATURE_NAME" ]]; then
  usage
fi

PORT="${2:-5174}"

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

PARENT="$(dirname "$ROOT")"
WORKTREE_SLUG="${FEATURE_NAME//\//-}"
WORKTREE_DIR="${PARENT}/rsm-prototyping-${WORKTREE_SLUG}"

if [[ -e "$WORKTREE_DIR" ]]; then
  echo "Refusing to create worktree: path already exists: $WORKTREE_DIR" >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/${FEATURE_NAME}"; then
  git worktree add "$WORKTREE_DIR" "$FEATURE_NAME"
else
  git worktree add -b "$FEATURE_NAME" "$WORKTREE_DIR"
fi

{
  if [[ -f "${ROOT}/.env.local" ]]; then
    grep -v '^VITE_PORT=' "${ROOT}/.env.local" | grep -v '^VITE_BRANCH_NAME=' || true
  fi
  echo "VITE_PORT=${PORT}"
  echo "VITE_BRANCH_NAME=${FEATURE_NAME}"
} > "${WORKTREE_DIR}/.env.local.tmp"
mv "${WORKTREE_DIR}/.env.local.tmp" "${WORKTREE_DIR}/.env.local"

# Install dependencies in the worktree (do not symlink node_modules — see Cursor worktrees guidance).
(cd "${WORKTREE_DIR}" && npm ci)

echo "Installed dependencies with npm ci."

echo ""
echo "Worktree ready: ${WORKTREE_DIR}"
echo "  cd \"${WORKTREE_DIR}\" && npm run dev"
echo "  Preview: http://localhost:${PORT}"
