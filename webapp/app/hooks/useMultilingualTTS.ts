// app/hooks/useMultilingualTTS.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Locale } from '@/types/game';

interface VoiceConfig {
  lang: string;
  rate: number;
  pitch: number;
}

const VOICE_CONFIG: Record<Locale, VoiceConfig> = {
  'it': { lang: 'it-IT', rate: 0.9, pitch: 1.2 },
  'en': { lang: 'en-GB', rate: 0.9, pitch: 1.2 },
  'fr': { lang: 'fr-FR', rate: 0.85, pitch: 1.1 },
  'de': { lang: 'de-DE', rate: 0.85, pitch: 1.1 },
  'es': { lang: 'es-ES', rate: 0.9, pitch: 1.2 },
  'pl': { lang: 'pl-PL', rate: 0.8, pitch: 1.0 }
};

export const useMultilingualTTS = (locale: Locale) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
    
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
      speechSynthesis.cancel();
    };
  }, []);

  const findBestVoice = useCallback((targetLang: string): SpeechSynthesisVoice | null => {
    const nativeVoice = voices.find(voice => 
      voice.lang === targetLang && voice.localService
    );
    if (nativeVoice) return nativeVoice;

    const anyVoice = voices.find(voice => 
      voice.lang.startsWith(targetLang.split('-')[0])
    );
    
    return anyVoice || null;
  }, [voices]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn('TTS non supportato dal browser');
      return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const config = VOICE_CONFIG[locale];
    
    utterance.lang = config.lang;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;

    const bestVoice = findBestVoice(config.lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [isSupported, locale, findBestVoice]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    speechSynthesis.pause();
    setIsSpeaking(false);
  }, []);

  const resume = useCallback(() => {
    speechSynthesis.resume();
    setIsSpeaking(true);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported
  };
};