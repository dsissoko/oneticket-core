import { describe, expect, it } from 'vitest';
import {
  SHIELD_COUNT,
  SHIELD_MAX_DURABILITY,
  createShields,
  resolveMissileShieldCollisions,
} from '@/game/domain/shields';

type MissileFixture = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

describe('shields domain', () => {
  it('creates exactly 4 shields with full durability', () => {
    const shields = createShields(1000, 700);

    expect(shields).toHaveLength(SHIELD_COUNT);
    expect(shields.every((shield) => shield.durability === SHIELD_MAX_DURABILITY)).toBe(true);
  });

  it('destroys both player and enemy missiles on collision and decrements durability', () => {
    const shields = createShields(1000, 700);
    const targetShield = shields[0];

    const playerMissiles: MissileFixture[] = [
      {
        id: 'player-hit',
        x: targetShield.x + 2,
        y: targetShield.y + 2,
        width: 4,
        height: 10,
      },
    ];

    const enemyMissiles: MissileFixture[] = [
      {
        id: 'enemy-hit',
        x: targetShield.x + 4,
        y: targetShield.y + 4,
        width: 4,
        height: 10,
      },
    ];

    const result = resolveMissileShieldCollisions(playerMissiles, enemyMissiles, shields);

    expect(result.playerMissiles).toHaveLength(0);
    expect(result.enemyMissiles).toHaveLength(0);
    expect(result.shields[0].durability).toBe(SHIELD_MAX_DURABILITY - 2);
    expect(result.shields[0].damageStage).toBe(1);
    expect(result.durabilityTransitions).toHaveLength(2);
  });

  it('never reduces durability below zero', () => {
    const shields = createShields(1000, 700);
    const targetShield = shields[0];

    const hits: MissileFixture[] = Array.from({ length: SHIELD_MAX_DURABILITY + 5 }, (_, index) => ({
      id: `missile-${index}`,
      x: targetShield.x + 2,
      y: targetShield.y + 2,
      width: 4,
      height: 10,
    }));

    const result = resolveMissileShieldCollisions(hits, [], shields);

    expect(result.shields[0].durability).toBe(0);
    expect(result.shields[0].damageStage).toBe(4);
    expect(result.playerMissiles.length).toBe(5);
  });

  it('resolves collisions deterministically in missile order', () => {
    const shields = createShields(1000, 700);

    const firstShield = shields[0];
    const secondShield = shields[1];
    const missiles: MissileFixture[] = [
      {
        id: 'hit-second',
        x: secondShield.x + 2,
        y: secondShield.y + 2,
        width: 4,
        height: 10,
      },
      {
        id: 'hit-first',
        x: firstShield.x + 2,
        y: firstShield.y + 2,
        width: 4,
        height: 10,
      },
    ];

    const result = resolveMissileShieldCollisions(missiles, [], shields);

    expect(result.durabilityTransitions.map((transition) => transition.shieldId)).toEqual([
      secondShield.id,
      firstShield.id,
    ]);
  });
});
