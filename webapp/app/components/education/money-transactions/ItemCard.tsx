// app/components/education/money-transactions/ItemCard.tsx
'use client';

import { GameItem } from '@/types/game';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ItemCardProps {
  item: GameItem;
  onDragStart: (item: GameItem) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

export default function ItemCard({ 
  item, 
  onDragStart, 
  isDragging = false,
  disabled = false
}: ItemCardProps) {
  const t = useTranslations('NeedsVsWantsGame.items');

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', item.id);
    onDragStart(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDragStart(item);
    }
  };

  const isEmoji = !item.image.startsWith('/');

  // 🔥 MODIFICA CRUCIALE: onDragStart viene passato SOLO se non disabled
  const dragStartHandler = !disabled ? handleDragStart : undefined;

  return (
    <div
      draggable={!disabled}
      onDragStart={dragStartHandler} // 🔥 Passato condizionalmente
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Trascina ${t(`${item.id}.name`)} per classificarlo`}
      aria-disabled={disabled}
      className={`
        relative bg-white rounded-xl shadow-md p-4 
        border-2 border-transparent transition-all duration-200
        w-32 h-32 flex flex-col items-center justify-center
        focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500
        
        ${disabled 
          ? 'opacity-40 cursor-not-allowed grayscale' 
          : 'cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-105 active:scale-95'
        }
        
        ${isDragging ? 'opacity-50 scale-95 ring-4 ring-blue-300' : 'opacity-100'}
        
        sm:w-28 sm:h-28
        md:w-32 md:h-32
        lg:w-36 lg:h-36
      `}
    >
      {/* Icona/Immagine */}
      <div className="w-16 h-16 relative mb-2 flex items-center justify-center
                     sm:w-14 sm:h-14
                     md:w-16 md:h-16">
        {isEmoji ? (
          <span 
            className="text-4xl sm:text-3xl md:text-4xl" 
            role="img" 
            aria-label={t(`${item.id}.name`)}
          >
            {item.image}
          </span>
        ) : (
          <Image
            src={item.image}
            alt={t(`${item.id}.name`)}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, 72px"
          />
        )}
      </div>

      {/* Nome */}
      <span className="text-sm font-medium text-center text-gray-700
                      sm:text-xs
                      md:text-sm
                      line-clamp-2 break-words">
        {t(`${item.id}.name`)}
      </span>

      {/* Indicatore Drag - SOLO SE NON DISABILITATO */}
      {!disabled && (
        <div 
          className="absolute top-2 right-2 text-gray-400 text-xs"
          aria-hidden="true"
        >
          ⤴️
        </div>
      )}

      {/* Indicatore Disabilitato */}
      {disabled && (
        <div 
          className="absolute top-2 right-2 text-gray-400 text-xs"
          aria-hidden="true"
        >
          🔇
        </div>
      )}

      {/* Tooltip per stato disabilitato */}
      {disabled && (
        <div 
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200"
          role="tooltip"
        >
          Attendi fine audio
        </div>
      )}
    </div>
  );
}