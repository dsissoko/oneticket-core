import { describe, expect, it } from 'vitest';
import { ALIEN_COLUMNS, ALIEN_ROWS } from '@/game/domain/alienWave';
import { GameEngine } from '@/game/engine/GameEngine';

describe('GameEngine slice 1 behavior', () => {
  it('exposes 55 aliens in frame state', () => {
    const engine = new GameEngine(() => 0.5);
    const frame = engine.tick(0, 1000, 700);

    expect(frame.aliens).toHaveLength(ALIEN_ROWS * ALIEN_COLUMNS);
    expect(frame.debug.activeAliens).toBe(ALIEN_ROWS * ALIEN_COLUMNS);
  });

  it('spawns downward enemy missiles from eligible aliens over time', () => {
    const engine = new GameEngine(() => 0);

    engine.tick(0, 1000, 700);

    let frame = engine.tick(100, 1000, 700);
    for (let index = 0; index < 6; index += 1) {
      frame = engine.tick(200 + index * 100, 1000, 700);
    }

    expect(frame.enemyMissiles.length).toBeGreaterThan(0);
    const missile = frame.enemyMissiles[0];

    expect(missile.height).toBeGreaterThan(0);
    expect(missile.width).toBeGreaterThan(0);
    expect(missile.y).toBeGreaterThan(0);
  });
});
