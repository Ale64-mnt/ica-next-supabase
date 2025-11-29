// app/hooks/useMultilingualTTS.ts
'use client';

import { useState, useRef, useCallback } from 'react';
import { Locale } from '@/types/game';

// 🔥 Mapping SOLO per italiano
const AUDIO_MAPPING: Record<string, string> = {
  'intro': 'https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/audio/voice/need-vs-wants/it/intro.mp3',
  'need_correct': 'https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/audio/voice/need-vs-wants/it/need_correct.mp3',
  'desire_correct': 'https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/audio/voice/need-vs-wants/it/desire_correct.mp3',
  'need_wrong': 'https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/audio/voice/need-vs-wants/it/need_wrong.mp3',
  'desire_wrong': 'https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/audio/voice/need-vs-wants/it/desire_wrong.mp3',
  'level_complete': 'https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/audio/voice/need-vs-wants/it/level_complete.mp3'
};

export function useMultilingualTTS(locale: Locale = 'it') {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakText = useCallback((textKey: string): void => { // 🔥 RIMOSSO async e Promise
    // 🔥 Supporta solo italiano
    if (locale !== 'it') {
      console.log(`🔇 Audio disponibile solo per italiano (richiesto: ${locale})`);
      return;
    }

    const audioUrl = AUDIO_MAPPING[textKey];
    
    if (!audioUrl) {
      console.warn(`🔇 Audio non trovato per chiave: ${textKey}`);
      return;
    }

    // 🔥 Se già sta parlando, ferma prima
    if (isSpeaking && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      setIsSpeaking(true);
      console.log(`🔊 Riproduco audio: ${textKey}`, audioUrl);

      // Crea nuovo elemento audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // 🔥 Gestione eventi semplificata
      const cleanup = () => {
        setIsSpeaking(false);
        audioRef.current = null;
        audio.removeEventListener('ended', cleanup);
        audio.removeEventListener('error', cleanup);
        audio.removeEventListener('canplaythrough', playAudio);
      };

      const playAudio = () => {
        audio.play().catch(error => {
          console.error('❌ Errore riproduzione audio:', error);
          cleanup();
        });
      };

      // Aspetta che l'audio sia caricato prima di riprodurre
      if (audio.readyState >= 3) { // HAVE_FUTURE_DATA o HAVE_ENOUGH_DATA
        playAudio();
      } else {
        audio.addEventListener('canplaythrough', playAudio, { once: true });
        // Timeout di sicurezza
        setTimeout(() => {
          if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
            playAudio();
          }
        }, 500);
      }

      audio.addEventListener('ended', cleanup, { once: true });
      audio.addEventListener('error', cleanup, { once: true });

    } catch (error) {
      console.error('❌ Errore creazione audio:', error);
      setIsSpeaking(false);
    }
  }, [locale, isSpeaking]); // 🔥 Aggiunto isSpeaking alle dipendenze

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return {
    speakText,    // ✅ Non più async
    stopSpeaking, // ✅ Compatibile
    isSpeaking    // ✅ Compatibile
  };
}