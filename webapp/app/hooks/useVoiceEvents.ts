// app/hooks/useVoiceEvents.ts
'use client';

import { useCallback } from 'react';
import { useMultilingualTTS } from './useMultilingualTTS';
import { NEEDS_WANTS_VOICE_SCRIPT } from '@/data/education/voice-script';
import { Locale } from '@/types/game';

export const useVoiceEvents = (locale: Locale) => {
  const { speak, isSupported } = useMultilingualTTS(locale);

  const triggerVoiceEvent = useCallback((eventId: string) => {
    // 🔥 DEBUG AGGIUNTO
    console.log('🔊 === VOICE EVENT DEBUG ===');
    console.log('Event ID richiesto:', eventId);
    console.log('TTS supportato:', isSupported);
    
    if (!isSupported) {
      console.log('❌ TTS non supportato - uscita');
      return Promise.resolve();
    }

    const event = NEEDS_WANTS_VOICE_SCRIPT.script.find(e => e.id === eventId);
    
    if (event) {
      console.log('✅ Evento TROVATO - Riproduco voce');
      console.log('Messaggio:', event.voice_line.substring(0, 80) + '...');
      console.log('Tono:', event.tone);
      
      speak(event.voice_line);
      
      // Restituisce una promise che si risolve dopo la pausa
      return new Promise(resolve => {
        setTimeout(resolve, (event.pause || 1) * 1000);
      });
    } else {
      // 🔥 DEBUG PER EVENTI NON TROVATI
      console.log('❌❌❌ EVENTO NON TROVATO:', eventId);
      console.log('Eventi disponibili:', NEEDS_WANTS_VOICE_SCRIPT.script.map(e => e.id));
      console.log('--- ATTENZIONE: Evento vocale inesistente! ---');
    }
    
    return Promise.resolve();
  }, [speak, isSupported]);

  return {
    triggerVoiceEvent,
    isVoiceSupported: isSupported
  };
};