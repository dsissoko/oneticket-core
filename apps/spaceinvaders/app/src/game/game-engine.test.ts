import { describe, expect, it } from 'vitest';
import { createGameEngine } from '@/game/game-engine';
import { createScoreService } from '@/features/game/application/score-service';
import type { AlienState, GameFrameState, MissileState, ShieldState } from '@/game/types';
import type {
  CollisionResolution,
  CollisionSystem,
} from '@/features/game/domain/collision-system';

const defaultAlien: AlienState = {
  id: 'alien-0',
  row: 0,
  column: 0,
  x: 60,
  y: 60,
  width: 24,
  height: 16,
};

function createRafHarness(): {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
  step: (timestampMs: number) => void;
} {
  let nextId = 1;
  const callbacks = new Map<number, FrameRequestCallback>();

  return {
    requestAnimationFrame: (callback) => {
      const id = nextId;
      nextId += 1;
      callbacks.set(id, callback);
      return id;
    },
    cancelAnimationFrame: (id) => {
      callbacks.delete(id);
    },
    step: (timestampMs) => {
      const current = callbacks.entries().next().value as
        | [number, FrameRequestCallback]
        | undefined;
      if (!current) {
        throw new Error('No animation frame scheduled');
      }

      callbacks.delete(current[0]);
      current[1](timestampMs);
    },
  };
}

function createEngineFixture(initialAliens: AlienState[] = [defaultAlien]): {
  frames: GameFrameState[];
  engine: ReturnType<typeof createGameEngine>;
  setResolution: (resolution: CollisionResolution) => void;
  step: (timestampMs: number) => void;
} {
  const frames: GameFrameState[] = [];
  const raf = createRafHarness();
  const storageState = { best: 0 };

  let aliens = [...initialAliens];
  let alienMissiles: MissileState[] = [];
  let playerMissiles: MissileState[] = [];
  let shields: ShieldState[] = [];

  let nextResolution: CollisionResolution = {
    playerMissiles,
    alienMissiles,
    aliens,
    shieldImpacts: [],
    cannonHit: false,
    events: [],
  };

  const collisionSystem: CollisionSystem = {
    resolve: () => {
      playerMissiles = nextResolution.playerMissiles;
      alienMissiles = nextResolution.alienMissiles;
      aliens = nextResolution.aliens;
      return nextResolution;
    },
  };

  const engine = createGameEngine(
    (frame) => frames.push(frame),
    {
      createAlienWaveSystem: () => ({
        update: () => undefined,
        getState: () => ({
          aliens,
          missiles: alienMissiles,
          direction: 1,
          dropCount: 0,
          stepEvents: 0,
          waveWidth: 100,
        }),
        setAliens: (nextAliens) => {
          aliens = nextAliens;
        },
        setMissiles: (nextMissiles) => {
          alienMissiles = nextMissiles;
        },
      }),
      createCannonSystem: () => ({
        update: () => undefined,
        getState: () => ({
          cannon: {
            x: 100,
            y: 180,
            width: 40,
            height: 16,
            reloadDelayMs: 0,
          },
          missiles: playerMissiles,
        }),
        setMissiles: (nextMissiles) => {
          playerMissiles = nextMissiles;
        },
      }),
      createShieldSystem: () => ({
        updateLayout: () => undefined,
        getState: () => shields,
        applyShieldImpact: () => undefined,
      }),
      createCollisionSystem: () => collisionSystem,
      createScoreService: () =>
        createScoreService({
          getBestScore: () => storageState.best,
          setBestScore: (score) => {
            storageState.best = score;
          },
        }),
      requestAnimationFrame: raf.requestAnimationFrame,
      cancelAnimationFrame: raf.cancelAnimationFrame,
      getNow: () => 999,
    },
  );

  engine.resize(320, 240);

  return {
    frames,
    engine,
    setResolution: (resolution) => {
      nextResolution = resolution;
    },
    step: raf.step,
  };
}

describe('game-engine phase transitions and restart', () => {
  it('transitions to victory when all aliens are destroyed', () => {
    const fixture = createEngineFixture();
    fixture.setResolution({
      playerMissiles: [],
      alienMissiles: [],
      aliens: [],
      shieldImpacts: [],
      cannonHit: false,
      events: [{ type: 'missile-alien', missileId: 'm-1', targetId: 'alien-0' }],
    });

    fixture.engine.start();
    fixture.step(16);

    const frame = fixture.frames.at(-1);
    expect(frame?.phase).toBe('victory');
    expect(frame?.endReason).toBe('allAliensDestroyed');
    expect(frame?.phaseTransition).toEqual({
      from: 'running',
      to: 'victory',
      reason: 'allAliensDestroyed',
    });
    expect(frame?.finalScore).toBe(10);
    expect(frame?.bestScore).toBe(10);
  });

  it('transitions to game over when cannon is hit by alien missile', () => {
    const fixture = createEngineFixture();
    fixture.setResolution({
      playerMissiles: [],
      alienMissiles: [],
      aliens: [defaultAlien],
      shieldImpacts: [],
      cannonHit: true,
      events: [{ type: 'missile-cannon', missileId: 'a-1', targetId: 'cannon' }],
    });

    fixture.engine.start();
    fixture.step(16);

    const frame = fixture.frames.at(-1);
    expect(frame?.phase).toBe('gameOver');
    expect(frame?.endReason).toBe('cannonHit');
    expect(frame?.phaseTransition?.reason).toBe('cannonHit');
  });

  it('transitions to game over when aliens reach cannon line', () => {
    const fixture = createEngineFixture([
      {
        ...defaultAlien,
        y: 173,
      },
    ]);
    fixture.setResolution({
      playerMissiles: [],
      alienMissiles: [],
      aliens: [
        {
          ...defaultAlien,
          y: 173,
        },
      ],
      shieldImpacts: [],
      cannonHit: false,
      events: [],
    });

    fixture.engine.start();
    fixture.step(16);

    const frame = fixture.frames.at(-1);
    expect(frame?.phase).toBe('gameOver');
    expect(frame?.endReason).toBe('alienLineReached');
    expect(frame?.phaseTransition?.reason).toBe('alienLineReached');
  });

  it('restarts runtime state while keeping best score', () => {
    const fixture = createEngineFixture();
    fixture.setResolution({
      playerMissiles: [],
      alienMissiles: [],
      aliens: [],
      shieldImpacts: [],
      cannonHit: false,
      events: [{ type: 'missile-alien', missileId: 'm-1', targetId: 'alien-0' }],
    });

    fixture.engine.start();
    fixture.step(16);
    fixture.engine.restart();

    const frame = fixture.frames.at(-1);
    expect(frame?.phase).toBe('running');
    expect(frame?.phaseTransition).toEqual({
      from: 'victory',
      to: 'running',
      reason: 'restart',
    });
    expect(frame?.currentScore).toBe(0);
    expect(frame?.bestScore).toBe(10);
    expect(frame?.finalScore).toBeNull();
    expect(frame?.endReason).toBeNull();
  });
});
