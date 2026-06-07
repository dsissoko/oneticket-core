import { logger } from '@/lib/logger';
import { createAlienWaveSystem } from '@/features/game/application/alien-wave-system';
import { createCannonSystem } from '@/features/game/application/cannon-system';
import { createShieldSystem } from '@/features/game/application/shield-system';
import { createCollisionSystem } from '@/features/game/application/collision-system';
import {
  createScoreService,
  type ScoreService,
} from '@/features/game/application/score-service';
import type { AlienWaveSystem } from '@/features/game/domain/alien-wave-system';
import type { CannonSystem } from '@/features/game/domain/cannon-system';
import type { ShieldSystem } from '@/features/game/domain/shield-system';
import type { CollisionSystem } from '@/features/game/domain/collision-system';
import type {
  AlienState,
  CannonState,
  GameEndReason,
  GameFrameState,
  GameIntentSink,
  GamePhase,
  GamePhaseTransition,
} from './types';

type FrameListener = (frame: GameFrameState) => void;

export interface GameEngine {
  start: () => void;
  stop: () => void;
  resize: (width: number, height: number) => void;
  setPhase: (phase: GamePhase) => void;
  restart: () => void;
  getIntentSink: () => GameIntentSink;
}

interface GameEngineDependencies {
  createAlienWaveSystem: () => AlienWaveSystem;
  createCannonSystem: () => CannonSystem;
  createShieldSystem: () => ShieldSystem;
  createCollisionSystem: () => CollisionSystem;
  createScoreService: () => ScoreService;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
  getNow: () => number;
}

function hasAlienReachedCannonLine(aliens: AlienState[], cannon: CannonState | null): boolean {
  if (!cannon) return false;
  const cannonLineY = cannon.y - cannon.height / 2;
  return aliens.some((alien) => alien.y + alien.height >= cannonLineY);
}

export function createGameEngine(
  onFrame: FrameListener,
  dependencies: Partial<GameEngineDependencies> = {},
): GameEngine {
  const resolvedDependencies: GameEngineDependencies = {
    createAlienWaveSystem: dependencies.createAlienWaveSystem ?? (() => createAlienWaveSystem()),
    createCannonSystem: dependencies.createCannonSystem ?? (() => createCannonSystem()),
    createShieldSystem: dependencies.createShieldSystem ?? (() => createShieldSystem()),
    createCollisionSystem: dependencies.createCollisionSystem ?? (() => createCollisionSystem()),
    createScoreService: dependencies.createScoreService ?? (() => createScoreService()),
    requestAnimationFrame:
      dependencies.requestAnimationFrame ?? ((callback) => window.requestAnimationFrame(callback)),
    cancelAnimationFrame:
      dependencies.cancelAnimationFrame ?? ((handle) => window.cancelAnimationFrame(handle)),
    getNow: dependencies.getNow ?? (() => performance.now()),
  };

  let animationFrameId: number | null = null;
  let lastTimestampMs: number | null = null;
  let phase: GamePhase = 'running';
  let width = 0;
  let height = 0;
  let movementDelta = 0;
  let fireCount = 0;
  let finalScore: number | null = null;
  let endReason: GameEndReason | null = null;
  let phaseTransition: GamePhaseTransition | null = null;

  let alienWaveSystem = resolvedDependencies.createAlienWaveSystem();
  let cannonSystem = resolvedDependencies.createCannonSystem();
  let shieldSystem = resolvedDependencies.createShieldSystem();
  let collisionSystem = resolvedDependencies.createCollisionSystem();
  const scoreService = resolvedDependencies.createScoreService();

  const buildFrame = (timestampMs: number): GameFrameState => {
    const alienWave = alienWaveSystem.getState();
    const cannonSnapshot = cannonSystem.getState();
    const scoreSnapshot = scoreService.getSnapshot();

    return {
      phase,
      width,
      height,
      timestampMs,
      movementDelta,
      fireCount,
      alienWave,
      cannon: cannonSnapshot.cannon,
      playerMissiles: cannonSnapshot.missiles,
      shields: shieldSystem.getState(),
      currentScore: scoreSnapshot.currentScore,
      bestScore: scoreSnapshot.bestScore,
      finalScore,
      endReason,
      phaseTransition,
    };
  };

  const emitFrame = (timestampMs: number): void => {
    onFrame(buildFrame(timestampMs));
    phaseTransition = null;
  };

  const transitionPhase = (
    nextPhase: GamePhase,
    reason: GameEndReason | 'restart',
  ): void => {
    if (phase === nextPhase) return;

    phaseTransition = {
      from: phase,
      to: nextPhase,
      reason,
    };
    phase = nextPhase;

    if (nextPhase === 'running') {
      endReason = null;
      finalScore = null;
      return;
    }

    if (reason === 'restart') {
      endReason = null;
    } else {
      endReason = reason;
    }
    finalScore = scoreService.getSnapshot().currentScore;
    logger.info('[game-engine] phase transition', phaseTransition);
  };

  const recreateRuntimeState = (): void => {
    alienWaveSystem = resolvedDependencies.createAlienWaveSystem();
    cannonSystem = resolvedDependencies.createCannonSystem();
    shieldSystem = resolvedDependencies.createShieldSystem();
    collisionSystem = resolvedDependencies.createCollisionSystem();
  };

  const tick = (timestampMs: number): void => {
    const deltaMs = lastTimestampMs === null ? 0 : Math.max(0, timestampMs - lastTimestampMs);
    lastTimestampMs = timestampMs;

    if (phase === 'running') {
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

      for (const event of collisionResolution.events) {
        if (event.type === 'missile-alien') {
          scoreService.onAlienDestroyed();
        }
      }

      for (const shieldId of collisionResolution.shieldImpacts) {
        shieldSystem.applyShieldImpact(shieldId);
      }

      cannonSystem.setMissiles(collisionResolution.playerMissiles);
      alienWaveSystem.setMissiles(collisionResolution.alienMissiles);
      alienWaveSystem.setAliens(collisionResolution.aliens);

      const resolvedAlienWave = alienWaveSystem.getState();
      const resolvedCannonState = cannonSystem.getState();

      if (collisionResolution.cannonHit) {
        transitionPhase('gameOver', 'cannonHit');
      } else if (hasAlienReachedCannonLine(resolvedAlienWave.aliens, resolvedCannonState.cannon)) {
        transitionPhase('gameOver', 'alienLineReached');
      } else if (resolvedAlienWave.aliens.length === 0) {
        transitionPhase('victory', 'allAliensDestroyed');
      }
    }

    emitFrame(timestampMs);
    movementDelta = 0;
    fireCount = 0;
    animationFrameId = resolvedDependencies.requestAnimationFrame(tick);
  };

  return {
    start: () => {
      if (animationFrameId !== null) return;
      lastTimestampMs = null;
      animationFrameId = resolvedDependencies.requestAnimationFrame(tick);
      logger.info('[game-engine] started');
    },
    stop: () => {
      if (animationFrameId === null) return;
      resolvedDependencies.cancelAnimationFrame(animationFrameId);
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
    restart: () => {
      const previousPhase = phase;
      recreateRuntimeState();
      scoreService.resetRun();
      movementDelta = 0;
      fireCount = 0;
      lastTimestampMs = null;
      if (previousPhase !== 'running') {
        transitionPhase('running', 'restart');
      }
      emitFrame(resolvedDependencies.getNow());
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
