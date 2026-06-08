// Shared TypeScript types for SpaceInvaders

export type GamePhase = 'menu' | 'playing' | 'gameOver' | 'victory';

export interface GameState {
  phase: GamePhase;
  score: number;
  bestScore: number;
}
