// app/data/education/needs-wants-items.ts
import { GameItem } from '@/types/game';

export const NEEDS_WANTS_ITEMS: GameItem[] = [
  // BISOGNI (Needs) - Emoji placeholder
  {
    id: 'water',
    name: 'water',
    image: '💧', // Emoji acqua
    category: 'need',
    explanation: 'without_water'
  },
  {
    id: 'food',
    name: 'food', 
    image: '🍎', // Emoji cibo
    category: 'need',
    explanation: 'without_food'
  },
  {
    id: 'house',
    name: 'house',
    image: '🏠', // Emoji casa
    category: 'need', 
    explanation: 'without_house'
  },
  {
    id: 'clothes',
    name: 'clothes',
    image: '👕', // Emoji vestiti
    category: 'need',
    explanation: 'without_clothes'
  },
  {
    id: 'bed',
    name: 'bed',
    image: '🛏️', // Emoji letto
    category: 'need',
    explanation: 'without_bed'
  },

  // DESIDERI (Wants) - Emoji placeholder
  {
    id: 'icecream',
    name: 'icecream',
    image: '🍦', // Emoji gelato
    category: 'want',
    explanation: 'without_icecream'
  },
  {
    id: 'videogame',
    name: 'videogame',
    image: '🎮', // Emoji videogioco
    category: 'want',
    explanation: 'without_videogame'
  },
  {
    id: 'toy',
    name: 'toy',
    image: '🧸', // Emoji giocattolo
    category: 'want',
    explanation: 'without_toy'
  },
  {
    id: 'chocolate',
    name: 'chocolate',
    image: '🍫', // Emoji cioccolata
    category: 'want',
    explanation: 'without_chocolate'
  },
  {
    id: 'balloon',
    name: 'balloon',
    image: '🎈', // Emoji palloncino
    category: 'want',
    explanation: 'without_balloon'
  }
];