// Shared TypeScript types for Flashcards

type LearningMode = 'flip' | 'spaced-repetition';

interface Theme {
  id: string;
  name: string;
  cards: Card[];
}

interface Card {
  id: string;
  front: string;
  back: string;
}

interface SessionResult {
  cardId: string;
  known: boolean;
  timestamp: number;
}

export type { LearningMode, Theme, Card, SessionResult };