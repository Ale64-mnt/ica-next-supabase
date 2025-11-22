// app/[locale]/education/money_transactions/6-10/needs-vs-wants/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState, useEffect } from 'react';
import { useVoiceEvents } from '@/hooks/useVoiceEvents';
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
  };
}

export default function NeedsVsWantsGame({ params }: Props) {
  const { locale, macro_area, age_level } = params;
  const t = useTranslations('NeedsVsWantsGame');
  const { triggerVoiceEvent, isVoiceSupported } = useVoiceEvents(locale);
  
  const [currentStep, setCurrentStep] = useState<'intro' | 'playing' | 'reflection'>('intro');
  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null);
  const [needsItems, setNeedsItems] = useState<GameItem[]>([]);
  const [wantsItems, setWantsItems] = useState<GameItem[]>([]);
  const [remainingItems, setRemainingItems] = useState<GameItem[]>(NEEDS_WANTS_ITEMS);
  const [score, setScore] = useState(0);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);
  const [lastIncorrectBox, setLastIncorrectBox] = useState<'need' | 'want' | null>(null);

  // Trova un item per ID
  const findItemById = (id: string) => {
    return NEEDS_WANTS_ITEMS.find(item => item.id === id);
  };

  // Reset del gioco
  const resetGame = () => {
    setNeedsItems([]);
    setWantsItems([]);
    setRemainingItems(NEEDS_WANTS_ITEMS);
    setScore(0);
    setShowIncorrectFeedback(false);
    setLastIncorrectBox(null);
    setCurrentStep('playing');
  };

  useEffect(() => {
    if (isVoiceSupported && currentStep === 'intro') {
      const timer = setTimeout(() => {
        triggerVoiceEvent('intro').then(() => {
          setCurrentStep('playing');
        });
      }, 1000);

      return () => clearTimeout(timer);
    } else if (!isVoiceSupported && currentStep === 'intro') {
      // Fallback senza voice
      setTimeout(() => setCurrentStep('playing'), 3000);
    }
  }, [isVoiceSupported, currentStep, triggerVoiceEvent]);

  const handleDragStart = (item: GameItem) => {
    setDraggedItem(item);
  };

  const handleDrop = async (boxType: 'need' | 'want', itemId: string) => {
    const item = findItemById(itemId);
    if (!item) return;

    const isCorrect = item.category === boxType;
    
    if (isCorrect) {
      // ✅ CORRETTO: +1 punto, elemento rimane nella scatola
      setScore(prev => prev + 1);
      
      if (boxType === 'need') {
        await triggerVoiceEvent('need_correct');
        setNeedsItems(prev => [...prev, item]);
      } else {
        await triggerVoiceEvent('desire_correct');
        setWantsItems(prev => [...prev, item]);
      }
      
      // Rimuove dalla lista degli elementi disponibili
      setRemainingItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      // ❌ SBAGLIATO: 0 punti, elemento RITORNA con feedback
      if (boxType === 'need') {
        await triggerVoiceEvent('desire_wrong');
      } else {
        await triggerVoiceEvent('need_wrong');
      }
      
      // Memorizza quale scatola ha ricevuto l'elemento sbagliato
      setLastIncorrectBox(boxType);
      setShowIncorrectFeedback(true);
      setTimeout(() => {
        setShowIncorrectFeedback(false);
        setLastIncorrectBox(null);
      }, 2000);
    }

    setDraggedItem(null);

    // Controlla se il gioco è completato
    if (remainingItems.length === 1 && isCorrect) {
      setTimeout(() => {
        triggerVoiceEvent('level_complete');
        setTimeout(() => {
          setCurrentStep('reflection');
        }, 3000);
      }, 1000);
    }
  };

  const getCurrentInstruction = () => {
    switch(currentStep) {
      case 'intro': 
        return t('voice.welcome');
      case 'playing': 
        return remainingItems.length > 0 
          ? t('voice.instructions') 
          : t('voice.complete');
      case 'reflection': 
        return t('voice.reflection');
      default: 
        return t('voice.instructions');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-4">
      <header className="text-center mb-8 pt-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        
        <div className="mt-2 text-sm text-gray-500">
          {macro_area} • {age_level} • {t('difficulty.easy')}
        </div>
        
        <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
          <span className="text-lg">⭐</span>
          <span className="font-semibold text-gray-700">
            {t('score')}: {score}/{NEEDS_WANTS_ITEMS.length}
          </span>
        </div>
      </header>

      {/* Controlli Voce */}
      <div className="max-w-4xl mx-auto mb-8">
        <VoiceControls 
          locale={locale}
          onSpeak={() => triggerVoiceEvent(currentStep === 'intro' ? 'intro' : 
                    currentStep === 'reflection' ? 'level_complete' : 'need_correct')}
          currentText={getCurrentInstruction()}
        />
      </div>

      <main className="max-w-6xl mx-auto">
        {/* Fase di Gioco */}
        {currentStep === 'playing' && (
          <>
            {/* Scatole */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <TreasureBox
                type="need"
                onDrop={(itemId) => handleDrop('need', itemId)}
                droppedItems={needsItems}
                showIncorrectFeedback={showIncorrectFeedback && lastIncorrectBox === 'need'}
              />
              
              <TreasureBox
                type="want"
                onDrop={(itemId) => handleDrop('want', itemId)}
                droppedItems={wantsItems}
                showIncorrectFeedback={showIncorrectFeedback && lastIncorrectBox === 'want'}
              />
            </div>

            {/* Elementi Disponibili */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                {t('itemsTitle')} ({remainingItems.length})
              </h2>
              
              {remainingItems.length > 0 ? (
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
              ) : (
                <div className="text-center p-8 bg-green-50 rounded-lg">
                  <p className="text-green-700 font-semibold text-lg mb-4">
                    {t('completed')} 🎉
                  </p>
                  <button
                    onClick={resetGame}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
                  >
                    {t('playAgain')}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Fase di Riflessione */}
        {currentStep === 'reflection' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {t('reflection.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {t('reflection.message')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3 text-xl">🏠 {t('reflection.needsTitle')}</h3>
                <p className="text-blue-700 mb-4">{t('reflection.needsDescription')}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {needsItems.map((item, index) => (
                    <span key={index} className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 text-sm">
                      {item.image} {t(`items.${item.id}.name`)}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                <h3 className="font-bold text-purple-800 mb-3 text-xl">🎁 {t('reflection.wantsTitle')}</h3>
                <p className="text-purple-700 mb-4">{t('reflection.wantsDescription')}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {wantsItems.map((item, index) => (
                    <span key={index} className="bg-purple-100 px-3 py-1 rounded-full text-purple-800 text-sm">
                      {item.image} {t(`items.${item.id}.name`)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-400 to-blue-400 p-6 rounded-xl text-white">
              <h3 className="text-2xl font-bold mb-3">⭐ Risultato Finale</h3>
              <p className="text-xl mb-4">
                Punteggio: <strong>{score}</strong> su <strong>{NEEDS_WANTS_ITEMS.length}</strong>
              </p>
              <button
                onClick={resetGame}
                className="bg-white text-gray-800 hover:bg-gray-100 px-8 py-3 rounded-full font-bold text-lg transition-colors shadow-lg"
              >
                {t('playAgain')} 🔄
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}