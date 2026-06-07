import { describe, expect, it } from 'vitest';
import {
  advanceAlienWave,
  ALIEN_COLUMNS,
  ALIEN_ROWS,
  createAlienWave,
  getEligibleFireAliens,
  getWaveBounds,
} from '@/game/domain/alienWave';

describe('alienWave domain', () => {
  it('creates a 5x11 wave with around 70% playfield width', () => {
    const wave = createAlienWave(1000, 700);
    const bounds = getWaveBounds(wave.aliens);
    const widthRatio = bounds.width / 1000;

    expect(wave.aliens).toHaveLength(ALIEN_ROWS * ALIEN_COLUMNS);
    expect(widthRatio).toBeGreaterThan(0.68);
    expect(widthRatio).toBeLessThan(0.72);
  });

  it('drops and inverts direction at horizontal boundaries', () => {
    const wave = createAlienWave(1000, 700);
    const initialBounds = getWaveBounds(wave.aliens);

    const alignedToLeft = {
      ...wave,
      direction: -1 as const,
      aliens: wave.aliens.map((alien) => ({
        ...alien,
        x: alien.x - initialBounds.left + 2,
      })),
    };

    const dropped = advanceAlienWave(alignedToLeft, 0.5, 1000);
    const droppedBounds = getWaveBounds(dropped.aliens);
    const alignedBounds = getWaveBounds(alignedToLeft.aliens);

    expect(dropped.direction).toBe(1);
    expect(droppedBounds.top - alignedBounds.top).toBeCloseTo(wave.dropDistance, 6);

    const movedRight = advanceAlienWave(dropped, 0.25, 1000);
    const movedBounds = getWaveBounds(movedRight.aliens);

    expect(movedBounds.left).toBeGreaterThan(droppedBounds.left);
  });

  it('only allows bottom-most living alien per column to shoot', () => {
    const wave = createAlienWave(900, 700);

    const modifiedAliens = wave.aliens.map((alien) => {
      if (alien.column === 0 && alien.row === ALIEN_ROWS - 1) {
        return { ...alien, isAlive: false };
      }

      return alien;
    });

    const eligible = getEligibleFireAliens(modifiedAliens);

    expect(eligible).toHaveLength(ALIEN_COLUMNS);
    const columnZero = eligible.find((alien) => alien.column === 0);
    expect(columnZero?.row).toBe(ALIEN_ROWS - 2);
  });
});
