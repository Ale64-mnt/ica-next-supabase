// app/[locale]/education/[macro_area]/[age_level]/[module]/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
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
  const { locale, macro_area, age_level, module } = params;
  const t = useTranslations('NeedsVsWantsGame');
  const { speakText, stopSpeaking, isSpeaking } = useMultilingualTTS(locale);
  
  const [currentStep, setCurrentStep] = useState<'intro' | 'playing' | 'reflection'>('intro');
  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null);
  const [needsItems, setNeedsItems] = useState<GameItem[]>([]);
  const [wantsItems, setWantsItems] = useState<GameItem[]>([]);
  const [remainingItems, setRemainingItems] = useState<GameItem[]>(NEEDS_WANTS_ITEMS);
  const [score, setScore] = useState(0);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);
  const [lastIncorrectBox, setLastIncorrectBox] = useState<'need' | 'want' | null>(null);
  
  const hasIntroPlayed = useRef(false);
  const isCompleting = useRef(false);

  const findItemById = (id: string) => {
    return NEEDS_WANTS_ITEMS.find(item => item.id === id);
  };

  const resetGame = () => {
    stopSpeaking(); // 🔥 CORRETTO: stopSpeaking invece di stopAudio
    hasIntroPlayed.current = false;
    isCompleting.current = false;
    setNeedsItems([]);
    setWantsItems([]);
    setRemainingItems(NEEDS_WANTS_ITEMS);
    setScore(0);
    setShowIncorrectFeedback(false);
    setLastIncorrectBox(null);
    setCurrentStep('playing');
  };

  useEffect(() => {
    if (currentStep === 'intro' && !hasIntroPlayed.current) {
      hasIntroPlayed.current = true;
      
      const timer = setTimeout(() => {
        speakText('intro'); // 🔥 CORRETTO: speakText invece di playAudio
        
        // Passa automaticamente al gioco dopo un tempo ragionevole
        setTimeout(() => {
          setCurrentStep('playing');
        }, 4000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, speakText]); // 🔥 CORRETTO: speakText invece di playAudio

  const handleDragStart = (item: GameItem) => {
    setDraggedItem(item);
  };

  const handleDrop = (boxType: 'need' | 'want', itemId: string) => {
    if (isSpeaking) return; // 🔥 CORRETTO: isSpeaking invece di isAudioPlaying/isAudioLoading
    
    const item = findItemById(itemId);
    if (!item) return;

    const isCorrect = item.category === boxType;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      
      if (boxType === 'need') {
        speakText('need_correct'); // 🔥 CORRETTO: speakText invece di playAudio
        setNeedsItems(prev => [...prev, item]);
      } else {
        speakText('desire_correct'); // 🔥 CORRETTO: speakText invece di playAudio
        setWantsItems(prev => [...prev, item]);
      }
      
      setRemainingItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      if (boxType === 'need') {
        speakText('desire_wrong'); // 🔥 CORRETTO: speakText invece di playAudio
      } else {
        speakText('need_wrong'); // 🔥 CORRETTO: speakText invece di playAudio
      }
      
      setLastIncorrectBox(boxType);
      setShowIncorrectFeedback(true);
      setTimeout(() => {
        setShowIncorrectFeedback(false);
        setLastIncorrectBox(null);
      }, 2000);
    }

    setDraggedItem(null);

    if (remainingItems.length === 1 && isCorrect && !isCompleting.current) {
      isCompleting.current = true;
      
      setTimeout(() => {
        speakText('level_complete'); // 🔥 CORRETTO: speakText invece di playAudio
        
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

  const handleVoiceControlSpeak = () => {
    stopSpeaking(); // 🔥 CORRETTO: stopSpeaking invece di stopAudio
    
    switch(currentStep) {
      case 'intro':
        speakText('intro'); // 🔥 CORRETTO: speakText invece di playAudio
        break;
      case 'reflection':
        speakText('level_complete'); // 🔥 CORRETTO: speakText invece di playAudio
        break;
      case 'playing':
        if (remainingItems.length > 0) {
          speakText('need_correct'); // 🔥 CORRETTO: speakText invece di playAudio
        } else {
          speakText('level_complete'); // 🔥 CORRETTO: speakText invece di playAudio
        }
        break;
      default:
        speakText('intro'); // 🔥 CORRETTO: speakText invece di playAudio
    }
  };

  // 🔥 FUNZIONI PLACEHOLDER per pausa/riprendi
  const handlePause = () => {
    console.log('Pausa audio - da implementare');
  };

  const handleResume = () => {
    console.log('Riprendi audio - da implementare');
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
          {macro_area} • {age_level} • {module} • {t('difficulty.easy')}
        </div>
        
        <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
          <span className="text-lg">⭐</span>
          <span className="font-semibold text-gray-700">
            {t('score')}: {score}/{NEEDS_WANTS_ITEMS.length}
          </span>
          {isSpeaking && ( // 🔥 CORRETTO: isSpeaking invece di isAudioLoading/isAudioPlaying
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              🔊 In riproduzione
            </span>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto mb-8">
        <VoiceControls 
          locale={locale}
          onSpeak={handleVoiceControlSpeak}
          onStop={stopSpeaking} // 🔥 CORRETTO: stopSpeaking invece di stopAudio
          onPause={handlePause}
          onResume={handleResume}
          currentText={getCurrentInstruction()}
          isPlaying={isSpeaking} // 🔥 CORRETTO: isSpeaking invece di isAudioPlaying
          isPaused={false}
        />
      </div>

      <main className="max-w-6xl mx-auto">
        {currentStep === 'playing' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <TreasureBox
                type="need"
                onDrop={(itemId) => handleDrop('need', itemId)}
                droppedItems={needsItems}
                showIncorrectFeedback={showIncorrectFeedback && lastIncorrectBox === 'need'}
                isAudioPlaying={isSpeaking} // 🔥 CORRETTO: isSpeaking invece di isAudioPlaying
              />
              
              <TreasureBox
                type="want"
                onDrop={(itemId) => handleDrop('want', itemId)}
                droppedItems={wantsItems}
                showIncorrectFeedback={showIncorrectFeedback && lastIncorrectBox === 'want'}
                isAudioPlaying={isSpeaking} // 🔥 CORRETTO: isSpeaking invece di isAudioPlaying
              />
            </div>

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
                      disabled={isSpeaking} // 🔥 CORRETTO: isSpeaking invece di isAudioPlaying/isAudioLoading
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
                    {t('playAgain')} 🔄
                  </button>
                </div>
              )}
            </div>
          </>
        )}

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
              <h3 className="text-2xl font-bold mb-3">⭐ {t('reflection.finalResult')}</h3>
              <p className="text-xl mb-4">
                {t('score')}: <strong>{score}</strong> {t('reflection.outOf')} <strong>{NEEDS_WANTS_ITEMS.length}</strong>
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