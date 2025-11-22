// app/components/education/money-transactions/TreasureBox.tsx
'use client';

import { GameItem } from '@/types/game';
import { useTranslations } from 'next-intl';

interface TreasureBoxProps {
  type: 'need' | 'want';
  onDrop: (itemId: string) => void;
  droppedItems: GameItem[];
  isCorrect?: boolean;
  showIncorrectFeedback?: boolean;
}

export default function TreasureBox({ 
  type, 
  onDrop, 
  droppedItems, 
  isCorrect,
  showIncorrectFeedback 
}: TreasureBoxProps) {
  const t = useTranslations('NeedsVsWantsGame');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    onDrop(itemId);
  };

  const boxConfig = {
    need: {
      title: t('boxes.need'),
      emoji: '🏠',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorderColor: 'border-blue-400',
      textColor: 'text-blue-800',
      description: t('boxes.needDescription')
    },
    want: {
      title: t('boxes.want'), 
      emoji: '🎁',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBorderColor: 'border-purple-400',
      textColor: 'text-purple-800',
      description: t('boxes.wantDescription')
    }
  };

  const config = boxConfig[type];

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative border-3 border-dashed rounded-2xl p-6 min-h-80
        transition-all duration-300 flex flex-col items-center justify-start
        ${config.bgColor} ${config.borderColor}
        hover:${config.hoverBorderColor} hover:border-solid hover:shadow-lg
        ${isCorrect ? 'ring-4 ring-green-400 border-green-400' : ''}
        ${showIncorrectFeedback ? 'ring-4 ring-red-400 border-red-400 animate-pulse' : ''}
        group cursor-pointer
      `}
    >
      {/* Icona Scatola con animazione */}
      <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">
        {config.emoji}
      </div>
      
      {/* Titolo */}
      <h3 className={`text-2xl font-bold mb-3 ${config.textColor}`}>
        {config.title}
      </h3>
      
      {/* Descrizione */}
      <p className="text-sm text-gray-600 text-center mb-4 max-w-xs">
        {config.description}
      </p>
      
      {/* Istruzioni Drop */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 mb-4 border">
        <p className="text-sm font-medium text-gray-700 text-center">
          {t('boxes.dropHere')}
        </p>
      </div>
      
      {/* Separatore */}
      <div className="w-full border-t border-gray-300 my-4"></div>
      
      {/* Items Droppati */}
      <div className="flex-1 w-full">
        <p className="text-xs text-gray-500 text-center mb-2">
          {t('boxes.droppedItems')} ({droppedItems.length})
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center min-h-20">
          {droppedItems.length === 0 ? (
            <div className="text-gray-400 text-sm italic flex items-center justify-center h-20">
              {t('boxes.empty')}
            </div>
          ) : (
            droppedItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="bg-white rounded-xl px-3 py-2 text-sm shadow-md border-2 border-green-200 flex items-center gap-2 transition-transform duration-200 hover:scale-105"
              >
                <span className="text-lg">{item.image}</span>
                <span className="font-medium text-gray-700 capitalize">
                  {t(`items.${item.id}.name`)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Feedback Visivo - Corretto */}
      {isCorrect && (
        <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-lg animate-bounce">
          ✓
        </div>
      )}
      
      {/* Feedback Visivo - Incorretto */}
      {showIncorrectFeedback && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-lg animate-ping">
          !
        </div>
      )}
      
      {/* Indicatore Drag & Drop */}
      <div className="absolute bottom-4 text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {t('boxes.releaseToDrop')}
      </div>
    </div>
  );
}