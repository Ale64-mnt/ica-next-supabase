import os
from pathlib import Path

print(" INSERIMENTO NUOVE CREDENZIALI DATABASE")
print("=" * 40)

project_root = Path(__file__).parent.parent
env_db_path = project_root / '.env.db'

print("Incolla la NUOVA stringa di connessione dal dashboard Supabase:")
print("(Deve iniziare con: postgresql://postgres.twwgfrbcndouazujgcma:...)")

# Simula l'input - in realtà dovresti incollare la stringa qui
new_connection_string = input().strip()

if new_connection_string.startswith('postgresql://postgres.twwgfrbcndouazujgcma'):
    with open(env_db_path, 'w') as f:
        f.write(new_connection_string)
    print("✅ Credenziali salvate correttamente!")
    print(f"File: {env_db_path}")
else:
    print(" Stringa non valida!")
    print("Deve iniziare con: postgresql://postgres.twwgfrbcndouazujgcma")
