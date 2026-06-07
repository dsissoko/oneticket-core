import { describe, expect, it } from 'vitest';
import { clampReloadDelayMs, createCannonSystem } from './cannon-system';

describe('cannon-system', () => {
  it('clamps reload delay to [0, 5000]', () => {
    expect(clampReloadDelayMs(-80)).toBe(0);
    expect(clampReloadDelayMs(0)).toBe(0);
    expect(clampReloadDelayMs(5100)).toBe(5000);
    expect(clampReloadDelayMs(Number.NaN)).toBe(0);
  });

  it('enforces reload delay between shots while keeping deterministic timing', () => {
    const system = createCannonSystem({ reloadDelayMs: 100 });

    system.update(0, 0, 900, 600, 0, 0);
    system.update(0, 0, 900, 600, 0, 3);
    expect(system.getState().missiles).toHaveLength(1);

    system.update(50, 50, 900, 600, 0, 1);
    expect(system.getState().missiles).toHaveLength(1);

    system.update(60, 110, 900, 600, 0, 1);
    expect(system.getState().missiles).toHaveLength(2);
  });

  it('allows concurrent missiles when reload delay is zero', () => {
    const system = createCannonSystem();
    system.update(0, 0, 900, 600, 0, 4);

    expect(system.getState().missiles).toHaveLength(4);
  });
});
