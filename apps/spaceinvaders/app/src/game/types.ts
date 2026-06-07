export type GamePhase = 'running' | 'victory' | 'gameOver';

export interface GameIntentSink {
  move: (deltaX: number) => void;
  fire: () => void;
}

export interface GameFrameState {
  phase: GamePhase;
  width: number;
  height: number;
  timestampMs: number;
  movementDelta: number;
  fireCount: number;
}
