import pyttsx3

class FluentSpeechTTS:
    def __init__(self):
        self.engine = pyttsx3.init()
        self.configure_default()
    
    def configure_default(self):
        """Configurazione per parlato naturale"""
        self.engine.setProperty('rate', 160)  # Velocità naturale
        self.engine.setProperty('volume', 0.9)
    
    def speak_as_single_speech(self, phrases: dict[str, str]):
        """
        Combina tutte le frasi in un unico discorso fluido
        """
        print("🎯 CREAZIONE DISCORSO UNICO...\n")
        
        # Combina tutte le frasi in un testo unico
        full_speech = self.create_fluent_speech(phrases)
        
        print("📝 TESTO COMPLETO:")
        print("=" * 50)
        print(full_speech)
        print("=" * 50)
        print("\n🔊 INIZIO LETTURA...\n")
        
        # Leggi tutto come un unico discorso
        self.engine.say(full_speech)
        self.engine.runAndWait()
        
        print("\n✅ DISCORSO COMPLETATO!")
    
    def create_fluent_speech(self, phrases: dict[str, str]) -> str:
        """
        Combina le frasi in modo fluido e naturale
        """
        speech_parts = []
        
        for key, text in phrases.items():
            print(f"➕ Aggiungo: {text}")
            
            # Pulisci la frase e aggiungi transizioni naturali
            clean_text = text.strip()
            
            # Aggiungi connettivi per fluidità
            if key == "intro":
                speech_parts.append(clean_text)
            elif "?" in clean_text:
                # Per domande, usa una pausa breve prima
                speech_parts.append("... " + clean_text)
            elif "!" in clean_text:
                # Per esclamazioni, mantieni l'entusiasmo
                speech_parts.append(clean_text)
            else:
                # Per frasi affermative, usa "e" o virgola
                speech_parts.append(", " + clean_text.lower())
        
        # Unisci tutto in un unico testo
        full_speech = " ".join(speech_parts)
        
        # Sostituisce doppie punteggiazioni
        full_speech = full_speech.replace(",.", ".").replace(",.", ".")
        
        return full_speech

# USO PRINCIPALE
if __name__ == "__main__":
    tts = FluentSpeechTTS()
    
    ITALIAN_PHRASES = {
        "intro": "Ciao bambini! Benvenuti nel nostro magico videogioco.",
        "domanda": "Siete pronti per iniziare il primo livello?",
        "istruzioni": "Guardate attentamente tutto intorno a voi.",
        "indizio": "C'è un tesoro nascosto da qualche parte.",
        "incoraggiamento": "Ricordate che potete sempre riprovare.",
        "vittoria": "Congratulazioni! Avete completato l'avventura!"
    }
    
    tts.speak_as_single_speech(ITALIAN_PHRASES)