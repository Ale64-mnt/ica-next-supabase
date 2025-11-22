// app/types/game.ts
export type Locale = 'it' | 'en' | 'fr' | 'de' | 'es' | 'pl';

export interface GameItem {
  id: string;
  name: string;
  image: string;
  category: 'need' | 'want';
  explanation: string;
}

export interface GameSession {
  completedItems: GameItem[];
  score: number;
  timestamp: Date;
}