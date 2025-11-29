// app/hooks/useGameAudio.ts
import { useState, useRef, useCallback } from 'react';
import { Locale } from '@/types/game';

export function useGameAudio(locale: Locale) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudioUrl = useCallback((audioId: string): string => {
    return `https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/audio/voice/need-vs-wants/${locale}/${audioId}.mp3`;
  }, [locale]);

  const playAudio = useCallback(async (audioId: string): Promise<void> => {
    setIsLoading(true);
    setIsPlaying(false);

    const audioUrl = getAudioUrl(audioId);
    console.log(' Caricando audio:', audioUrl);

    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('loadeddata', () => {
        setIsLoading(false);
        setIsPlaying(true);
        audio.play().then(() => {
          audio.addEventListener('ended', () => {
            setIsPlaying(false);
            audioRef.current = null;
            resolve();
          });
        }).catch((error) => {
          console.error(' Errore riproduzione audio:', error);
          setIsLoading(false);
          setIsPlaying(false);
          audioRef.current = null;
          resolve();
        });
      });

      audio.addEventListener('error', () => {
        setIsLoading(false);
        setIsPlaying(false);
        audioRef.current = null;
        console.error(' Audio non trovato:', audioUrl);
        resolve();
      });

      // Timeout di sicurezza
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setIsPlaying(false);
          audioRef.current = null;
          console.warn(' Timeout caricamento audio');
          resolve();
        }
      }, 5000);
    });
  }, [getAudioUrl, isLoading]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  return {
    playAudio,
    stopAudio,
    isLoading,
    isPlaying
  };
}
