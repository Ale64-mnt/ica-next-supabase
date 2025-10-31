import os
from dotenv import load_dotenv
from pathlib import Path

print(" DEBUG - TUTTE LE VARIABILI CARICATE")
print("=" * 40)

# Carica i file
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env.local')
load_dotenv(project_root / '.env.db')

# Mostra TUTTE le variabili di ambiente
print("Tutte le variabili che iniziano con NEXT_ o SUPABASE:")
for key, value in sorted(os.environ.items()):
    if key.startswith(('NEXT_', 'SUPABASE')):
        print(f"  {key}: {value}")

print(f"\n Cercando specificamente:")
target_keys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_DB_URL'
]

for key in target_keys:
    value = os.getenv(key)
    print(f"  {key}: {value if value else ' NULL'}")
