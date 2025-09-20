param(
  [switch]$WhatIf  # dry-run: mostra cosa verrebbe fatto senza toccare i file
)

$ErrorActionPreference = "Stop"

# 1) Verifica posizione: deve esistere la cartella Tools nella dir corrente
if (-not (Test-Path -Path ".\Tools" -PathType Container)) {
  Write-Error "Esegui questo script dalla ROOT del repository (non trovo .\Tools)."
  exit 2
}

# 2) Crea cartella d'archivio datata
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$archiveRoot = Join-Path -Path ".\Tools\_archive" -ChildPath $stamp
if (-not $WhatIf) {
  New-Item -ItemType Directory -Path $archiveRoot -Force | Out-Null
}
Write-Host "Archivio: $archiveRoot"

# 3) Pattern dei file da archiviare (estendibile)
$patterns = @(
  "fix_*.py",
  "patch_*.py"
)

# 4) Raccogli i file da spostare
$toMove = @()
foreach ($pat in $patterns) {
  $toMove += Get-ChildItem -Path ".\Tools" -Filter $pat -File -ErrorAction SilentlyContinue
}

if ($toMove.Count -eq 0) {
  Write-Host "Nessun file da archiviare (pattern: $($patterns -join ', '))."
  exit 0
}

# 5) Sposta (o simula con -WhatIf)
Write-Host "Trovati $($toMove.Count) file da archiviare:`n"
$toMove | ForEach-Object { Write-Host "  - $($_.Name)" }

if ($WhatIf) {
  Write-Host "`n[DRY-RUN] Non sposto nulla (usa senza -WhatIf per eseguire)."
  exit 0
}

Write-Host ""
foreach ($f in $toMove) {
  $dest = Join-Path -Path $archiveRoot -ChildPath $f.Name
  Move-Item -LiteralPath $f.FullName -Destination $dest -Force
  Write-Host "➡  Spostato: $($f.Name)"
}

# 6) Report finale e promemoria
Write-Host "`n✅ Archiviazione completata in: $archiveRoot"
Write-Host "Consiglio: build/preflight e run app per sicurezza."
