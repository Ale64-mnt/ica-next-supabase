param(
  [string]$Phase,    # es. PL-6i
  [string]$Title,    # es. "Automazione worklog"
  [string]$Time,     # es. "1h 30m" oppure "45m"
  [string]$Bullets = ""  # es. "punto1;;punto2"
)

$ErrorActionPreference = "Stop"

function Ensure-Python {
  $paths = @(
    ".\.venv\Scripts\python.exe",
    "python",
    "py"
  )
  foreach ($p in $paths) {
    try {
      $v = & $p -V 2>$null
      if ($LASTEXITCODE -eq 0 -and $v) { return $p }
    } catch {}
  }
  throw "Python non trovato. Assicurati di avere .venv o python nel PATH."
}

function AskIfEmpty([string]$val, [string]$prompt) {
  if ([string]::IsNullOrWhiteSpace($val)) {
    return Read-Host $prompt
  }
  return $val
}

Write-Host "=== Fase 1: Sync & Preflight ===" -ForegroundColor Cyan
git pull

$py = Ensure-Python

# Preflight base (non interrompe se warning)
try {
  & $py Tools\preflight.py
} catch {
  Write-Warning "preflight.py ha riportato un errore (continuo per consentire fix/commit). Dettagli: $($_.Exception.Message)"
}

Write-Host "`n=== Fase 5: Verifiche automatiche ===" -ForegroundColor Cyan
# Verifiche (tolleranti)
try { & $py Tools\verify_stack_readiness.py } catch { Write-Warning "verify_stack_readiness: $($_.Exception.Message)" }
try { & $py Tools\pl_gitignore_check.py } catch { Write-Warning "pl_gitignore_check: $($_.Exception.Message)" }

# Parametri umani (Fase 6)
$Phase  = AskIfEmpty $Phase  "Inserisci Phase (es. PL-6i)"
$Title  = AskIfEmpty $Title  "Inserisci Title (es. Automazione worklog)"
$Time   = AskIfEmpty $Time   "Inserisci Time (es. 1h 30m o 45m)"
if ([string]::IsNullOrWhiteSpace($Bullets)) {
  $Bullets = Read-Host "Bullets separati da ';;' (opzionale, invio per saltare)"
}

Write-Host "`n=== Fase 6: Commit + Worklog + Push ===" -ForegroundColor Cyan

# Commit standardizzato
$commitMsg = "$($Phase): $Title -- tempo $Time"
git add -A
git commit -m $commitMsg

# Aggiorna/crea sezione nel worklog
& $py Tools\worklog_autolog.py --phase $Phase --title $Title --time $Time --bullets $Bullets

# Normalizza sezioni (⏱ a fondo sezione)
& $py Tools\worklog_normalize_sections.py

# Ricalcola Totale (idempotente, robusto)
& $py Tools\update_worklog.py

# Push
git push origin main

# Mostra totale aggiornato
Write-Host "=== Totale aggiornato ===" -ForegroundColor Green
$lastTotal = (Get-Content worklog.md -Raw) -split "`n" | Where-Object { $_ -match '^\s*⏱ ' } | Select-Object -Last 1
Write-Host $lastTotal
