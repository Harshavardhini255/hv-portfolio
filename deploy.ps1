param(
  [Parameter(Position = 0)]
  [string]$Message = "Update portfolio"
)

$ErrorActionPreference = "Continue"
Set-Location -LiteralPath $PSScriptRoot

function Invoke-Native {
  param([string]$Exe, [string[]]$NativeArgs)
  $out = & $Exe @NativeArgs 2>&1
  $code = $LASTEXITCODE
  if ($out) { $out | ForEach-Object { Write-Output "  $_" } }
  return $code
}

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($branch -ne "main") {
  Write-Output "ERROR: not on main (currently '$branch'). Switch to main first."
  exit 1
}

Write-Output "Staging changes..."
$null = Invoke-Native "git" @("add", "-A")

$staged = @(git diff --cached --name-only 2>$null)
if ($staged.Count -eq 0) {
  Write-Output "Nothing to commit - working tree is clean."
}
else {
  Write-Output "Changed files:"
  $staged | ForEach-Object { Write-Output "  $_" }
  $null = Invoke-Native "git" @("commit", "-q", "-m", $Message)
  if ($LASTEXITCODE -ne 0) {
    Write-Output "ERROR: commit failed."
    exit 1
  }
  Write-Output "Committed: $Message"
}

Write-Output "Pushing to origin/$branch..."
$code = Invoke-Native "git" @("push", "origin", $branch)
if ($code -ne 0) {
  Write-Output "ERROR: push failed."
  exit 1
}

$runId = $null
for ($i = 0; $i -lt 20; $i++) {
  Start-Sleep -Seconds 3
  $runId = gh run list --branch $branch --limit 1 --json databaseId --jq ".[0].databaseId" 2>$null
  if ($runId) { $runId = $runId.Trim(); break }
}

if (-not $runId) {
  Write-Output "Pushed, but no workflow run detected yet."
  Write-Output "Check: https://github.com/Harshavardhini255/hv-portfolio/actions"
  exit 0
}

Write-Output "Watching deploy run $runId..."
$null = Invoke-Native "gh" @("run", "watch", $runId, "--exit-status", "--compact")
if ($LASTEXITCODE -ne 0) {
  Write-Output "ERROR: deploy failed - see https://github.com/Harshavardhini255/hv-portfolio/actions"
  exit 1
}

Write-Output ""
Write-Output "Live at https://harshavardhini255.github.io/hv-portfolio/"
