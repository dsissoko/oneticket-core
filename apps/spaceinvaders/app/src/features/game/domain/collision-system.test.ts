import { describe, expect, it } from 'vitest';
import type { AlienState, CannonState, MissileState, ShieldState } from '@/game/types';
import { createCollisionSystem } from './collision-system';

const baseShields: ShieldState[] = [
  {
    id: 'shield-0',
    x: 300,
    y: 420,
    width: 80,
    height: 28,
    durability: 10,
    maxDurability: 10,
  },
];

const baseAliens: AlienState[] = [
  {
    id: 'alien-0',
    row: 0,
    column: 0,
    x: 280,
    y: 120,
    width: 30,
    height: 20,
  },
];

const baseCannon: CannonState = {
  x: 300,
  y: 560,
  width: 48,
  height: 18,
  reloadDelayMs: 0,
};

describe('collision-system', () => {
  it('removes missile in same tick and decrements shield durability through impact events', () => {
    const collisionSystem = createCollisionSystem();
    const playerMissiles: MissileState[] = [{ id: 'p1', x: 300, y: 430, velocityY: -320 }];

    const resolution = collisionSystem.resolve({
      playerMissiles,
      alienMissiles: [],
      aliens: baseAliens,
      cannon: baseCannon,
      shields: baseShields,
    });

    expect(resolution.playerMissiles).toHaveLength(0);
    expect(resolution.shieldImpacts).toEqual(['shield-0']);
  });

  it('removes player missile and alien on collision', () => {
    const collisionSystem = createCollisionSystem();
    const playerMissiles: MissileState[] = [{ id: 'p1', x: 295, y: 135, velocityY: -280 }];

    const resolution = collisionSystem.resolve({
      playerMissiles,
      alienMissiles: [],
      aliens: baseAliens,
      cannon: baseCannon,
      shields: [],
    });

    expect(resolution.playerMissiles).toHaveLength(0);
    expect(resolution.aliens).toHaveLength(0);
  });

  it('removes alien missile and flags cannon collision', () => {
    const collisionSystem = createCollisionSystem();
    const alienMissiles: MissileState[] = [{ id: 'a1', x: 300, y: 552, velocityY: 220 }];

    const resolution = collisionSystem.resolve({
      playerMissiles: [],
      alienMissiles,
      aliens: baseAliens,
      cannon: baseCannon,
      shields: [],
    });

    expect(resolution.alienMissiles).toHaveLength(0);
    expect(resolution.cannonHit).toBe(true);
  });
});
