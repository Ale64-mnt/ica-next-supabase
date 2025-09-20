param(
  [Parameter(Mandatory=$true)][string]$Phase,   # es. PL-6h
  [Parameter(Mandatory=$true)][string]$Title,   # es. "Gitignore integration"
  [Parameter(Mandatory=$true)][string]$Time,    # es. "15m" o "1h 30m"
  [string]$Bullets = ""                         # es. "punto1;;punto2"
)

# 1) Commit standard (wrappo le variabili per evitare l'errore con ':')
$commitMsg = "$($Phase): $Title -- tempo $Time"

git add -A
git commit -m $commitMsg

# 2) Aggiorna worklog (fase + titolo + durata + bullet)
.\.venv\Scripts\python.exe Tools\worklog_autolog.py --phase $Phase --title $Title --time $Time --bullets $Bullets

# 3) Push
git push origin main

# 4) Mostra il totale aggiornato
Write-Host "=== Totale aggiornato ==="
Select-String "⏱" worklog.md | Select-Object -Last 1
