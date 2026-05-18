# Cursor runs this from the new worktree root when using Agent worktrees, `/worktree`, or CLI.
# See https://cursor.com/docs/configuration/worktrees — use npm ci here, not symlinked node_modules.
$ErrorActionPreference = 'Stop'

$RepoRoot = (Get-Location).Path
Set-Location $RepoRoot

npm ci
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node scripts/worktree.mjs setup
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
