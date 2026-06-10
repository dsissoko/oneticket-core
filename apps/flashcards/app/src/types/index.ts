// Shared TypeScript types for Flashcards

type LearningMode = 'flip' | 'spaced-repetition';

interface Theme {
  id: string;
  name: string;
  cards: Card[];
}

interface Card {
  id: string;
  label?: string;
  front: CardSide;
  back: CardSide;
}

interface RenderEngine {
  render(data: any, target: HTMLElement): void;
  precompute?(data: any): Promise<void>;
}

type CardSide = string | { data: any; renderEngineId: string };

interface SessionResult {
  cardId: string;
  known: boolean;
  timestamp: number;
}

export type { LearningMode, Theme, Card, SessionResult, RenderEngine, CardSide };