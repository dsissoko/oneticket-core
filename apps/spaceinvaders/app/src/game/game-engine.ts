import { logger } from '@/lib/logger';
import { createAlienWaveSystem } from '@/features/game/application/alien-wave-system';
import { createCannonSystem } from '@/features/game/application/cannon-system';
import { createShieldSystem } from '@/features/game/application/shield-system';
import { createCollisionSystem } from '@/features/game/application/collision-system';
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
  const shieldSystem = createShieldSystem();
  const collisionSystem = createCollisionSystem();

  const tick = (timestampMs: number): void => {
    const deltaMs = lastTimestampMs === null ? 0 : Math.max(0, timestampMs - lastTimestampMs);
    lastTimestampMs = timestampMs;

    alienWaveSystem.update(deltaMs, width, height);
    cannonSystem.update(deltaMs, timestampMs, width, height, movementDelta, fireCount);

    const alienWave = alienWaveSystem.getState();
    const cannonSnapshot = cannonSystem.getState();
    shieldSystem.updateLayout(width, height, cannonSnapshot.cannon, alienWave.aliens);

    const collisionResolution = collisionSystem.resolve({
      playerMissiles: cannonSnapshot.missiles,
      alienMissiles: alienWave.missiles,
      aliens: alienWave.aliens,
      cannon: cannonSnapshot.cannon,
      shields: shieldSystem.getState(),
    });

    for (const shieldId of collisionResolution.shieldImpacts) {
      shieldSystem.applyShieldImpact(shieldId);
    }

    cannonSystem.setMissiles(collisionResolution.playerMissiles);
    alienWaveSystem.setMissiles(collisionResolution.alienMissiles);
    alienWaveSystem.setAliens(collisionResolution.aliens);

    const resolvedAlienWave = alienWaveSystem.getState();
    const resolvedCannonState = cannonSystem.getState();
    const resolvedShields = shieldSystem.getState();

    const frame: GameFrameState = {
      phase,
      width,
      height,
      timestampMs,
      movementDelta,
      fireCount,
      alienWave: resolvedAlienWave,
      cannon: resolvedCannonState.cannon,
      playerMissiles: resolvedCannonState.missiles,
      shields: resolvedShields,
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
