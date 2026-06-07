import { logger } from '@/lib/logger';
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
  let phase: GamePhase = 'running';
  let width = 0;
  let height = 0;
  let movementDelta = 0;
  let fireCount = 0;

  const tick = (timestampMs: number): void => {
    const frame: GameFrameState = {
      phase,
      width,
      height,
      timestampMs,
      movementDelta,
      fireCount,
    };

    onFrame(frame);
    movementDelta = 0;
    animationFrameId = window.requestAnimationFrame(tick);
  };

  return {
    start: () => {
      if (animationFrameId !== null) return;
      animationFrameId = window.requestAnimationFrame(tick);
      logger.info('[game-engine] started');
    },
    stop: () => {
      if (animationFrameId === null) return;
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
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
