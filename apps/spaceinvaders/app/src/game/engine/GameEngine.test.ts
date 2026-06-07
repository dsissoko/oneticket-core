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

  it('moves cannon within playfield bounds from input intents', () => {
    const engine = new GameEngine(() => 0.5);

    const initialFrame = engine.tick(0, 1000, 700);
    const moveRightFrame = engine.tick(100, 1000, 700, {
      moveAxis: 1,
      firePressed: false,
      inputSource: 'keyboard',
    });

    expect(moveRightFrame.cannon.x).toBeGreaterThan(initialFrame.cannon.x);

    let frame = moveRightFrame;
    for (let index = 0; index < 80; index += 1) {
      frame = engine.tick(200 + index * 100, 1000, 700, {
        moveAxis: 1,
        firePressed: false,
        inputSource: 'keyboard',
      });
    }

    expect(frame.cannon.x + frame.cannon.width).toBeLessThanOrEqual(frame.playfield.width);
  });

  it('supports multiple active player missiles with no reload delay', () => {
    const engine = new GameEngine(() => 0.5, { playerReloadDelayMs: 0 });

    engine.tick(0, 1000, 700);
    const shot1 = engine.tick(16, 1000, 700, {
      moveAxis: 0,
      firePressed: true,
      inputSource: 'keyboard',
    });
    const shot2 = engine.tick(32, 1000, 700, {
      moveAxis: 0,
      firePressed: true,
      inputSource: 'keyboard',
    });

    expect(shot1.playerMissiles.length).toBe(1);
    expect(shot2.playerMissiles.length).toBe(2);
  });

  it('clamps reload delay and rejects shots during cooldown', () => {
    const engine = new GameEngine(() => 0.5, { playerReloadDelayMs: 999_999 });

    engine.tick(0, 1000, 700);

    const firstShot = engine.tick(16, 1000, 700, {
      moveAxis: 0,
      firePressed: true,
      inputSource: 'keyboard',
    });

    const blockedShot = engine.tick(32, 1000, 700, {
      moveAxis: 0,
      firePressed: true,
      inputSource: 'keyboard',
    });

    expect(firstShot.playerMissiles.length).toBe(1);
    expect(blockedShot.playerMissiles.length).toBe(1);
    expect(blockedShot.debug.rejectedPlayerShots).toBe(1);
  });
});
