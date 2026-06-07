import { describe, expect, it } from 'vitest';
import { createAlienWaveSystem } from './alien-wave-system';

describe('alien-wave-system', () => {
  it('initializes exactly 5x11 aliens using around 70% viewport width', () => {
    const system = createAlienWaveSystem({
      random: () => 0.42,
      fireIntervalMinMs: 10_000,
      fireIntervalMaxMs: 10_000,
    });

    system.update(0, 1000, 600);
    const state = system.getState();

    expect(state.aliens).toHaveLength(55);
    expect(state.waveWidth).toBeCloseTo(700, 1);
  });

  it('advances horizontal pattern, drops on boundaries, and reverses direction', () => {
    const system = createAlienWaveSystem({
      random: () => 0,
      horizontalSpeedPxPerSecond: 100,
      dropDistancePx: 18,
      fireIntervalMinMs: 10_000,
      fireIntervalMaxMs: 10_000,
    });

    system.update(0, 1100, 600);
    const startY = system.getState().aliens[0]?.y ?? 0;

    system.update(1600, 1100, 600);
    const firstDrop = system.getState();

    expect(firstDrop.direction).toBe(-1);
    expect(firstDrop.dropCount).toBe(1);
    expect(firstDrop.stepEvents).toBe(1);
    expect(firstDrop.aliens[0]?.y).toBeCloseTo(startY + 18, 5);

    system.update(3000, 1100, 600);
    const secondDrop = system.getState();

    expect(secondDrop.direction).toBe(1);
    expect(secondDrop.dropCount).toBe(2);
    expect(secondDrop.stepEvents).toBe(2);
    expect(secondDrop.aliens[0]?.y).toBeCloseTo(startY + 36, 5);
  });
});
