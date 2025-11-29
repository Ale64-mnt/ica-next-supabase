// app/test-polly/page.tsx
'use client';

import { useState } from 'react';
import { useAmazonPolly } from '@/hooks/useAmazonPolly';

// 🔥 AGGIUNGI L'INTERFACCIA PER I TIPI
interface VoiceConfig {
  id: string;
  voiceId: string;
  engine: 'neural' | 'standard';
  description: string;
}

export default function TestPollyPage() {
  const [text, setText] = useState('Ciao bambini! Benvenuti nel nostro magico gioco. Siete pronti per iniziare?');
  const [selectedVoice, setSelectedVoice] = useState('Bianca');
  const [locale, setLocale] = useState<'it' | 'en'>('it');
  
  const { speak, isPlaying, isLoading, getAvailableVoices, error, stop } = useAmazonPolly(locale, selectedVoice);
  
  const voices = getAvailableVoices();

  const testPhrases = [
    'Ciao! Come stai oggi?',
    'Ottimo lavoro! Hai fatto un bel progresso.',
    'Attenzione! Guarda bene quello che fai.',
    'Congratulazioni! Hai completato il livello.',
    'Mi piace molto giocare con te!',
    'Sei proprio bravo! Continua così!'
  ];

  const englishPhrases = [
    'Hello children! Welcome to our magical game.',
    'Great job! You are making excellent progress.',
    'Be careful! Look closely at what you are doing.',
    'Congratulations! You completed the level.',
    'I really enjoy playing with you!',
    'You are very talented! Keep it up!'
  ];

  const currentPhrases = locale === 'it' ? testPhrases : englishPhrases;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🔊 Test Amazon Polly</h1>
        <p className="text-gray-600 mb-8">Verifica che le voci professionali funzionino correttamente</p>

        {/* Alert Errori */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>❌ Errore AWS Polly:</strong> {error}
          </div>
        )}

        {/* Selettore Lingua */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🌍 Seleziona Lingua</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setLocale('it')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                locale === 'it' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🇮🇹 Italiano
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                locale === 'en' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* Voci Disponibili */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎙️ Voci Disponibili - {locale === 'it' ? 'Italiano' : 'English'}</h2>
          <div className="grid gap-3">
            {/* 🔥 CORREGGI QUESTA RIGA - AGGIUNGI IL TIPO */}
            {voices.map((voice: VoiceConfig) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  selectedVoice === voice.id 
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <div className="text-left">
                  <strong className="block">{voice.id}</strong>
                  <span className="text-sm opacity-80">{voice.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedVoice === voice.id 
                      ? 'bg-blue-300 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {voice.engine}
                  </span>
                  {selectedVoice === voice.id && (
                    <span className="text-lg">✅</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Test Sintesi Personalizzata */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Test Sintesi Vocale Personalizzata</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testo da sintetizzare:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              rows={3}
              placeholder="Scrivi qui il testo che vuoi far pronunciare alla voce..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => speak(text)}
              disabled={isLoading || isPlaying}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sintetizzando...
                </>
              ) : isPlaying ? (
                <>
                  🔊 In riproduzione...
                </>
              ) : (
                <>
                  🎵 Prova la Voce
                </>
              )}
            </button>

            {isPlaying && (
              <button
                onClick={stop}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                ⏹️ Stop
              </button>
            )}
          </div>
        </div>

        {/* Frasi di Test Rapide */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">⚡ Test Rapido - Frasi Predefinite</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentPhrases.map((phrase, index) => (
              <button
                key={index}
                onClick={() => speak(phrase)}
                disabled={isLoading || isPlaying}
                className="p-4 bg-gradient-to-r from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200 text-gray-800 rounded-lg text-left disabled:bg-gray-100 disabled:text-gray-400 transition-all hover:shadow-md border border-green-200"
              >
                <div className="font-medium">{phrase}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Clicca per ascoltare →
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stato e Debug */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 bg-gray-100 px-6 py-3 rounded-full">
            <div className={`w-4 h-4 rounded-full animate-pulse ${
              isLoading ? 'bg-yellow-500' : 
              isPlaying ? 'bg-green-500' : 
              'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isLoading ? '🔄 Sintetizzando con AWS Polly...' : 
               isPlaying ? '🔊 In riproduzione' : 
               '✅ Pronto - Scrivi una frase e clicca "Prova la Voce"'}
            </span>
          </div>
          
          {/* Info Debug */}
          <div className="mt-4 text-xs text-gray-500">
            <p>Voce attuale: <strong>{selectedVoice}</strong> | Lingua: <strong>{locale}</strong> | Engine: <strong>Neural</strong></p>
            <p className="mt-1">Controlla la console del browser per i log dettagliati</p>
          </div>
        </div>
      </div>
    </div>
  );
}