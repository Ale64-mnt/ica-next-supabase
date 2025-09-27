# Tools/migrate.py
import argparse
import json
import shutil
from pathlib import Path

# Inizializza colorama per l'output colorato nel terminale
try:
    import colorama
    colorama.init(autoreset=True)
    C_GREEN = colorama.Fore.GREEN
    C_YELLOW = colorama.Fore.YELLOW
    C_RED = colorama.Fore.RED
    C_CYAN = colorama.Fore.CYAN
    C_RESET = colorama.Style.RESET_ALL
except ImportError:
    # Se colorama non è installato, usa stringhe vuote per i colori
    C_GREEN = C_YELLOW = C_RED = C_CYAN = C_RESET = ""

def print_info(message):
    print(f"{C_CYAN}ℹ️ {message}{C_RESET}")

def print_success(message):
    print(f"{C_GREEN}✅ {message}{C_RESET}")

def print_warning(message):
    print(f"{C_YELLOW}⚠️ {message}{C_RESET}")

def print_error(message):
    print(f"{C_RED}❌ {message}{C_RESET}")

def merge_package_json(source_file, dest_file):
    """
    Unisce le dipendenze di due package.json, dando priorità a quelle del file di destinazione.
    """
    print_info(f"Inizio merge di {source_file.name} in {dest_file.name}...")
    
    source_data = json.loads(source_file.read_text(encoding='utf-8'))
    dest_data = json.loads(dest_file.read_text(encoding='utf-8'))
    
    # Prepara le sezioni da unire
    sections_to_merge = ['dependencies', 'devDependencies']
    
    for section in sections_to_merge:
        source_deps = source_data.get(section, {})
        dest_deps = dest_data.get(section, {})
        
        # Unione: inizia con le dipendenze vecchie e aggiorna/sovrascrivi con quelle nuove
        merged_deps = {**source_deps, **dest_deps}
        dest_data[section] = merged_deps
        
    dest_file.write_text(json.dumps(dest_data, indent=2), encoding='utf-8')
    print_success("Merge di package.json completato.")

def copy_with_progress(source, destination, dirs_to_copy, files_to_copy):
    """Copia cartelle e file specificati, mostrando il progresso."""
    
    # Copia intere cartelle
    for dir_name in dirs_to_copy:
        src_path = source / dir_name
        dest_path = destination / dir_name
        if src_path.is_dir():
            print_info(f"Copia della cartella '{dir_name}' in corso...")
            shutil.copytree(src_path, dest_path, dirs_exist_ok=True)
            print_success(f"Cartella '{dir_name}' copiata.")
        else:
            print_warning(f"La cartella sorgente '{dir_name}' non esiste, saltata.")

    # Copia file specifici
    for file_name in files_to_copy:
        src_path = source / file_name
        dest_path = destination / file_name
        if src_path.is_file():
            print_info(f"Copia del file '{file_name}' in corso...")
            dest_path.parent.mkdir(parents=True, exist_ok=True) # Assicura che la cartella di destinazione esista
            shutil.copy2(src_path, dest_path)
            print_success(f"File '{file_name}' copiato.")
        else:
            print_warning(f"Il file sorgente '{file_name}' non esiste, saltato.")

def main():
    parser = argparse.ArgumentParser(description="Script di migrazione per un progetto Next.js.")
    parser.add_argument("sorgente", type=str, help="Percorso della cartella 'webapp' del vecchio progetto.")
    parser.add_argument("destinazione", type=str, help="Percorso della cartella 'webapp' del nuovo progetto.")
    args = parser.parse_args()

    source_path = Path(args.sorgente).resolve()
    dest_path = Path(args.destinazione).resolve()

    # --- VALIDAZIONE DEI PERCORSI ---
    if not source_path.is_dir():
        print_error(f"La cartella sorgente non esiste: {source_path}")
        return
    if not dest_path.is_dir():
        print_error(f"La cartella di destinazione non esiste: {dest_path}")
        return
        
    print_success(f"Sorgente Trovata: {source_path}")
    print_success(f"Destinazione Trovata: {dest_path}\n")

    # --- CONFIGURAZIONE DELLA MIGRAZIONE ---
    # Definisci qui cosa copiare
    DIRS_TO_COPY = ['components', 'public', 'messages']
    FILES_TO_COPY = ['app/globals.css'] # Aggiungi altri file se necessario

    # --- ESECUZIONE ---
    copy_with_progress(source_path, dest_path, DIRS_TO_COPY, FILES_TO_COPY)
    merge_package_json(source_path / "package.json", dest_path / "package.json")
    
    print_warning("\n--- AZIONI POST-MIGRAZIONE RICHIESTE ---")
    print_warning("1. Entra nella cartella di destinazione e lancia 'npm install' per aggiornare le dipendenze.")
    print_warning("2. Controlla manualmente 'next.config.mjs' per unire eventuali configurazioni specifiche (es. 'images.remotePatterns').")
    print_warning("3. Reintegra manualmente la logica delle tue pagine in 'app/[locale]/page.tsx'.")

if __name__ == "__main__":
    main()