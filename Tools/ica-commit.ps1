param(
  [string]$Message = "Commit generico"
)

# spostati nella root del repo
cd "C:\Users\Alessandro\ica-Next.js + Supabase"

# aggiungi tutto (modifiche + nuovi file + cancellati)
git add -A

# crea commit con messaggio passato come parametro
git commit -m $Message

# push immediato su origin/main
git push origin main
