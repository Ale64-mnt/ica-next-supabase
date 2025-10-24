# Tools/supabase_diagnostic.py
import os
import sys
import requests
import json
from datetime import datetime
from pathlib import Path

class SupabaseDiagnostic:
    def __init__(self):
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'checks': {},
            'status': 'UNKNOWN'
        }
        self.project_root = Path(__file__).parent.parent  # Root del progetto
        
    def load_env_variables(self):
        """Carica le variabili d'ambiente dal file .env nella root"""
        print("🔍 Caricamento variabili d'ambiente dalla root...")
        
        env_files = [
            self.project_root / '.env.local',
            self.project_root / '.env',
            self.project_root / 'webapp' / '.env.local',  # Fallback
            self.project_root / 'webapp' / '.env',        # Fallback
        ]
        
        env_loaded = False
        for env_file in env_files:
            if env_file.exists():
                try:
                    with open(env_file, 'r') as f:
                        for line in f:
                            line = line.strip()
                            if line and not line.startswith('#') and '=' in line:
                                key, value = line.split('=', 1)
                                os.environ[key] = value
                    print(f"✅ File .env caricato: {env_file}")
                    env_loaded = True
                    break
                except Exception as e:
                    print(f"❌ Errore nel caricare {env_file}: {e}")
        
        if not env_loaded:
            print("⚠️  Nessun file .env trovato nella root")
            print("📁 Directory cercate:")
            for env_file in env_files:
                print(f"   - {env_file} {'✅' if env_file.exists() else '❌'}")
        
        return env_loaded
    
    def check_env_vars(self):
        """Verifica le variabili d'ambiente necessarie"""
        print("\n📋 Verifica variabili d'ambiente...")
        
        required_vars = {
            'NEXT_PUBLIC_SUPABASE_URL': 'URL progetto Supabase',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Chiave anonima Supabase'
        }
        
        missing_vars = []
        present_vars = []
        
        for var, description in required_vars.items():
            value = os.getenv(var)
            if value:
                # Maschera parte della chiave per sicurezza
                if 'KEY' in var:
                    masked_value = value[:10] + '...' + value[-10:] if len(value) > 25 else '***'
                else:
                    masked_value = value
                print(f"✅ {var}: {masked_value}")
                present_vars.append(var)
            else:
                print(f"❌ {var}: MANCANTE")
                missing_vars.append(var)
        
        self.results['checks']['environment_variables'] = {
            'missing': missing_vars,
            'present': present_vars,
            'status': 'PASS' if not missing_vars else 'FAIL'
        }
        
        return len(missing_vars) == 0
    
    def test_supabase_connection(self):
        """Testa la connessione all'API Supabase"""
        print("\n🌐 Test connessione Supabase...")
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not supabase_url or not supabase_key:
            print("❌ Variabili mancanti per il test di connessione")
            self.results['checks']['api_connection'] = {
                'status': 'FAIL',
                'message': 'Variabili ambiente mancanti'
            }
            return False
        
        try:
            # Test Health Check
            health_url = f"{supabase_url}/rest/v1/"
            headers = {
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
            
            print(f"   Testing URL: {supabase_url}")
            response = requests.get(health_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                print("✅ Connessione API Supabase: SUCCESSO")
                self.results['checks']['api_connection'] = {
                    'status': 'PASS',
                    'response_code': response.status_code,
                    'message': 'Connessione API riuscita'
                }
                return True
            else:
                print(f"❌ Connessione API fallita: HTTP {response.status_code}")
                print(f"   Messaggio: {response.text[:100]}...")
                self.results['checks']['api_connection'] = {
                    'status': 'FAIL',
                    'response_code': response.status_code,
                    'message': response.text[:200] if response.text else 'No response body'
                }
                return False
                
        except requests.exceptions.ConnectionError:
            print("❌ Errore di connessione: Impossibile raggiungere Supabase")
            self.results['checks']['api_connection'] = {
                'status': 'FAIL',
                'message': 'ConnectionError: Impossibile raggiungere il server'
            }
            return False
        except requests.exceptions.Timeout:
            print("❌ Timeout della connessione")
            self.results['checks']['api_connection'] = {
                'status': 'FAIL',
                'message': 'Timeout: Il server non ha risposto in tempo'
            }
            return False
        except Exception as e:
            print(f"❌ Errore imprevisto: {e}")
            self.results['checks']['api_connection'] = {
                'status': 'FAIL',
                'message': f'Exception: {str(e)}'
            }
            return False
    
    def test_database_operations(self):
        """Test operazioni sul database"""
        print("\n🗄️  Test operazioni database...")
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not supabase_url or not supabase_key:
            self.results['checks']['database_read'] = {
                'status': 'FAIL',
                'message': 'Variabili ambiente mancanti'
            }
            return False
        
        try:
            # Prova a leggere da una tabella comune
            test_url = f"{supabase_url}/rest/v1/profiles?limit=1"
            headers = {
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(test_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Lettura database: SUCCESSO")
                print(f"   Record trovati: {len(data)}")
                self.results['checks']['database_read'] = {
                    'status': 'PASS',
                    'response_code': response.status_code,
                    'records_returned': len(data)
                }
                return True
            elif response.status_code == 404:
                print("⚠️  Tabella 'profiles' non trovata - provo tabelle alternative...")
                # Prova con un'altra tabella comune
                return self.test_alternative_table()
            else:
                print(f"❌ Lettura database fallita: HTTP {response.status_code}")
                print(f"   Messaggio: {response.text[:100]}...")
                self.results['checks']['database_read'] = {
                    'status': 'FAIL',
                    'response_code': response.status_code,
                    'message': response.text[:200] if response.text else 'No response body'
                }
                return False
                
        except Exception as e:
            print(f"❌ Errore operazioni database: {e}")
            self.results['checks']['database_read'] = {
                'status': 'FAIL',
                'message': str(e)
            }
            return False
    
    def test_alternative_table(self):
        """Test con tabelle alternative"""
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        alternative_tables = ['users', 'customers', 'clients', 'test_table']
        
        for table in alternative_tables:
            try:
                test_url = f"{supabase_url}/rest/v1/{table}?limit=1"
                headers = {
                    'apikey': supabase_key,
                    'Authorization': f'Bearer {supabase_key}',
                    'Content-Type': 'application/json'
                }
                
                print(f"   Provando tabella: {table}")
                response = requests.get(test_url, headers=headers, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Lettura tabella '{table}': SUCCESSO")
                    print(f"   Record trovati: {len(data)}")
                    self.results['checks']['database_read'] = {
                        'status': 'PASS',
                        'response_code': response.status_code,
                        'table_used': table,
                        'records_returned': len(data)
                    }
                    return True
                    
            except Exception as e:
                print(f"   ❌ Tabella {table} fallita: {e}")
                continue
        
        print("❌ Nessuna tabella accessibile trovata")
        self.results['checks']['database_read'] = {
            'status': 'FAIL',
            'message': 'Nessuna tabella accessibile'
        }
        return False
    
    def generate_report(self):
        """Genera report finale"""
        print("\n" + "="*50)
        print("📊 REPORT DIAGNOSTICA SUPABASE")
        print("="*50)
        
        passed_checks = sum(1 for check in self.results['checks'].values() if check.get('status') == 'PASS')
        total_checks = len(self.results['checks'])
        
        print(f"Check eseguiti: {passed_checks}/{total_checks}")
        
        # Mostra dettagli check
        for check_name, check_result in self.results['checks'].items():
            status_icon = '✅' if check_result.get('status') == 'PASS' else '❌'
            print(f"{status_icon} {check_name}: {check_result.get('status', 'UNKNOWN')}")
        
        if passed_checks == total_checks:
            print("\n🎉 TUTTI I CHECK SUPERATI! Supabase è configurato correttamente.")
            self.results['status'] = 'HEALTHY'
        elif passed_checks > 0:
            print("\n⚠️  PROBLEMI RISCONTRATI. Controlla la configurazione.")
            self.results['status'] = 'ISSUES'
        else:
            print("\n❌ CONNESSIONE FALLITA. Verifica credenziali e configurazione.")
            self.results['status'] = 'FAILED'
        
        # Salva report JSON
        report_file = self.project_root / f"supabase_diagnostic_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n📄 Report salvato in: {report_file}")
        return self.results['status']
    
    def run_diagnostic(self):
        """Esegue tutti i test diagnostici"""
        print("🚀 Avvio diagnostica Supabase...")
        print(f"📁 Root progetto: {self.project_root}")
        
        self.load_env_variables()
        
        checks = [
            self.check_env_vars,
            self.test_supabase_connection,
            self.test_database_operations
        ]
        
        for check in checks:
            try:
                check()
            except Exception as e:
                print(f"❌ Errore durante il check {check.__name__}: {e}")
        
        return self.generate_report()

if __name__ == "__main__":
    diagnostic = SupabaseDiagnostic()
    result = diagnostic.run_diagnostic()
    sys.exit(0 if result == 'HEALTHY' else 1)