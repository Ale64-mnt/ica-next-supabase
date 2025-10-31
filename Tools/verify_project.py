#!/usr/bin/env python3
"""
Script di verifica completo per progetto Next.js + Supabase
Posizionare in: Tools/verify_project.py
"""

import os
import sys
import subprocess
import json
from pathlib import Path
import re

class ProjectVerifier:
    def __init__(self, project_root=".."):
        self.project_root = Path(project_root)
        self.webapp_path = self.project_root / "webapp"
        self.results = {}
        
    def print_header(self, title):
        print(f"\n{'='*60}")
        print(f"🔍 {title}")
        print(f"{'='*60}")
    
    def print_success(self, message):
        print(f"✅ {message}")
        
    def print_warning(self, message):
        print(f"⚠️  {message}")
        
    def print_error(self, message):
        print(f"❌ {message}")
    
    def run_command(self, cmd, cwd=None):
        """Esegue un comando e ritorna il risultato"""
        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
            return result.stdout, result.stderr, result.returncode
        except Exception as e:
            return "", str(e), 1
    
    def verify_project_structure(self):
        """Verifica la struttura del progetto"""
        self.print_header("STRUTTURA PROGETTO")
        
        essential_dirs = [
            self.webapp_path,
            self.webapp_path / "app",
            self.webapp_path / "app/components",
            self.webapp_path / "app/components/navigation",
            self.webapp_path / "public"
        ]
        
        for dir_path in essential_dirs:
            if dir_path.exists():
                self.print_success(f"Cartella trovata: {dir_path.relative_to(self.project_root)}")
            else:
                self.print_error(f"Cartella mancante: {dir_path.relative_to(self.project_root)}")
    
    def verify_package_json(self):
        """Verifica package.json e dipendenze"""
        self.print_header("PACKAGE.JSON E DIPENDENZE")
        
        package_json_path = self.webapp_path / "package.json"
        if not package_json_path.exists():
            self.print_error("package.json non trovato")
            return
            
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
            
            # Verifica dipendenze essenziali
            essential_deps = ["next", "react", "react-dom", "typescript"]
            supabase_deps = ["@supabase/supabase-js", "@supabase/ssr"]
            i18n_deps = ["next-intl"]
            
            dependencies = package_data.get("dependencies", {})
            dev_dependencies = package_data.get("devDependencies", {})
            all_deps = {**dependencies, **dev_dependencies}
            
            for dep in essential_deps:
                if dep in all_deps:
                    self.print_success(f"{dep}: {all_deps[dep]}")
                else:
                    self.print_error(f"{dep} mancante")
            
            for dep in supabase_deps:
                if dep in all_deps:
                    self.print_success(f"{dep}: {all_deps[dep]}")
                else:
                    self.print_warning(f"{dep} mancante")
            
            for dep in i18n_deps:
                if dep in all_deps:
                    self.print_success(f"{dep}: {all_deps[dep]}")
                else:
                    self.print_warning(f"{dep} mancante")
                    
        except Exception as e:
            self.print_error(f"Errore lettura package.json: {e}")
    
    def verify_environment_files(self):
        """Verifica file di ambiente"""
        self.print_header("VARIABILI D'AMBIENTE")
        
        env_files = list(self.webapp_path.glob(".env*"))
        if not env_files:
            self.print_warning("Nessun file .env trovato")
            return
            
        for env_file in env_files:
            print(f"\n--- {env_file.name} ---")
            try:
                with open(env_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Cerca variabili Supabase
                supabase_vars = re.findall(r'SUPABASE_(URL|ANON_KEY|SERVICE_ROLE_KEY)=.*', content)
                next_public_vars = re.findall(r'NEXT_PUBLIC_.*', content)
                
                for var in supabase_vars:
                    if "KEY" in var:
                        # Nasconde i valori delle chiavi
                        masked_var = re.sub(r'=(.*)', '=***', var)
                        self.print_success(masked_var)
                    else:
                        self.print_success(var)
                
                for var in next_public_vars:
                    self.print_success(var)
                    
                if not supabase_vars:
                    self.print_warning("Nessuna variabile Supabase trovata")
                    
            except Exception as e:
                self.print_error(f"Errore lettura {env_file.name}: {e}")
    
    def verify_i18n_configuration(self):
        """Verifica configurazione i18n"""
        self.print_header("CONFIGURAZIONE I18N (NEXT-INTL)")
        
        # Verifica cartella i18n
        i18n_path = self.webapp_path / "i18n"
        if i18n_path.exists():
            self.print_success("Cartella i18n trovata")
            i18n_files = list(i18n_path.glob("*"))
            for file in i18n_files:
                self.print_success(f"File i18n: {file.name}")
        else:
            self.print_warning("Cartella i18n non trovata")
        
        # Verifica cartella messages
        messages_path = self.webapp_path / "app" / "messages"
        if messages_path.exists():
            self.print_success("Cartella messages trovata")
            message_files = list(messages_path.glob("*.json"))
            for file in message_files:
                self.print_success(f"Lingua: {file.stem}")
        else:
            self.print_warning("Cartella messages non trovata")
        
        # Verifica middleware
        middleware_path = self.webapp_path / "middleware.ts"
        if middleware_path.exists():
            self.print_success("Middleware trovato")
            with open(middleware_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if "next-intl/middleware" in content:
                    self.print_success("Next-intl middleware configurato")
                else:
                    self.print_warning("Next-intl middleware non configurato")
        else:
            self.print_warning("Middleware non trovato")
    
    def verify_supabase_usage(self):
        """Verifica utilizzo Supabase nel codice"""
        self.print_header("UTILIZZO SUPABASE")
        
        # Cerca file che usano Supabase
        tsx_files = list(self.webapp_path.rglob("*.tsx"))
        ts_files = list(self.webapp_path.rglob("*.ts"))
        
        all_code_files = tsx_files + ts_files
        supabase_usage = []
        
        for file_path in all_code_files:
            if "node_modules" in str(file_path) or ".next" in str(file_path):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if any(keyword in content for keyword in ["@supabase", "supabase-js", "createClient"]):
                    # Conta le occorrenze
                    imports = len(re.findall(r'from.*@supabase|import.*@supabase', content))
                    client_usage = len(re.findall(r'createClient|supabase\.', content))
                    
                    supabase_usage.append({
                        'file': file_path.relative_to(self.webapp_path),
                        'imports': imports,
                        'client_usage': client_usage
                    })
                    
            except Exception as e:
                continue
        
        if supabase_usage:
            for usage in supabase_usage:
                self.print_success(f"{usage['file']}: {usage['imports']} import, {usage['client_usage']} usage")
        else:
            self.print_warning("Nessun utilizzo di Supabase trovato nel codice")
    
    def verify_navigation_components(self):
        """Verifica componenti di navigazione"""
        self.print_header("COMPONENTI NAVIGAZIONE")
        
        nav_path = self.webapp_path / "app" / "components" / "navigation"
        if not nav_path.exists():
            self.print_error("Cartella navigation non trovata")
            return
            
        nav_files = list(nav_path.glob("*.tsx"))
        for file in nav_files:
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Analisi base del componente
                uses_translations = "useTranslations" in content or "getTranslations" in content
                is_client_component = "'use client'" in content
                uses_next_link = "from 'next/link'" in content
                
                status = []
                if uses_translations:
                    status.append("i18n")
                if is_client_component:
                    status.append("client")
                else:
                    status.append("server")
                if uses_next_link:
                    status.append("link")
                
                self.print_success(f"{file.name}: {', '.join(status)}")
                
            except Exception as e:
                self.print_error(f"Errore lettura {file.name}: {e}")
    
    def verify_build_system(self):
        """Verifica sistema di build"""
        self.print_header("SISTEMA DI BUILD")
        
        # Verifica Next.js config
        next_configs = list(self.webapp_path.glob("next.config.*"))
        if next_configs:
            for config in next_configs:
                self.print_success(f"Config trovato: {config.name}")
        else:
            self.print_warning("Next.js config non trovato")
        
        # Verifica TypeScript config
        ts_config = self.webapp_path / "tsconfig.json"
        if ts_config.exists():
            self.print_success("tsconfig.json trovato")
        else:
            self.print_warning("tsconfig.json non trovato")
        
        # Test build (opzionale - può essere lento)
        response = input("\nVuoi testare la build? (s/n): ")
        if response.lower() in ['s', 'si', 'y', 'yes']:
            self.print_header("TEST BUILD")
            stdout, stderr, returncode = self.run_command("npm run build", cwd=self.webapp_path)
            if returncode == 0:
                self.print_success("Build completata con successo")
            else:
                self.print_error(f"Build fallita: {stderr}")
    
    def generate_report(self):
        """Genera report finale"""
        self.print_header("REPORT FINALE")
        
        print("\n📊 RIEPILOGO STATO PROGETTO:")
        print("✅ Struttura progetto verificata")
        print("✅ Package.json analizzato") 
        print("✅ Variabili d'ambiente controllate")
        print("✅ Configurazione i18n verificata")
        print("✅ Utilizzo Supabase analizzato")
        print("✅ Componenti navigazione controllati")
        print("✅ Sistema di build verificato")
        
        print(f"\n🎯 PROSSIMI PASSI CONSIGLIATI:")
        print("1. Verifica che tutte le variabili d'ambiente siano configurate")
        print("2. Testa la connessione Supabase in sviluppo")
        print("3. Verifica le traduzioni in tutte le lingue")
        print("4. Testa il build per produzione")
    
    def run_all_checks(self):
        """Esegue tutti i check"""
        print("🚀 AVVIO VERIFICHE PROGETTO NEXT.JS + SUPABASE")
        print("=" * 60)
        
        self.verify_project_structure()
        self.verify_package_json()
        self.verify_environment_files()
        self.verify_i18n_configuration()
        self.verify_supabase_usage()
        self.verify_navigation_components()
        self.verify_build_system()
        self.generate_report()

def main():
    """Funzione principale"""
    verifier = ProjectVerifier()
    verifier.run_all_checks()

if __name__ == "__main__":
    main()