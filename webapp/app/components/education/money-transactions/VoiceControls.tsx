// app/components/education/money-transactions/VoiceControls.tsx
'use client';

import { useMultilingualTTS } from '@/hooks/useMultilingualTTS';
import { Locale } from '@/types/game';
import { useTranslations } from 'next-intl';

interface VoiceControlsProps {
  locale: Locale;
  onSpeak: (text: string) => void;
  currentText?: string;
}

export default function VoiceControls({ locale, onSpeak, currentText }: VoiceControlsProps) {
  const { stop, pause, resume, isSpeaking, isSupported } = useMultilingualTTS(locale);
  const t = useTranslations('VoiceControls'); // AGGIUNTO: hook traduzioni

  if (!isSupported) {
    return (
      <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-sm">
        ⚠️ {t('notSupported')}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center p-4 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{t('narration')}:</span>
      
      <div className="flex gap-2">
        <button
          onClick={() => currentText && onSpeak(currentText)}
          disabled={isSpeaking}
          className="px-3 py-1 bg-green-500 text-white rounded disabled:bg-green-300 flex items-center gap-1 text-sm"
        >
          🔊 {t('repeat')}
        </button>
        
        {isSpeaking ? (
          <>
            <button
              onClick={pause}
              className="px-3 py-1 bg-yellow-500 text-white rounded flex items-center gap-1 text-sm"
            >
              ⏸️ {t('pause')}
            </button>
            <button
              onClick={resume}
              className="px-3 py-1 bg-blue-500 text-white rounded flex items-center gap-1 text-sm"
            >
              ▶️ {t('resume')}
            </button>
          </>
        ) : null}
        
        <button
          onClick={stop}
          className="px-3 py-1 bg-red-500 text-white rounded flex items-center gap-1 text-sm"
        >
          ⏹️ {t('stop')}
        </button>
      </div>
      
      {isSpeaking && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="animate-pulse">●</div>
          <span>{t('speaking')}</span>
        </div>
      )}
    </div>
  );
}