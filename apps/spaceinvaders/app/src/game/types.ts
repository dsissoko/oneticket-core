export type GamePhase = 'running' | 'victory' | 'gameOver';

export type WaveDirection = -1 | 1;

export interface AlienState {
  id: string;
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MissileState {
  id: string;
  x: number;
  y: number;
  velocityY: number;
}

export interface AlienWaveState {
  aliens: AlienState[];
  missiles: MissileState[];
  direction: WaveDirection;
  dropCount: number;
  stepEvents: number;
  waveWidth: number;
}

export interface CannonState {
  x: number;
  y: number;
  width: number;
  height: number;
  reloadDelayMs: number;
}

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
  alienWave: AlienWaveState;
  cannon: CannonState | null;
  playerMissiles: MissileState[];
}
