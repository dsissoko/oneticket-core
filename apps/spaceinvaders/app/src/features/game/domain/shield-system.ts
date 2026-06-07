import type { AlienState, CannonState, ShieldState } from '@/game/types';

const SHIELD_COUNT = 4;
const SHIELD_MAX_DURABILITY = 10;
const SHIELD_WIDTH_RATIO = 0.12;
const SHIELD_HEIGHT_RATIO = 0.045;
const SHIELD_MIN_WIDTH = 52;
const SHIELD_MIN_HEIGHT = 18;

export interface ShieldSystem {
  updateLayout: (
    viewportWidth: number,
    viewportHeight: number,
    cannon: CannonState | null,
    aliens: AlienState[],
  ) => void;
  getState: () => ShieldState[];
  applyShieldImpact: (shieldId: string) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createInitialState(): ShieldState[] {
  return Array.from({ length: SHIELD_COUNT }, (_, index) => ({
    id: `shield-${index}`,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    durability: SHIELD_MAX_DURABILITY,
    maxDurability: SHIELD_MAX_DURABILITY,
  }));
}

export function createShieldSystem(): ShieldSystem {
  let shields = createInitialState();

  return {
    updateLayout: (viewportWidth, viewportHeight, cannon, aliens) => {
      if (viewportWidth <= 0 || viewportHeight <= 0 || !cannon) return;

      const shieldWidth = Math.max(
        SHIELD_MIN_WIDTH,
        Math.floor(viewportWidth * SHIELD_WIDTH_RATIO),
      );
      const shieldHeight = Math.max(
        SHIELD_MIN_HEIGHT,
        Math.floor(viewportHeight * SHIELD_HEIGHT_RATIO),
      );

      const topAlienY = aliens.length
        ? Math.max(...aliens.map((alien) => alien.y + alien.height))
        : viewportHeight * 0.2;
      const cannonTopY = cannon.y - cannon.height / 2;
      const centerY = clamp(
        topAlienY + (cannonTopY - topAlienY) * 0.6,
        topAlienY + shieldHeight,
        cannonTopY - shieldHeight,
      );

      const segmentWidth = viewportWidth / SHIELD_COUNT;
      shields = shields.map((shield, index) => ({
        ...shield,
        x: segmentWidth * (index + 0.5),
        y: centerY,
        width: shieldWidth,
        height: shieldHeight,
      }));
    },
    getState: () => shields,
    applyShieldImpact: (shieldId) => {
      shields = shields.map((shield) => {
        if (shield.id !== shieldId) return shield;
        return {
          ...shield,
          durability: Math.max(0, shield.durability - 1),
        };
      });
    },
  };
}

export { SHIELD_COUNT, SHIELD_MAX_DURABILITY };
