param(
  [Parameter(Mandatory=$true)][string]$Phase,   # es. PL-6h
  [Parameter(Mandatory=$true)][string]$Title,   # es. "Gitignore integration"
  [Parameter(Mandatory=$true)][string]$Time,    # es. "15m" o "1h 30m"
  [string]$Bullets = ""                         # es. "punto1;;punto2"
)

# 1) Commit (wrappo per i due punti dopo la variabile)
$commitMsg = "$($Phase): $Title -- tempo $Time"
git add -A
git commit -m $commitMsg

# 2) Aggiorna/crea sezione fase
.\.venv\Scripts\python.exe Tools\worklog_autolog.py --phase $Phase --title $Title --time $Time --bullets $Bullets

# 3) Normalizza sezioni (⏱ in fondo)
.\.venv\Scripts\python.exe Tools\worklog_normalize_sections.py

# 4) Ricalcola totale (solo sezioni standard)
.\.venv\Scripts\python.exe Tools\update_worklog.py

# 5) Push
git push origin main

# 6) Stampa il totale
Write-Host "=== Totale aggiornato ==="
$lastTotal = (Get-Content worklog.md -Raw) -split "`n" | Where-Object { $_ -match '^\s*⏱ ' } | Select-Object -Last 1
Write-Host $lastTotal
