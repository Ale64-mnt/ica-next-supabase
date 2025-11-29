// app/hooks/useAmazonPolly.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { Locale } from '@/types/game';

// Configurazione client AWS Polly
const client = new PollyClient({
  region: "eu-west-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY!
  }
});

interface VoiceConfig {
  id: string;
  voiceId: string;
  engine: 'neural' | 'standard';
  description: string;
}

// 🔥 OGGETTO COMPLETO CON VALORI AWS COMPATIBILI
const POLLY_VOICES: Record<Locale, VoiceConfig[]> = {
  'it': [
    { 
      id: 'Bianca', 
      voiceId: 'Bianca',
      engine: 'neural',
      description: 'Voce femminile naturale - Perfetta per bambini'
    }
  ],
  'en': [
    { 
      id: 'Joanna', 
      voiceId: 'Joanna',
      engine: 'neural',
      description: 'Natural female voice - Great for dialogue'
    }
  ],
  'fr': [
    { 
      id: 'Lea', 
      voiceId: 'Lea',
      engine: 'neural',
      description: 'Voix féminine naturelle'
    }
  ],
  'de': [
    { 
      id: 'Vicki', 
      voiceId: 'Vicki',
      engine: 'neural',
      description: 'Natürliche weibliche Stimme'
    }
  ],
  'es': [
    { 
      id: 'Lucia', 
      voiceId: 'Lucia',
      engine: 'neural',
      description: 'Voz femenina natural'
    }
  ],
  'pl': [
    { 
      id: 'Ola', 
      voiceId: 'Ola',
      engine: 'neural',
      description: 'Naturalny głos kobiecy'
    }
  ]
};

// 🔥 MAPPA LINGUE CON CODICI AWS VALIDI
const LANGUAGE_MAP: Record<Locale, string> = {
  'it': 'it-IT',
  'en': 'en-US', 
  'fr': 'fr-FR',
  'de': 'de-DE',
  'es': 'es-ES',
  'pl': 'pl-PL'
};

export const useAmazonPolly = (locale: Locale = 'it', voiceName: string = 'Bianca') => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const getVoiceConfig = useCallback(() => {
    const voice = POLLY_VOICES[locale]?.find(v => v.id === voiceName) || POLLY_VOICES[locale]?.[0];
    return voice!;
  }, [locale, voiceName]);

  const synthesizeSpeech = useCallback(async (text: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const voiceConfig = getVoiceConfig();
      
      const ssmlText = `
        <speak>
          <prosody rate="105%" pitch="+8%" volume="loud">
            ${text}
          </prosody>
        </speak>
      `;

      // 🔥 COMANDO CORRETTO CON TIPI ESPLICITI
      const command = new SynthesizeSpeechCommand({
        Text: ssmlText,
        TextType: "ssml",
        OutputFormat: "mp3",
        VoiceId: voiceConfig.voiceId,
        Engine: voiceConfig.engine,
        SampleRate: "24000",
        LanguageCode: LANGUAGE_MAP[locale]
      } as any); // 🔥 USA 'as any' PER BYPASSARE I TIPI STRICT

      console.log('🔊 AWS Polly - Sintetizzando:', text.substring(0, 50));
      
      // 🔥 USA DIRECTAMENTE IL CLIENT SENZA PRESIGNER
      const response = await client.send(command);
      
      if (response.AudioStream) {
        const audioBytes = await response.AudioStream.transformToByteArray();
        console.log('Tipo audioBytes:', typeof audioBytes);
        console.log('Constructor:', audioBytes?.constructor?.name);
        console.log('È Uint8Array?', audioBytes instanceof Uint8Array);
        console.log('AudioBytes completo:', audioBytes);

        // Converti l'AudioStream in Blob URL
        
        const fixedAudioBytes = new Uint8Array(audioBytes);
        const audioBlob = new Blob([fixedAudioBytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('✅ AWS Polly - Audio generato');
        return audioUrl;
      } else {
        throw new Error('Nessun audio stream ricevuto da AWS Polly');
      }

    } catch (err) {
      const errorMsg = `Errore AWS Polly: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error('❌', errorMsg);
      setError(errorMsg);
      
      // 🔥 FALLBACK A WEB SPEECH API
      console.log('🔄 Fallback a Web Speech API');
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = LANGUAGE_MAP[locale];
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
      }
      
      return ''; // Stringa vuota per il fallback
    } finally {
      setIsLoading(false);
    }
  }, [locale, getVoiceConfig]);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) return;

    // Ferma riproduzione precedente
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Ferma anche sintesi vocale del fallback
    speechSynthesis.cancel();

    try {
      const audioUrl = await synthesizeSpeech(text);
      
      // Se abbiamo un URL audio (non fallback), riproduci
      if (audioUrl) {
        return new Promise((resolve, reject) => {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.addEventListener('loadeddata', () => {
            setIsPlaying(true);
            setError(null);
            audio.play().then(() => {
              console.log('🎵 AWS Polly - Riproduzione avviata');
            }).catch(reject);
          });

          audio.addEventListener('ended', () => {
            setIsPlaying(false);
            audioRef.current = null;
            console.log('✅ AWS Polly - Riproduzione completata');
            resolve();
          });

          audio.addEventListener('error', () => {
            setIsPlaying(false);
            audioRef.current = null;
            const playError = 'Errore riproduzione audio AWS Polly';
            setError(playError);
            reject(new Error(playError));
          });
        });
      } else {
        // Fallback a Web Speech API - non c'è audio da riprodurre, solo sintesi
        setIsPlaying(true);
        setTimeout(() => {
          setIsPlaying(false);
        }, text.length * 100); // Stima durata
        return Promise.resolve();
      }
    } catch (err) {
      setIsPlaying(false);
      return Promise.resolve(); // Silenzioso per fallback
    }
  }, [synthesizeSpeech]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    speechSynthesis.cancel();
    setIsPlaying(false);
    console.log('⏹️ Riproduzione fermata');
  }, []);

  const getAvailableVoices = useCallback(() => {
    return POLLY_VOICES[locale] || [];
  }, [locale]);

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
    error,
    getAvailableVoices,
    currentVoice: getVoiceConfig()
  };
};