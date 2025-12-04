// app/hooks/useGameAudio.ts
'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { Locale } from '@/types/game';

const MUSIC_URL = 'https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/audio/voice/need-vs-wants/the_field_of_dreams_loop.mp3';

interface UseGameAudioOptions {
  onAudioEnded?: () => void;
  onAudioStopped?: () => void;
}

export const useGameAudio = (locale: Locale, options?: UseGameAudioOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [normalVolume, setNormalVolume] = useState<number>(0.3);
  
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

  // Inizializzazione musica
  useEffect(() => {
    musicRef.current = new Audio(MUSIC_URL);
    musicRef.current.loop = true;
    musicRef.current.volume = normalVolume;
    
    const tryPlayMusic = () => {
      musicRef.current?.play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {
          // Fallback: avvia al primo click
          document.addEventListener('click', () => {
            if (musicRef.current?.paused) {
              musicRef.current.play().then(() => setIsMusicPlaying(true));
            }
          }, { once: true });
        });
    };
    
    setTimeout(tryPlayMusic, 500);
    
    return () => {
      musicRef.current?.pause();
    };
  }, [normalVolume]);

  // ✅ FUNZIONE PLAY AUDIO con gestione callback
  const playAudio = useCallback((audioKey: string): Promise<void> => {
    return new Promise((resolve) => {
      // Ferma audio precedente se presente
      if (voiceRef.current) {
        voiceRef.current.pause();
        voiceRef.current = null;
      }
      
      setIsPlaying(true);
      
      const voiceUrl = `https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/audio/voice/need-vs-wants/${locale}/${audioKey}.mp3`;
      
      try {
        const audio = new Audio(voiceUrl);
        voiceRef.current = audio;
        
        // Ducking musica
        if (musicRef.current) {
          musicRef.current.volume = 0.1;
        }
        
        // ✅ AUDIO TERMINATO NATURALMENTE
        const handleEnded = () => {
          console.log(`✅ Audio ${audioKey} terminato naturalmente`);
          setIsPlaying(false);
          
          // Ripristina volume musica
          if (musicRef.current) {
            musicRef.current.volume = normalVolume;
          }
          
          // Trigger callback fine naturale
          options?.onAudioEnded?.();
          
          resolve();
        };
        
        // ✅ AUDIO FERMATO MANUALMENTE (STOP)
        const handleStopped = () => {
          console.log(`⏹️ Audio ${audioKey} fermato manualmente`);
          setIsPlaying(false);
          
          // Ripristina volume musica
          if (musicRef.current) {
            musicRef.current.volume = normalVolume;
          }
          
          // Trigger callback stop manuale
          options?.onAudioStopped?.();
        };
        
        // Gestione errore
        const handleError = () => {
          console.warn(`⚠️ Audio ${audioKey} non disponibile`);
          setIsPlaying(false);
          
          // Ripristina volume musica
          if (musicRef.current) {
            musicRef.current.volume = normalVolume;
          }
          
          // In caso di errore, attiva comunque callback
          options?.onAudioEnded?.();
          
          resolve();
        };
        
        // Configura eventi
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        
        // Salva reference per stop manuale
        voiceRef.current = audio;
        
        // Funzione per fermare manualmente
        const stopCurrentAudio = () => {
          if (voiceRef.current === audio) {
            audio.pause();
            audio.currentTime = 0;
            handleStopped();
          }
        };
        
        // Salva funzione stop nel ref
        (voiceRef as any).stop = stopCurrentAudio;
        
        // Avvia riproduzione
        audio.play().catch(() => {
          handleError();
        });
        
      } catch (error) {
        console.warn('Errore creazione audio:', error);
        setIsPlaying(false);
        resolve();
      }
    });
  }, [locale, normalVolume, options]);

  // ✅ FUNZIONE STOP AUDIO - ferma e attiva callback
  const stopAudio = useCallback(() => {
    console.log('⏹️ STOP chiamato dal componente');
    
    // Se c'è audio in riproduzione, fermalo
    if (voiceRef.current && (voiceRef as any).stop) {
      (voiceRef as any).stop();
      voiceRef.current = null;
    } else {
      // Se non c'è audio ma vogliamo comunque attivare effetti
      setIsPlaying(false);
      options?.onAudioStopped?.();
    }
    
    // Ripristina volume musica
    if (musicRef.current) {
      musicRef.current.volume = normalVolume;
    }
  }, [normalVolume, options]);

  // Altre funzioni
  const toggleMusic = useCallback(() => {
    if (!musicRef.current) return;
    
    if (musicRef.current.paused) {
      musicRef.current.play();
      setIsMusicPlaying(true);
    } else {
      musicRef.current.pause();
      setIsMusicPlaying(false);
    }
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    const newVolume = Math.max(0, Math.min(1, volume));
    setNormalVolume(newVolume);
    
    if (musicRef.current) {
      musicRef.current.volume = newVolume;
    }
  }, []);

  return {
    isPlaying,
    isMusicPlaying,
    playAudio,
    stopAudio,
    toggleMusic,
    setMusicVolume,
    currentMusicVolume: normalVolume
  };
};