// app/components/education/money-transactions/VoiceControls.tsx
'use client';

import { Locale } from '@/types/game';
import { useTranslations } from 'next-intl';
import { Play, Pause, StopCircle, RotateCcw } from 'lucide-react';

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

  // Determina lo stato del pulsante principale
  const getMainButtonState = () => {
    if (isPlaying && !isPaused) {
      return 'playing';
    } else if (isPaused) {
      return 'paused';
    } else {
      return 'stopped';
    }
  };

  const mainButtonState = getMainButtonState();

  return (
    <div className="flex flex-wrap gap-4 items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <span className="text-sm font-medium text-gray-700">{t('narration')}:</span>
      
      <div className="flex gap-2 flex-wrap">
        {/* Pulsante PRINCIPALE: Riproduci/Ripeti */}
        <button
          onClick={onSpeak}
          disabled={isPlaying && !isPaused}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all min-w-[120px] justify-center ${
            mainButtonState === 'playing'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : mainButtonState === 'paused'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          aria-label={mainButtonState === 'stopped' ? t('play') : t('repeat')}
        >
          {mainButtonState === 'playing' ? (
            <>
              <RotateCcw className="w-4 h-4" />
              {t('repeat')}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {mainButtonState === 'paused' ? t('resume') : t('play')}
            </>
          )}
        </button>
        
        {/* Pulsante Pausa - solo se è in riproduzione e non in pausa */}
        {isPlaying && !isPaused && onPause && (
          <button
            onClick={onPause}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-yellow-600 transition-colors min-w-[100px] justify-center"
            aria-label={t('pause')}
          >
            <Pause className="w-4 h-4" />
            {t('pause')}
          </button>
        )}
        
        {/* Pulsante Stop - solo se è in riproduzione o in pausa */}
        {(isPlaying || isPaused) && (
          <button
            onClick={onStop}
            className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-red-600 transition-colors min-w-[100px] justify-center"
            aria-label={t('stop')}
          >
            <StopCircle className="w-4 h-4" />
            {t('stop')}
          </button>
        )}
      </div>
      
      {/* Indicatori di Stato */}
      <div className="flex items-center gap-2 ml-auto">
        {isPlaying && !isPaused && (
          <div className="flex items-center gap-2 text-sm text-blue-600" aria-live="polite">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>{t('speaking')}</span>
          </div>
        )}
        
        {isPaused && (
          <div className="flex items-center gap-2 text-sm text-yellow-600" aria-live="polite">
            <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
            <span>{t('paused') || 'In pausa'}</span>
          </div>
        )}
        
        {!isPlaying && !isPaused && (
          <div className="flex items-center gap-2 text-sm text-gray-500" aria-live="polite">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>{t('ready') || 'Pronto'}</span>
          </div>
        )}
      </div>
    </div>
  );
}