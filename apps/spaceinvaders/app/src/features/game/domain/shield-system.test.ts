import { describe, expect, it } from 'vitest';
import { createShieldSystem, SHIELD_COUNT, SHIELD_MAX_DURABILITY } from './shield-system';

describe('shield-system', () => {
  it('creates exactly four shields with durability 10', () => {
    const system = createShieldSystem();
    system.updateLayout(
      1000,
      700,
      { x: 500, y: 640, width: 48, height: 18, reloadDelayMs: 0 },
      [{ id: 'alien-0', x: 100, y: 100, width: 20, height: 14, row: 0, column: 0 }],
    );

    const shields = system.getState();
    expect(shields).toHaveLength(SHIELD_COUNT);
    expect(shields.every((shield) => shield.durability === SHIELD_MAX_DURABILITY)).toBe(true);
  });

  it('does not allow durability below zero', () => {
    const system = createShieldSystem();
    system.updateLayout(
      1000,
      700,
      { x: 500, y: 640, width: 48, height: 18, reloadDelayMs: 0 },
      [{ id: 'alien-0', x: 100, y: 100, width: 20, height: 14, row: 0, column: 0 }],
    );

    for (let index = 0; index < SHIELD_MAX_DURABILITY + 5; index += 1) {
      system.applyShieldImpact('shield-0');
    }

    expect(system.getState()[0]?.durability).toBe(0);
  });
});
