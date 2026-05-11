# Cursor runs this from the new worktree root when using Agent worktrees, `/worktree`, or CLI.
# See https://cursor.com/docs/configuration/worktrees — use npm ci here, not symlinked node_modules.
$ErrorActionPreference = 'Stop'

$RepoRoot = (Get-Location).Path
Set-Location $RepoRoot

npm ci

$utf8 = [System.Text.Encoding]::UTF8
$md5 = [System.Security.Cryptography.MD5]::Create()
$bytes = $md5.ComputeHash($utf8.GetBytes($RepoRoot))
$num = [BitConverter]::ToUInt32($bytes, 0)
$Port = 5174 + ($num % 800)

$EnvLocal = Join-Path $RepoRoot '.env.local'
$Tmp = Join-Path $RepoRoot '.env.local.tmp'

if (-not (Test-Path $EnvLocal)) {
    $root = $env:ROOT_WORKTREE_PATH
    if ($root -and (Test-Path (Join-Path $root '.env.local'))) {
        Copy-Item (Join-Path $root '.env.local') $EnvLocal
    }
}

$content = @()
if (Test-Path $EnvLocal) {
    $content = Get-Content $EnvLocal | Where-Object { $_ -notmatch '^\s*VITE_PORT=' }
}
$content += "VITE_PORT=$Port"
Set-Content -Path $Tmp -Value $content -Encoding utf8
Move-Item -Force $Tmp $EnvLocal

Write-Host "Worktree setup complete. VITE_PORT=$Port (see .env.local)"
