// app/components/education/money-transactions/ItemCard.tsx
'use client';

import { GameItem } from '@/types/game';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ItemCardProps {
  item: GameItem;
  onDragStart: (item: GameItem) => void;
  isDragging?: boolean;
}

export default function ItemCard({ item, onDragStart, isDragging }: ItemCardProps) {
  const t = useTranslations('NeedsVsWantsGame.items');

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', item.id);
    onDragStart(item);
  };

  const isEmoji = !item.image.startsWith('/');

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        relative bg-white rounded-xl shadow-md p-4 cursor-grab active:cursor-grabbing
        border-2 border-transparent transition-all duration-200
        hover:shadow-lg hover:scale-105 active:scale-95
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        w-32 h-32 flex flex-col items-center justify-center
      `}
    >
      {/* Icona/Immagine */}
      <div className="w-16 h-16 relative mb-2 flex items-center justify-center">
        {isEmoji ? (
          <span className="text-4xl">{item.image}</span>
        ) : (
          <Image
            src={item.image}
            alt={t(`${item.id}.name`)}
            fill
            className="object-contain"
          />
        )}
      </div>

      {/* Nome */}
      <span className="text-sm font-medium text-center text-gray-700">
        {t(`${item.id}.name`)}
      </span>

      {/* Indicatore Drag */}
      <div className="absolute top-2 right-2 text-gray-400">
        ⤴️
      </div>
    </div>
  );
}