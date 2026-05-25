param(
  [Parameter(Mandatory = $true)]
  [string]$ApiKey,
  [string]$Model = "glm-4.7-flash"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$EnvFile = Join-Path $RepoRoot ".env"

function Set-Or-AppendEnvValue {
  param(
    [string]$Key,
    [string]$Value
  )

  $escaped = [regex]::Escape($Key)
  $line = "$Key=$Value"

  if (-not (Test-Path $EnvFile)) {
    Set-Content -LiteralPath $EnvFile -Value $line
    return
  }

  $content = Get-Content -LiteralPath $EnvFile
  if ($content -match "^$escaped=") {
    $updated = $content | ForEach-Object {
      if ($_ -match "^$escaped=") { $line } else { $_ }
    }
    Set-Content -LiteralPath $EnvFile -Value $updated
  } else {
    Add-Content -LiteralPath $EnvFile -Value $line
  }
}

Set-Or-AppendEnvValue -Key "NUSKHA_AI_PROVIDER" -Value "nahcrof"
Set-Or-AppendEnvValue -Key "OPENAI_BASE_URL" -Value "https://ai.nahcrof.com/v1"
Set-Or-AppendEnvValue -Key "OPENAI_API_KEY" -Value $ApiKey
Set-Or-AppendEnvValue -Key "OPENAI_MODEL" -Value $Model
Set-Or-AppendEnvValue -Key "NUSKHA_AI_TIMEOUT_MS" -Value "30000"

Write-Host "Nahcrof AI is configured in $EnvFile" -ForegroundColor Green
Write-Host "Base URL: https://ai.nahcrof.com/v1"
Write-Host "Model: $Model"
Write-Host ""
Write-Host "Check with:"
Write-Host "npm run ai:health"

