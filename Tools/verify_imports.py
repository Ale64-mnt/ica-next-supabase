import os
import re
import argparse
from pathlib import Path

# --- CONFIGURAZIONE ---
# Definisce l'alias del percorso comune in Next.js. Modificalo se necessario.
# Qui assumiamo che '@/' punti alla radice della cartella 'webapp'.
PATH_ALIASES = {
    "@/": ""
}

# Estensioni dei file da analizzare
FILE_EXTENSIONS = ('.tsx', '.jsx', '.ts', '.js')

# Cartelle da ignorare durante la scansione
IGNORE_DIRS = ('node_modules', '.next', 'public')

# --- MOTORE DI ANALISI ---

def analyze_exports(file_path):
    """
    Analizza un singolo file per identificare i suoi export.
    Restituisce un dizionario con le informazioni sugli export.
    """
    exports = {'default': False, 'named': set()}
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

            # Cerca 'export default'
            if re.search(r'export\s+default\s+', content):
                exports['default'] = True

            # Cerca export con nome, es: export function Component() | export const variable = ...
            named_exports = re.findall(r'export\s+(?:const|function|let|var|class)\s+([a-zA-Z0-9_]+)', content)
            exports['named'].update(named_exports)

            # Cerca export con nome in blocco, es: export { Component1, Component2 }
            named_in_block = re.findall(r'export\s+\{([^}]+)\}', content)
            for block in named_in_block:
                # Pulisce e splitta i nomi, gestendo anche gli alias (es. { name as alias })
                names = [n.split(' as ')[0].strip() for n in block.split(',')]
                exports['named'].update(n for n in names if n) # Aggiunge solo se non è una stringa vuota

    except Exception:
        # Ignora file che non possono essere letti
        pass
    return exports

def resolve_path(importer_path, import_str, webapp_root):
    """
    Converte un percorso di import (es. '@/components/Header') in un percorso di file reale.
    """
    # Gestisce gli alias
    for alias, replacement in PATH_ALIASES.items():
        if import_str.startswith(alias):
            import_str = replacement + import_str[len(alias):]
            base_path = webapp_root
            return Path(base_path) / Path(import_str)

    # Gestisce i percorsi relativi
    if import_str.startswith('.'):
        base_path = Path(importer_path).parent
        return (base_path / Path(import_str)).resolve()
        
    return None # Non è un percorso che possiamo risolvere (es. una libreria come 'react')

def find_file_from_path(resolved_path):
    """
    Cerca un file nel filesystem, provando le diverse estensioni.
    """
    # Se il percorso punta già a un file, restituiscilo
    if resolved_path.exists() and resolved_path.is_file():
        return str(resolved_path)

    # Altrimenti, prova ad aggiungere le estensioni
    for ext in FILE_EXTENSIONS:
        path_with_ext = Path(str(resolved_path) + ext)
        if path_with_ext.exists():
            return str(path_with_ext)
    
    # Prova con /index.[ext] per le importazioni di cartelle
    for ext in FILE_EXTENSIONS:
        path_with_index = resolved_path / f"index{ext}"
        if path_with_index.exists():
            return str(path_with_index)

    return None

def main(webapp_path):
    """
    Funzione principale che orchestra la scansione e la verifica.
    """
    print(f"🔍 Inizio la scansione della cartella: {webapp_path}\n")
    
    exports_database = {}
    files_to_check = []

    # Passo 1: Scansiona tutti i file e costruisce il database degli export
    for root, dirs, files in os.walk(webapp_path):
        # Esclude le cartelle da ignorare
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            if file.endswith(FILE_EXTENSIONS):
                full_path = os.path.join(root, file)
                files_to_check.append(full_path)
                exports_database[full_path] = analyze_exports(full_path)

    print(f"✅ Trovati e analizzati {len(exports_database)} file.\n---")
    
    error_count = 0
    
    # Passo 2: Verifica le importazioni per ogni file
    # Regex per catturare default, named imports e il path
    import_regex = re.compile(r'import\s+(?:([a-zA-Z0-9_]+),?)?\s*(?:\{([^}]+)\})?\s+from\s+[\'"]([^\'"]+)[\'"]')

    for file_path in files_to_check:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    match = import_regex.match(line.strip())
                    if not match:
                        continue

                    default_import, named_imports_str, import_str = match.groups()
                    
                    # Risolve il percorso dell'import in un percorso di file assoluto
                    resolved_base = resolve_path(file_path, import_str, webapp_path)
                    if not resolved_base:
                        continue
                    
                    imported_file_path = find_file_from_path(resolved_base)
                    if not imported_file_path or imported_file_path not in exports_database:
                        continue
                    
                    # Ottiene le info di export del file importato
                    target_exports = exports_database[imported_file_path]

                    # --- LOGICA DI CONTROLLO ---
                    
                    # 1. Controlla l'import di default
                    if default_import and not target_exports['default']:
                        error_count += 1
                        print(f"🔴 ERRORE: Discrepanza nell'import di default")
                        print(f"   - File: {os.path.relpath(file_path, webapp_path)}")
                        print(f"   - Riga {line_num}: {line.strip()}")
                        print(f"   - Problema: Si tenta di importare '{default_import}' come default, ma '{os.path.basename(imported_file_path)}' non ha un export default.")
                        if target_exports['named']:
                            print(f"   - Suggerimento: Forse intendevi un'importazione con nome? Es: import {{ {default_import} }} from '{import_str}';")
                        print("-" * 20)

                    # 2. Controlla gli import con nome
                    if named_imports_str:
                        named_imports = {i.split(' as ')[0].strip() for i in named_imports_str.split(',')}
                        for name in named_imports:
                            if name and name not in target_exports['named']:
                                error_count += 1
                                print(f"🟡 ERRORE: Discrepanza nell'import con nome")
                                print(f"   - File: {os.path.relpath(file_path, webapp_path)}")
                                print(f"   - Riga {line_num}: {line.strip()}")
                                print(f"   - Problema: Si tenta di importare '{name}', che non è presente negli export di '{os.path.basename(imported_file_path)}'.")
                                if target_exports['default']:
                                     print(f"   - Suggerimento: Forse cercavi l'export di default? Es: import {name} from '{import_str}';")
                                else:
                                     print(f"   - Export disponibili: {list(target_exports['named'])}")
                                print("-" * 20)

        except Exception as e:
            print(f"⚠️ Impossibile analizzare il file {file_path}: {e}")

    print("\n---")
    if error_count == 0:
        print("🎉 Scansione completata. Nessuna discrepanza evidente trovata!")
    else:
        print(f"💔 Scansione completata. Trovati {error_count} potenziali errori.")

# --- ESECUZIONE ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verifica la coerenza degli import/export in un progetto Next.js.")
    # Calcola il percorso di default della webapp, che è la cartella sorella di 'Tools'
    default_webapp_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'webapp'))
    parser.add_argument("path", nargs='?', default=default_webapp_path, help=f"Percorso della cartella webapp da analizzare (default: {default_webapp_path})")
    
    args = parser.parse_args()

    if not os.path.isdir(args.path):
        print(f"Errore: Il percorso '{args.path}' non è una cartella valida.")
    else:
        main(os.path.abspath(args.path))