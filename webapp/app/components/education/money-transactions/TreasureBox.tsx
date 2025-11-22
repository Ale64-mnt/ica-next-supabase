// app/components/education/money-transactions/TreasureBox.tsx
'use client';

import { GameItem } from '@/types/game';
import { useTranslations } from 'next-intl';

interface TreasureBoxProps {
  type: 'need' | 'want';
  onDrop: (item: GameItem) => void;
  droppedItems: GameItem[];
  isCorrect?: boolean;
}

export default function TreasureBox({ type, onDrop, droppedItems, isCorrect }: TreasureBoxProps) {
  const t = useTranslations('NeedsVsWantsGame');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    // Qui passeremo la logica per trovare l'item dall'ID
    // onDrop(findItemById(itemId));
  };

  const boxConfig = {
    need: {
      title: t('boxes.need'),
      emoji: '🏠',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800'
    },
    want: {
      title: t('boxes.want'), 
      emoji: '🎁',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-800'
    }
  };

  const config = boxConfig[type];

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-2xl p-6 min-h-64
        transition-all duration-300 flex flex-col items-center justify-center
        ${config.bgColor} ${config.borderColor}
        hover:border-solid hover:shadow-lg
        ${isCorrect ? 'ring-2 ring-green-500' : ''}
      `}
    >
      {/* Icona Scatola */}
      <div className="text-4xl mb-3">{config.emoji}</div>
      
      {/* Titolo */}
      <h3 className={`text-xl font-bold mb-2 ${config.textColor}`}>
        {config.title}
      </h3>
      
      {/* Istruzioni */}
      <p className="text-sm text-gray-600 text-center mb-4">
        {t('boxes.dropHere')}
      </p>
      
      {/* Items Droppati */}
      <div className="flex flex-wrap gap-2 justify-center">
        {droppedItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg px-3 py-1 text-sm shadow-sm border"
          >
            {item.name}
          </div>
        ))}
      </div>
      
      {/* Feedback Visivo */}
      {isCorrect && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
          ✓
        </div>
      )}
    </div>
  );
}