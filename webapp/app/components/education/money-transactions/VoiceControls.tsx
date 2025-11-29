// app/components/education/money-transactions/VoiceControls.tsx
'use client';

import { Locale } from '@/types/game';
import { useTranslations } from 'next-intl';

interface VoiceControlsProps {
  locale: Locale;
  onSpeak: () => void;
  onStop: () => void;
  onPause?: () => void;
  onResume?: () => void;
  currentText?: string;
  isPlaying?: boolean;
  isPaused?: boolean;
}

export default function VoiceControls({ 
  locale, 
  onSpeak, 
  onStop,
  onPause,
  onResume,
  currentText, 
  isPlaying = false,
  isPaused = false
}: VoiceControlsProps) {
  const t = useTranslations('VoiceControls');

  return (
    <div className="flex flex-wrap gap-2 items-center p-4 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{t('narration')}:</span>
      
      <div className="flex gap-2">
        {/* Pulsante Riproduci */}
        <button
          onClick={onSpeak}
          disabled={isPlaying}
          className="px-3 py-1 bg-green-500 text-white rounded disabled:bg-green-300 flex items-center gap-1 text-sm hover:bg-green-600 transition-colors"
        >
          🔊 {t('repeat')}
        </button>
        
        {/* Pulsanti Pausa/Riprendi - mostrati solo durante riproduzione */}
        {isPlaying && !isPaused && onPause && (
          <button
            onClick={onPause}
            className="px-3 py-1 bg-yellow-500 text-white rounded flex items-center gap-1 text-sm hover:bg-yellow-600 transition-colors"
          >
            ⏸️ {t('pause')}
          </button>
        )}
        
        {isPaused && onResume && (
          <button
            onClick={onResume}
            className="px-3 py-1 bg-blue-500 text-white rounded flex items-center gap-1 text-sm hover:bg-blue-600 transition-colors"
          >
            ▶️ {t('resume')}
          </button>
        )}
        
        {/* Pulsante Stop */}
        <button
          onClick={onStop}
          disabled={!isPlaying && !isPaused}
          className="px-3 py-1 bg-red-500 text-white rounded disabled:bg-red-300 flex items-center gap-1 text-sm hover:bg-red-600 transition-colors"
        >
          ⏹️ {t('stop')}
        </button>
      </div>
      
      {/* Indicatori di Stato */}
      {isPlaying && !isPaused && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <span>{t('speaking')}</span>
        </div>
      )}
      
      {isPaused && (
        <div className="flex items-center gap-2 text-sm text-yellow-600">
          <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
          <span>{t('paused')}</span>
        </div>
      )}
      
      {/* Testo Corrente */}
      {currentText && (
        <div className="text-xs text-gray-500 max-w-xs">
          &ldquo;{currentText.substring(0, 60)}...&rdquo;
        </div>
      )}
    </div>
  );
}