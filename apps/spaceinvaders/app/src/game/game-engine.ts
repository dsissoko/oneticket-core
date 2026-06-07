import { logger } from '@/lib/logger';
import { createAlienWaveSystem } from '@/features/game/application/alien-wave-system';
import { createCannonSystem } from '@/features/game/application/cannon-system';
import type { GameFrameState, GameIntentSink, GamePhase } from './types';

type FrameListener = (frame: GameFrameState) => void;

export interface GameEngine {
  start: () => void;
  stop: () => void;
  resize: (width: number, height: number) => void;
  setPhase: (phase: GamePhase) => void;
  getIntentSink: () => GameIntentSink;
}

export function createGameEngine(onFrame: FrameListener): GameEngine {
  let animationFrameId: number | null = null;
  let lastTimestampMs: number | null = null;
  let phase: GamePhase = 'running';
  let width = 0;
  let height = 0;
  let movementDelta = 0;
  let fireCount = 0;
  const alienWaveSystem = createAlienWaveSystem();
  const cannonSystem = createCannonSystem();

  const tick = (timestampMs: number): void => {
    const deltaMs = lastTimestampMs === null ? 0 : Math.max(0, timestampMs - lastTimestampMs);
    lastTimestampMs = timestampMs;

    alienWaveSystem.update(deltaMs, width, height);
    cannonSystem.update(deltaMs, timestampMs, width, height, movementDelta, fireCount);

    const alienWave = alienWaveSystem.getState();
    const cannonSnapshot = cannonSystem.getState();

    const frame: GameFrameState = {
      phase,
      width,
      height,
      timestampMs,
      movementDelta,
      fireCount,
      alienWave,
      cannon: cannonSnapshot.cannon,
      playerMissiles: cannonSnapshot.missiles,
    };

    onFrame(frame);
    movementDelta = 0;
    animationFrameId = window.requestAnimationFrame(tick);
  };

  return {
    start: () => {
      if (animationFrameId !== null) return;
      lastTimestampMs = null;
      animationFrameId = window.requestAnimationFrame(tick);
      logger.info('[game-engine] started');
    },
    stop: () => {
      if (animationFrameId === null) return;
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      lastTimestampMs = null;
      logger.info('[game-engine] stopped');
    },
    resize: (nextWidth: number, nextHeight: number) => {
      width = nextWidth;
      height = nextHeight;
    },
    setPhase: (nextPhase: GamePhase) => {
      phase = nextPhase;
    },
    getIntentSink: () => ({
      move: (deltaX: number) => {
        movementDelta += deltaX;
      },
      fire: () => {
        fireCount += 1;
      },
    }),
  };
}
