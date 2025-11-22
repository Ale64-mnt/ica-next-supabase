// app/[locale]/education/[macro_area]/[age_level]/[module]/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState, useEffect } from 'react';
import { useMultilingualTTS } from '@/hooks/useMultilingualTTS';
import VoiceControls from '@/components/education/money-transactions/VoiceControls';
import ItemCard from '@/components/education/money-transactions/ItemCard';
import TreasureBox from '@/components/education/money-transactions/TreasureBox';
import { NEEDS_WANTS_ITEMS } from '@/data/education/needs-wants-items';
import { GameItem, Locale } from '@/types/game';

interface Props {
  params: {
    locale: Locale;
    macro_area: string;
    age_level: string;
    module: string;
  };
}

export default function NeedsVsWantsGame({ params }: Props) {
  const { locale, macro_area, age_level, module: moduleId } = params;
  const t = useTranslations('NeedsVsWantsGame');
  const { speak, isSupported } = useMultilingualTTS(locale);
  
  const [currentStep, setCurrentStep] = useState<'intro' | 'playing' | 'reflection'>('intro');
  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null);
  const [needsItems, setNeedsItems] = useState<GameItem[]>([]);
  const [wantsItems, setWantsItems] = useState<GameItem[]>([]);
  const [remainingItems, setRemainingItems] = useState<GameItem[]>(NEEDS_WANTS_ITEMS);
  const [score, setScore] = useState(0);

  // Testi per la narrazione - useMemo per evitare warning React
  const voiceMessages = useMemo(() => ({
    welcome: t('voice.welcome'),
    instructions: t('voice.instructions'),
    correct: t('voice.correct'),
    almost: t('voice.almost'),
    reflection: t('voice.reflection'),
    complete: t('voice.complete')
  }), [t]);

  // Narrazione automatica all'avvio
  useEffect(() => {
    if (isSupported && currentStep === 'intro') {
      const timer = setTimeout(() => {
        speak(voiceMessages.welcome);
        
        setTimeout(() => {
          speak(voiceMessages.instructions);
          setCurrentStep('playing');
        }, 5000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, currentStep, speak, voiceMessages]);

  const handleDragStart = (item: GameItem) => {
    setDraggedItem(item);
  };

  const handleDrop = (boxType: 'need' | 'want', item: GameItem) => {
    const isCorrect = item.category === boxType;
    
    // Aggiorna punteggio
    if (isCorrect) {
      setScore(prev => prev + 1);
      speak(`${voiceMessages.correct} ${t(`items.${item.id}.explanation`)}`);
    } else {
      speak(`${voiceMessages.almost} ${t(`items.${item.id}.explanation`)}`);
    }

    // Sposta l'item nella scatola corretta
    if (boxType === 'need') {
      setNeedsItems(prev => [...prev, item]);
    } else {
      setWantsItems(prev => [...prev, item]);
    }

    // Rimuovi dagli items rimanenti
    setRemainingItems(prev => prev.filter(i => i.id !== item.id));
    setDraggedItem(null);

    // Controlla se il gioco è completo
    if (remainingItems.length === 1) { // Ultimo item
      setTimeout(() => {
        speak(voiceMessages.complete);
        setTimeout(() => {
          speak(voiceMessages.reflection);
          setCurrentStep('reflection');
        }, 3000);
      }, 1000);
    }
  };

  const getCurrentInstruction = () => {
    switch(currentStep) {
      case 'intro': return voiceMessages.welcome;
      case 'playing': return voiceMessages.instructions;
      case 'reflection': return voiceMessages.reflection;
      default: return voiceMessages.instructions;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-4">
      {/* Header */}
      <header className="text-center mb-8 pt-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        
        {/* Info percorso */}
        <div className="mt-2 text-sm text-gray-500">
          {macro_area} • {age_level} • {moduleId}
        </div>
        
        {/* Punteggio */}
        <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
          <span className="text-lg">⭐</span>
          <span className="font-semibold text-gray-700">
            {t('score')}: {score}/{NEEDS_WANTS_ITEMS.length}
          </span>
        </div>
      </header>

      {/* Controlli Audio */}
      <div className="max-w-4xl mx-auto mb-8">
        <VoiceControls 
          locale={locale}
          onSpeak={speak}
          currentText={getCurrentInstruction()}
        />
      </div>

      {/* Area di Gioco */}
      <main className="max-w-6xl mx-auto">
        {currentStep === 'playing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Scatola Bisogni */}
            <TreasureBox
              type="need"
              onDrop={(item) => handleDrop('need', item)}
              droppedItems={needsItems}
            />
            
            {/* Scatola Desideri */}
            <TreasureBox
              type="want" 
              onDrop={(item) => handleDrop('want', item)}
              droppedItems={wantsItems}
            />
          </div>
        )}

        {/* Items Draggabili */}
        {currentStep === 'playing' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              {t('itemsTitle')}
            </h2>
            
            <div className="flex flex-wrap gap-4 justify-center">
              {remainingItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onDragStart={handleDragStart}
                  isDragging={draggedItem?.id === item.id}
                />
              ))}
            </div>
            
            {remainingItems.length === 0 && (
              <div className="text-center mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700 font-semibold text-lg">
                  {t('completed')} 🎉
                </p>
              </div>
            )}
          </div>
        )}

        {/* Schermata Riflessione */}
        {currentStep === 'reflection' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {t('reflection.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {t('reflection.message')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">🏠 {t('reflection.needsTitle')}</h3>
                <p className="text-blue-700">{t('reflection.needsDescription')}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-bold text-purple-800 mb-2">🎁 {t('reflection.wantsTitle')}</h3>
                <p className="text-purple-700">{t('reflection.wantsDescription')}</p>
              </div>
            </div>
            
            {/* Bottone per ricominciare */}
            <button
              onClick={() => {
                setCurrentStep('intro');
                setNeedsItems([]);
                setWantsItems([]);
                setRemainingItems(NEEDS_WANTS_ITEMS);
                setScore(0);
              }}
              className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Gioca di nuovo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}