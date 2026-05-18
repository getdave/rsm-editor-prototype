#!/usr/bin/env bash
# Cursor runs this from the new worktree root when using Agent worktrees, `/worktree`, or CLI.
# See https://cursor.com/docs/configuration/worktrees — use npm ci here, not symlinked node_modules.
set -euo pipefail

REPO_ROOT="$(pwd -P)"
cd "$REPO_ROOT"

npm ci
node scripts/worktree.mjs setup
