// app/[locale]/education/money_transactions/6-10/needs-vs-wants/page.tsx
// VERSIONE FINALE CON LINK PDF

'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { useGameAudio } from '@/hooks/useGameAudio';
import ItemCard from '@/components/education/money-transactions/ItemCard';
import TreasureBox from '@/components/education/money-transactions/TreasureBox';
import { NEEDS_WANTS_ITEMS } from '@/data/education/needs-wants-items';
import { GameItem, Locale } from '@/types/game';
import { VolumeX, Volume2 } from 'lucide-react';

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
  
  const { 
    playAudio, 
    stopAudio, 
    isPlaying: isAudioPlaying,
    toggleMusic,
    isMusicPlaying 
  } = useGameAudio(locale);
  
  // Stati principali
  const [currentStep, setCurrentStep] = useState<'intro' | 'playing' | 'reflection'>('intro');
  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null);
  const [needsItems, setNeedsItems] = useState<GameItem[]>([]);
  const [wantsItems, setWantsItems] = useState<GameItem[]>([]);
  const [remainingItems, setRemainingItems] = useState<GameItem[]>(NEEDS_WANTS_ITEMS);
  const [score, setScore] = useState(0);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);
  const [lastIncorrectBox, setLastIncorrectBox] = useState<'need' | 'want' | null>(null);
  const [showCorrectFeedback, setShowCorrectFeedback] = useState(false);
  const [lastCorrectBox, setLastCorrectBox] = useState<'need' | 'want' | null>(null);
  
  // Stati di controllo per drag & audio
  const [isDragDisabled, setIsDragDisabled] = useState(true);
  const [hasIntroPlayed, setHasIntroPlayed] = useState(false);
  const [isProcessingLastItem, setIsProcessingLastItem] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const pdfUrl = `https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/Application/need-vs-wants/PDF/Technical-Sheet/${locale}.pdf`;

  // ✅ 1. Cleanup quando si esce dalla pagina
  useEffect(() => {
    console.log('🔇 Setup: componente montato');
    setIsInitializing(false);
    
    return () => {
      console.log('🔇 Cleanup: fermo tutto quando si lascia la pagina');
      stopAudio();
    };
  }, [stopAudio]);

  // ✅ 2. LOGICA CENTRALE PER CONTROLLO DRAG - VERSIONE FINALE
  useEffect(() => {
    console.log('🎮 Controllo stato drag:', { 
      currentStep,
      isAudioPlaying,
      isDragDisabled,
      isTransitioning,
      isInitializing
    });

    let shouldBeDisabled = true;

    switch(currentStep) {
      case 'intro':
        shouldBeDisabled = true;
        console.log('🚫 Intro: drag sempre disabilitato');
        break;
        
      case 'playing':
        shouldBeDisabled = isAudioPlaying || isProcessingLastItem || isTransitioning || isInitializing;
        console.log(`🎮 Playing: drag ${shouldBeDisabled ? 'disabilitato' : 'ABILITATO'}, ragioni:`, {
          isAudioPlaying,
          isProcessingLastItem,
          isTransitioning,
          isInitializing
        });
        break;
        
      case 'reflection':
        shouldBeDisabled = true;
        console.log('🏆 Reflection: drag sempre disabilitato');
        break;
    }

    if (isDragDisabled !== shouldBeDisabled) {
      console.log(`🔄 Cambio stato drag: ${isDragDisabled ? 'disabilitato' : 'abilitato'} → ${shouldBeDisabled ? 'disabilitato' : 'abilitato'}`);
      setIsDragDisabled(shouldBeDisabled);
      
      if (!shouldBeDisabled) {
        setShowCorrectFeedback(false);
        setShowIncorrectFeedback(false);
        setLastCorrectBox(null);
        setLastIncorrectBox(null);
      }
    }
  }, [
    currentStep, 
    isAudioPlaying, 
    isDragDisabled, 
    isTransitioning, 
    isProcessingLastItem,
    isInitializing
  ]);

  // ✅ 3. INTRO AUDIO CON GESTIONE ROBUSTA DELLE TRANSAZIONI
  useEffect(() => {
    if (!hasIntroPlayed && currentStep === 'intro' && !isInitializing) {
      const playIntro = async () => {
        try {
          console.log('🎬 Inizio intro audio');
          setIsTransitioning(true);
          
          await playAudio('intro');
          console.log('✅ Intro audio completata con successo');
          
        } catch (error) {
          console.log('⚠️ Intro fallita o non disponibile:', error);
        } finally {
          console.log('🚀 Passaggio a playing step');
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          setCurrentStep('playing');
          setHasIntroPlayed(true);
          
          setTimeout(() => {
            setIsTransitioning(false);
            console.log('✅ Transizione completata, drag ora disponibile');
          }, 500);
        }
      };

      playIntro();
    }
  }, [hasIntroPlayed, currentStep, playAudio, isInitializing]);

  // ✅ 4. FUNZIONI DI GIOCO
  const findItemById = useCallback((id: string) => {
    return NEEDS_WANTS_ITEMS.find(item => item.id === id);
  }, []);

  const resetGame = useCallback(() => {
    console.log('🔄 Reset del gioco');
    stopAudio();
    setIsDragDisabled(true);
    setNeedsItems([]);
    setWantsItems([]);
    setRemainingItems(NEEDS_WANTS_ITEMS);
    setScore(0);
    setShowIncorrectFeedback(false);
    setShowCorrectFeedback(false);
    setLastIncorrectBox(null);
    setLastCorrectBox(null);
    setHasIntroPlayed(false);
    setIsProcessingLastItem(false);
    setIsTransitioning(false);
    setCurrentStep('intro');
  }, [stopAudio]);

  const handleDragStart = useCallback((item: GameItem) => {
    if (isDragDisabled) {
      console.log('🚫 Drag bloccato! Stato attuale:', { isDragDisabled });
      return;
    }
    console.log('🖱️ Inizio drag di:', item.id);
    setDraggedItem(item);
  }, [isDragDisabled]);

  const handleDrop = useCallback(async (boxType: 'need' | 'want', itemId: string) => {
    if (isDragDisabled) {
      console.log('🚫 Drop bloccato! Drag disabilitato');
      return;
    }
    
    const item = findItemById(itemId);
    if (!item) {
      console.log('❌ Item non trovato:', itemId);
      return;
    }

    const isCorrect = item.category === boxType;
    const isLastItem = remainingItems.length === 1;
    
    console.log(`🎯 Drop su ${boxType}: ${isCorrect ? 'CORRETTO' : 'ERRATO'} ${isLastItem ? '(ULTIMO ITEM)' : ''}`);
    
    setScore(prev => prev + (isCorrect ? 1 : 0));
    
    if (isCorrect) {
      setRemainingItems(prev => prev.filter(i => i.id !== item.id));
      
      if (boxType === 'need') {
        setNeedsItems(prev => [...prev, item]);
      } else {
        setWantsItems(prev => [...prev, item]);
      }
    }

    if (isCorrect) {
      setShowCorrectFeedback(true);
      setLastCorrectBox(boxType);
    } else {
      setShowIncorrectFeedback(true);
      setLastIncorrectBox(boxType);
    }

    try {
      let audioType;
      if (isCorrect) {
        audioType = boxType === 'need' ? 'need_correct' : 'desire_correct';
      } else {
        audioType = boxType === 'need' ? 'desire_wrong' : 'need_wrong';
      }
      
      console.log(`🔊 Riproduco audio feedback: ${audioType}`);
      await playAudio(audioType);
      
      if (isCorrect && isLastItem) {
        console.log('🎯 ULTIMO OGGETTO - Inizio transizione a reflection');
        setIsProcessingLastItem(true);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCurrentStep('reflection');
        
        console.log('🔊 Audio level_complete');
        await playAudio('level_complete');
        
        setIsProcessingLastItem(false);
      }
      
    } catch (error) {
      console.log('❌ Errore nella riproduzione audio:', error);
      setShowCorrectFeedback(false);
      setShowIncorrectFeedback(false);
      setLastCorrectBox(null);
      setLastIncorrectBox(null);
    }

    setDraggedItem(null);
  }, [isDragDisabled, findItemById, remainingItems.length, playAudio]);

  // ✅ 5. FUNZIONI DI UTILITÀ
  const getDragStatusText = useCallback(() => {
    if (isInitializing) {
      return t('dragStatus.loading');
    }
    if (showCorrectFeedback) {
      return t('feedback.correct');
    }
    if (showIncorrectFeedback) {
      return t('feedback.incorrect');
    }
    if (isDragDisabled) {
      if (isAudioPlaying) {
        return t('dragStatus.listening');
      }
      if (isTransitioning) {
        return t('dragStatus.preparing');
      }
      if (isProcessingLastItem) {
        return t('dragStatus.completing');
      }
      return t('dragStatus.waiting');
    }
    return t('dragStatus.ready');
  }, [
    showCorrectFeedback, 
    showIncorrectFeedback, 
    isDragDisabled, 
    isAudioPlaying, 
    isTransitioning, 
    isProcessingLastItem,
    isInitializing,
    t
  ]);

  const musicButtonText = locale === 'it' 
    ? (isMusicPlaying ? 'Musica ON' : 'Musica OFF')
    : (isMusicPlaying ? 'Music ON' : 'Music OFF');

  // ✅ 6. RENDER
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
        
        <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
          {/* Pulsante Musica */}
          <button
            onClick={toggleMusic}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
              isMusicPlaying 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow' 
                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
            }`}
            aria-label={musicButtonText}
          >
            {isMusicPlaying ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span>{musicButtonText}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{musicButtonText}</span>
              </>
            )}
          </button>
          
          {/* Link PDF per insegnanti */}
          {/* Link PDF per insegnanti - RESPONSIVE: solo icona su mobile */}
<a 
  href={pdfUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-all"
  title={t('teacherInfo')}
>
  📋 
  <span className="font-medium hidden sm:inline">
    {t('gameSheet')}
  </span>
</a>
          
          {/* Punteggio */}
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <span className="text-lg">⭐</span>
            <span className="font-semibold text-gray-700">
              {t('score')}: {score}/{NEEDS_WANTS_ITEMS.length}
            </span>
          </div>
          
          {/* Indicatore di stato drag */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm min-w-[180px]">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
              isDragDisabled 
                ? (isTransitioning || isInitializing ? 'bg-yellow-500 animate-pulse' : 'bg-red-500') 
                : 'bg-green-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              isDragDisabled 
                ? (isTransitioning || isInitializing ? 'text-yellow-700' : 'text-red-700')
                : 'text-green-700'
            }`}>
              {getDragStatusText()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {(currentStep === 'intro' || currentStep === 'playing') && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <TreasureBox
                type="need"
                onDrop={(itemId) => handleDrop('need', itemId)}
                droppedItems={needsItems}
                showIncorrectFeedback={showIncorrectFeedback && lastIncorrectBox === 'need'}
                isCorrect={showCorrectFeedback && lastCorrectBox === 'need'}
                isAudioPlaying={isDragDisabled}
              />
              
              <TreasureBox
                type="want"
                onDrop={(itemId) => handleDrop('want', itemId)}
                droppedItems={wantsItems}
                showIncorrectFeedback={showIncorrectFeedback && lastIncorrectBox === 'want'}
                isCorrect={showCorrectFeedback && lastCorrectBox === 'want'}
                isAudioPlaying={isDragDisabled}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {t('itemsTitle')}
                </h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                  {remainingItems.length} {t('remainingText')}
                </span>
              </div>
              
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
              
              {/* Messaggio di attesa audio */}
              {isDragDisabled && (currentStep === 'intro' || currentStep === 'playing') && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center animate-pulse">
                  <p className="text-yellow-700 text-sm font-medium">
                    {t('audioWaitMessage')}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {currentStep === 'reflection' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-4xl mx-auto animate-fadeIn">
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
                className="bg-white text-gray-800 hover:bg-gray-100 px-8 py-3 rounded-full font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
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