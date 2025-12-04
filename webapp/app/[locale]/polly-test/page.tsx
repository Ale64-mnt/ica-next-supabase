// app/[locale]/polly-test/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAmazonPolly } from '@/hooks/useAmazonPolly';

interface VoiceConfig {
  id: string;
  voiceId: string;
  engine: 'neural' | 'standard';
  description: string;
  language: string;
}

export default function TestPollyPage() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Bianca');
  const [locale, setLocale] = useState<'it' | 'en' | 'fr' | 'es' | 'de'>('it');
  
  const { speak, isPlaying, isLoading, error, stop } = useAmazonPolly(locale, selectedVoice);
  
  // Configurazione voci neurali femminili
  const NEURAL_FEMALE_VOICES = {
    it: [
      { 
        id: 'Bianca', 
        voiceId: 'Bianca', 
        engine: 'neural' as const, 
        description: 'Voce italiana neurale - Femminile naturale',
        language: 'Italiano'
      }
    ],
    en: [
      { 
        id: 'Joanna', 
        voiceId: 'Joanna', 
        engine: 'neural' as const, 
        description: 'Voce inglese neurale - Femminile espressiva',
        language: 'English'
      },
      { 
        id: 'Ruth', 
        voiceId: 'Ruth', 
        engine: 'neural' as const, 
        description: 'Voce inglese neurale - Femminile calda',
        language: 'English'
      }
    ],
    fr: [
      { 
        id: 'Lea', 
        voiceId: 'Lea', 
        engine: 'neural' as const, 
        description: 'Voce francese neurale - Femminile elegante',
        language: 'Français'
      }
    ],
    es: [
      { 
        id: 'Lucia', 
        voiceId: 'Lucia', 
        engine: 'neural' as const, 
        description: 'Voce spagnola neurale - Femminile passionale',
        language: 'Español'
    }
    ],
    de: [
      { 
        id: 'Vicki', 
        voiceId: 'Vicki', 
        engine: 'neural' as const, 
        description: 'Voce tedesca neurale - Femminile precisa',
        language: 'Deutsch'
      }
    ]
  };

  const voices = NEURAL_FEMALE_VOICES[locale] || [];

  // Frasi di test con esclamazioni e domande per ogni lingua
  const TEST_PHRASES = {
    it: [
      "🎉 Evviva! Hai fatto un lavoro fantastico! Sei proprio bravo!",
      "❓ Ma cosa succede qui? Riesci a indovinare la risposta?",
      "✨ Incredibile! Questa è la scelta perfetta! Continua così!",
      "🤔 Secondo te, questa è la soluzione giusta? Che ne pensi?",
      "🌟 Meraviglioso! Hai superato ogni aspettativa! Fantastico!",
      "💡 Attenzione! Guarda bene prima di rispondere! Sei sicuro?"
    ],
    en: [
      "🎉 Wow! You did an amazing job! You're so talented!",
      "❓ What's happening here? Can you guess the answer?",
      "✨ Incredible! This is the perfect choice! Keep it up!",
      "🤔 Do you think this is the right solution? What's your opinion?",
      "🌟 Outstanding! You exceeded all expectations! Fantastic!",
      "💡 Attention! Look carefully before answering! Are you sure?"
    ],
    fr: [
      "🎉 Bravo ! Tu as fait un travail remarquable ! Tu es très doué !",
      "❓ Qu'est-ce qui se passe ici ? Peux-tu deviner la réponse ?",
      "✨ Incroyable ! C'est le choix parfait ! Continue comme ça !",
      "🤔 Penses-tu que c'est la bonne solution ? Qu'en penses-tu ?",
      "🌟 Exceptionnel ! Tu as dépassé toutes les attentes ! Fantastique !",
      "💡 Attention ! Regarde bien avant de répondre ! Es-tu sûr ?"
    ],
    es: [
      "🎉 ¡Bravo! ¡Has hecho un trabajo increíble! ¡Eres muy talentoso!",
      "❓ ¿Qué está pasando aquí? ¿Puedes adivinar la respuesta?",
      "✨ ¡Increíble! ¡Esta es la elección perfecta! ¡Sigue así!",
      "🤔 ¿Crees que esta es la solución correcta? ¿Qué opinas?",
      "🌟 ¡Excepcional! ¡Superaste todas las expectativas! ¡Fantástico!",
      "💡 ¡Atención! ¡Mira bien antes de responder! ¿Estás seguro?"
    ],
    de: [
      "🎉 Großartig! Du hast hervorragende Arbeit geleistet! Du bist so talentiert!",
      "❓ Was passiert hier? Kannst du die Antwort erraten?",
      "✨ Unglaublich! Das ist die perfekte Wahl! Mach weiter so!",
      "🤔 Glaubst du, das ist die richtige Lösung? Was ist deine Meinung?",
      "🌟 Hervorragend! Du hast alle Erwartungen übertroffen! Fantastisch!",
      "💡 Achtung! Schau genau hin, bevor du antwortest! Bist du sicher?"
    ]
  };

  const currentPhrases = TEST_PHRASES[locale];

  // Imposta testo iniziale quando cambia lingua
  useEffect(() => {
    if (currentPhrases && currentPhrases.length > 0) {
      setText(currentPhrases[0]);
    }
    // Imposta la prima voce disponibile per la lingua
    if (voices.length > 0) {
      setSelectedVoice(voices[0].id);
    }
  }, [locale, voices, currentPhrases]);

  const handleVoiceSelect = (voice: VoiceConfig) => {
    setSelectedVoice(voice.id);
  };

  const handleSpeak = async (customText?: string) => {
    const textToSpeak = customText || text;
    if (textToSpeak.trim()) {
      await speak(textToSpeak);
    }
  };

  const languageNames = {
    it: 'Italiano 🇮🇹',
    en: 'English 🇺🇸', 
    fr: 'Français 🇫🇷',
    es: 'Español 🇪🇸',
    de: 'Deutsch 🇩🇪'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">🎵 Test Voci Neurali Amazon Polly</h1>
          <p className="text-xl text-gray-600 mb-2">Verifica le voci neurali femminili con espressioni esclamative e interrogative</p>
          <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
            <span className="text-lg">🧠</span>
            <span className="font-semibold text-yellow-800">Motore Neural - Voci Femminili</span>
          </div>
        </div>

        {/* Alert Errori */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <strong className="block">Errore AWS Polly:</strong>
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonna Sinistra - Controlli */}
          <div className="space-y-6">
            {/* Selettore Lingua */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                🌍 Seleziona Lingua
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.entries(languageNames) as [keyof typeof languageNames, string][]).map(([langCode, langName]) => (
                  <button
                    key={langCode}
                    onClick={() => setLocale(langCode)}
                    className={`p-4 rounded-xl font-semibold transition-all duration-300 ${
                      locale === langCode 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105'
                    }`}
                  >
                    {langName}
                  </button>
                ))}
              </div>
            </div>

            {/* Voci Disponibili */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                🎙️ Voci Neurali Femminili - {languageNames[locale]}
              </h2>
              <div className="space-y-3">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => handleVoiceSelect(voice)}
                    className={`w-full flex items-center justify-between p-5 rounded-xl transition-all duration-300 ${
                      selectedVoice === voice.id 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl transform scale-105' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 hover:scale-105'
                    }`}
                  >
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <strong className="text-lg">{voice.id}</strong>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {voice.engine}
                        </span>
                      </div>
                      <p className="text-sm opacity-90">{voice.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedVoice === voice.id && (
                        <div className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                          <span className="text-sm">✅ Selezionata</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colonna Destra - Test e Frasi */}
          <div className="space-y-6">
            {/* Test Sintesi Personalizzata */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                🎯 Test Sintesi Vocale
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Testo da sintetizzare:
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg resize-none"
                  rows={4}
                  placeholder="Scrivi qui il testo che vuoi far pronunciare alla voce neurale..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleSpeak()}
                  disabled={isLoading || isPlaying || !text.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sintetizzando...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span>🎵 In riproduzione...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🎶</span>
                      <span>Prova la Voce Neurale</span>
                    </>
                  )}
                </button>

                {isPlaying && (
                  <button
                    onClick={stop}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg"
                  >
                    ⏹️ Stop
                  </button>
                )}
              </div>
            </div>

            {/* Frasi di Test Rapide */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                ⚡ Frasi di Test - {languageNames[locale]}
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {currentPhrases.map((phrase, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setText(phrase);
                      handleSpeak(phrase);
                    }}
                    disabled={isLoading || isPlaying}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-800 rounded-xl text-left disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-300 hover:shadow-lg border border-blue-200 hover:border-purple-300 group"
                  >
                    <div className="font-medium text-lg mb-2 group-hover:scale-105 transition-transform">
                      {phrase}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Clicca per ascoltare →
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        {locale.toUpperCase()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stato e Debug */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 bg-white px-8 py-4 rounded-2xl shadow-lg">
            <div className={`w-5 h-5 rounded-full animate-pulse ${
              isLoading ? 'bg-yellow-500' : 
              isPlaying ? 'bg-green-500' : 
              'bg-gray-400'
            }`}></div>
            <span className="text-lg font-semibold text-gray-700">
              {isLoading ? '🔄 Sintetizzando con AWS Polly Neural...' : 
               isPlaying ? '🔊 Voce Neurale in riproduzione' : 
               '✅ Pronto - Testa le voci neurali femminili!'}
            </span>
          </div>
          
          {/* Info Debug */}
          <div className="mt-6 text-sm text-gray-600 bg-white bg-opacity-50 p-4 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>🎵 Voce attuale:</strong> 
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">{selectedVoice}</span>
              </div>
              <div>
                <strong>🌍 Lingua:</strong> 
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded">{languageNames[locale]}</span>
              </div>
              <div>
                <strong>🧠 Engine:</strong> 
                <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded">Neural</span>
              </div>
            </div>
            <p className="mt-3 text-xs">
              Le voci neurali offrono una qualità vocale più naturale e espressiva. 
              Controlla la console del browser per i log dettagliati.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}