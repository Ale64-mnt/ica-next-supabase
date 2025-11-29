// app/[locale]/education/money_transactions/6-10/needs-vs-wants/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useGameAudio } from '@/hooks/useGameAudio';
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
  const { playAudio, stopAudio, isLoading: isAudioLoading, isPlaying: isAudioPlaying } = useGameAudio(locale);
  
  const [currentStep, setCurrentStep] = useState<'intro' | 'playing' | 'reflection'>('intro');
  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null);
  const [needsItems, setNeedsItems] = useState<GameItem[]>([]);
  const [wantsItems, setWantsItems] = useState<GameItem[]>([]);
  const [remainingItems, setRemainingItems] = useState<GameItem[]>(NEEDS_WANTS_ITEMS);
  const [score, setScore] = useState(0);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);
  const [lastIncorrectBox, setLastIncorrectBox] = useState<'need' | 'want' | null>(null);
  
  // ✅ NUOVO STATO: feedback visivo per risposte corrette
  const [showCorrectFeedback, setShowCorrectFeedback] = useState(false);
  const [lastCorrectBox, setLastCorrectBox] = useState<'need' | 'want' | null>(null);
  
  const [isDragDisabled, setIsDragDisabled] = useState(true);
  const [hasIntroPlayed, setHasIntroPlayed] = useState(false); // ✅ EVITA DOPPIA RIPRODUZIONE INTRO

  console.log('🎮 COMPONENTE MONTATO - currentStep:', currentStep, 'isDragDisabled:', isDragDisabled);

  // ✅ CORREZIONE 1: Intro audio senza doppia riproduzione
  useEffect(() => {
    console.log('🎯 USEEFFECT ESEGUITO - hasIntroPlayed:', hasIntroPlayed);
    
    if (!hasIntroPlayed) {
      const playIntro = async () => {
        try {
          setIsDragDisabled(true);
          await playAudio('intro');
          console.log('✅ Intro audio completato - abilito drag & drop');
          setIsDragDisabled(false);
          setCurrentStep('playing');
          setHasIntroPlayed(true); // ✅ IMPEDISCE RIPETIZIONE
        } catch (error) {
          console.log('❌ Errore audio intro:', error);
          setIsDragDisabled(false);
          setCurrentStep('playing');
          setHasIntroPlayed(true);
        }
      };

      playIntro();
    }
  }, [hasIntroPlayed]);

  const findItemById = (id: string) => {
    return NEEDS_WANTS_ITEMS.find(item => item.id === id);
  };

  const resetGame = () => {
    stopAudio();
    setIsDragDisabled(true);
    setNeedsItems([]);
    setWantsItems([]);
    setRemainingItems(NEEDS_WANTS_ITEMS);
    setScore(0);
    setShowIncorrectFeedback(false);
    setShowCorrectFeedback(false); // ✅ RESET FEEDBACK CORRETTO
    setLastIncorrectBox(null);
    setLastCorrectBox(null);
    setHasIntroPlayed(false); // ✅ RESET PER NUOVA INTRO
    setCurrentStep('intro');
  };

  const handleDragStart = (item: GameItem) => {
    if (isDragDisabled) {
      console.log('⏸️ Drag bloccato - audio in riproduzione');
      return;
    }
    console.log('🎯 Inizio drag:', item.id);
    setDraggedItem(item);
  };

  const handleDrop = async (boxType: 'need' | 'want', itemId: string) => {
    if (isDragDisabled) {
      console.log('⏸️ Drop bloccato - audio in riproduzione');
      return;
    }
    
    const item = findItemById(itemId);
    if (!item) return;

    const isCorrect = item.category === boxType;
    
    if (isCorrect) {
      console.log('✅ Drop CORRETTO - sequenza iniziata');
      
      // ✅ 1. SPOSTA NELLA SCATOLA immediatamente
      setScore(prev => prev + 1);
      setRemainingItems(prev => prev.filter(i => i.id !== item.id));
      
      if (boxType === 'need') {
        setNeedsItems(prev => [...prev, item]);
      } else {
        setWantsItems(prev => [...prev, item]);
      }

      // ✅ 2. FEEDBACK VISIVO CORRETTO IMMEDIATO
      setShowCorrectFeedback(true);
      setLastCorrectBox(boxType);

      // ✅ 3. DISABILITA DRAG & DROP
      setIsDragDisabled(true);

      try {
        // ✅ 4. AUDIO CORRISPONDENTE
        console.log('🔊 Avvio audio feedback corretto');
        if (boxType === 'need') {
          await playAudio('need_correct');
        } else {
          await playAudio('desire_correct');
        }
        
        // ✅ 5. RIMUOVI FEEDBACK VISIVO DOPO AUDIO
        setShowCorrectFeedback(false);
        setLastCorrectBox(null);
        
        // ✅ 6. CONTROLLA COMPLETAMENTO
        const newRemainingCount = remainingItems.length - 1;
        console.log('📊 Item rimanenti:', newRemainingCount);
        
        if (newRemainingCount === 0) {
          console.log('🎯 Ultimo item - PRIMA attivo reflection, POI audio finale');
          setCurrentStep('reflection');
          await playAudio('level_complete');
        } else {
          // ✅ 7. RIABILITA DRAG & DROP se non è l'ultimo item
          console.log('🎵 Audio completato - riattivo drag & drop');
          setIsDragDisabled(false);
        }

      } catch (error) {
        console.log('❌ Errore audio:', error);
        // ✅ GARANZIA: riattiva drag & drop anche in caso di errore
        setShowCorrectFeedback(false);
        setLastCorrectBox(null);
        setIsDragDisabled(false);
      }

    } else {
      // ❌ CASO ERRATO
      console.log('❌ Drop ERRATO');
      
      // ✅ 1. FEEDBACK VISIVO IMMEDIATO
      setLastIncorrectBox(boxType);
      setShowIncorrectFeedback(true);
      
      // ✅ 2. DISABILITA DRAG & DROP
      setIsDragDisabled(true);

      try {
        // ✅ 3. AUDIO DOPO FEEDBACK VISIVO
        console.log('🔊 Avvio audio feedback errore');
        if (boxType === 'need') {
          await playAudio('desire_wrong');
        } else {
          await playAudio('need_wrong');
        }
      } catch (error) {
        console.log('❌ Errore audio:', error);
      } finally {
        // ✅ 4. RIABILITA DOPO 2 SECONDI
        setTimeout(() => {
          setShowIncorrectFeedback(false);
          setLastIncorrectBox(null);
          setIsDragDisabled(false);
          console.log('🔄 Feedback errore completato - riattivo drag & drop');
        }, 2000);
      }
    }

    setDraggedItem(null);
  };

  const getCurrentInstruction = () => {
    if (currentStep === 'intro') return t('voice.welcome');
    return remainingItems.length > 0 ? t('voice.instructions') : t('voice.complete');
  };

  const handleVoiceControlSpeak = () => {
    if (isAudioPlaying) {
      stopAudio();
      return;
    }
    
    if (currentStep === 'intro') {
      playAudio('intro');
    } else if (remainingItems.length > 0) {
      playAudio('instructions');
    } else {
      playAudio('level_complete');
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
          
          {/* ✅ CORREZIONE 2: Un solo messaggio "in riproduzione" */}
          {isDragDisabled && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              ⏸️ {currentStep === 'intro' ? 'Intro...' : 'Attendi...'}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto mb-8">
        <VoiceControls 
          locale={locale}
          onSpeak={handleVoiceControlSpeak}
          onStop={stopAudio}
          currentText={getCurrentInstruction()}
          isPlaying={isAudioPlaying}
          isPaused={false}
        />
      </div>

      <main className="max-w-6xl mx-auto">
        {(currentStep === 'intro' || currentStep === 'playing') && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* ✅ CORREZIONE 3: Aggiungi feedback corretto alle TreasureBox */}
              <TreasureBox
                type="need"
                onDrop={(itemId) => handleDrop('need', itemId)}
                droppedItems={needsItems}
                showIncorrectFeedback={showIncorrectFeedback && lastIncorrectBox === 'need'}
                isCorrect={showCorrectFeedback && lastCorrectBox === 'need'} // ✅ FEEDBACK CORRETTO
                isAudioPlaying={isDragDisabled}
              />
              
              <TreasureBox
                type="want"
                onDrop={(itemId) => handleDrop('want', itemId)}
                droppedItems={wantsItems}
                showIncorrectFeedback={showIncorrectFeedback && lastIncorrectBox === 'want'}
                isCorrect={showCorrectFeedback && lastCorrectBox === 'want'} // ✅ FEEDBACK CORRETTO
                isAudioPlaying={isDragDisabled}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                {t('itemsTitle')} ({remainingItems.length})
              </h2>
              
              {currentStep === 'intro' && (
                <div className="text-center py-8 bg-blue-50 rounded-lg mb-4">
                  <div className="text-4xl mb-3">🎮</div>
                  <p className="text-blue-700 font-semibold text-lg">
                    {t('listeningInstructions')} 🔊
                  </p>
                  <p className="text-blue-600 text-sm mt-2">
                    {t('dragWillEnable')}
                  </p>
                </div>
              )}
              
              {remainingItems.length > 0 ? (
                <div className="flex flex-wrap gap-4 justify-center">
                  {remainingItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onDragStart={handleDragStart}
                      isDragging={draggedItem?.id === item.id}
                      disabled={isDragDisabled}
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