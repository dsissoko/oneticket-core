import type { CannonState, MissileState } from '@/game/types';

const MIN_RELOAD_DELAY_MS = 0;
const MAX_RELOAD_DELAY_MS = 5000;
const DEFAULT_MOVE_SPEED = 360;
const DEFAULT_MISSILE_SPEED = 380;
const DEFAULT_CANNON_WIDTH = 48;
const DEFAULT_CANNON_HEIGHT = 18;
const DEFAULT_BOTTOM_PADDING = 24;

export interface CannonSystemConfig {
  reloadDelayMs: number;
  moveSpeedPxPerSecond: number;
  missileSpeedPxPerSecond: number;
  cannonWidthPx: number;
  cannonHeightPx: number;
  cannonBottomPaddingPx: number;
}

export interface CannonSystem {
  update: (
    deltaMs: number,
    timestampMs: number,
    viewportWidth: number,
    viewportHeight: number,
    movementIntent: number,
    fireIntentCount: number,
  ) => void;
  getState: () => { cannon: CannonState | null; missiles: MissileState[] };
}

export function clampReloadDelayMs(reloadDelayMs: number): number {
  if (!Number.isFinite(reloadDelayMs)) {
    return MIN_RELOAD_DELAY_MS;
  }

  return Math.max(
    MIN_RELOAD_DELAY_MS,
    Math.min(MAX_RELOAD_DELAY_MS, Math.floor(reloadDelayMs)),
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createCannonSystem(
  partialConfig: Partial<CannonSystemConfig> = {},
): CannonSystem {
  const reloadDelayMs = clampReloadDelayMs(partialConfig.reloadDelayMs ?? 0);

  const config: CannonSystemConfig = {
    reloadDelayMs,
    moveSpeedPxPerSecond: partialConfig.moveSpeedPxPerSecond ?? DEFAULT_MOVE_SPEED,
    missileSpeedPxPerSecond: partialConfig.missileSpeedPxPerSecond ?? DEFAULT_MISSILE_SPEED,
    cannonWidthPx: partialConfig.cannonWidthPx ?? DEFAULT_CANNON_WIDTH,
    cannonHeightPx: partialConfig.cannonHeightPx ?? DEFAULT_CANNON_HEIGHT,
    cannonBottomPaddingPx:
      partialConfig.cannonBottomPaddingPx ?? DEFAULT_BOTTOM_PADDING,
  };

  let cannonX = 0;
  let cannonY = 0;
  let initialized = false;
  let lastShotAtMs = Number.NEGATIVE_INFINITY;
  let nextMissileId = 0;
  let missiles: MissileState[] = [];

  const initialize = (viewportWidth: number): void => {
    if (initialized) return;
    cannonX = viewportWidth / 2;
    initialized = true;
  };

  return {
    update: (
      deltaMs,
      timestampMs,
      viewportWidth,
      viewportHeight,
      movementIntent,
      fireIntentCount,
    ) => {
      if (viewportWidth <= 0 || viewportHeight <= 0) return;

      initialize(viewportWidth);

      const deltaSeconds = Math.max(0, deltaMs) / 1000;
      cannonX += movementIntent * config.moveSpeedPxPerSecond * deltaSeconds;
      const halfWidth = config.cannonWidthPx / 2;
      cannonX = clamp(cannonX, halfWidth, viewportWidth - halfWidth);

      cannonY =
        viewportHeight - config.cannonBottomPaddingPx - config.cannonHeightPx / 2;

      const safeFireCount = Math.max(0, Math.floor(fireIntentCount));
      for (let index = 0; index < safeFireCount; index += 1) {
        const cooldownMs = timestampMs - lastShotAtMs;
        if (cooldownMs < config.reloadDelayMs) {
          continue;
        }

        missiles.push({
          id: `player-missile-${nextMissileId}`,
          x: cannonX,
          y: cannonY - config.cannonHeightPx / 2,
          velocityY: -config.missileSpeedPxPerSecond,
        });
        nextMissileId += 1;
        lastShotAtMs = timestampMs;
      }

      missiles = missiles
        .map((missile) => ({
          ...missile,
          y: missile.y + missile.velocityY * deltaSeconds,
        }))
        .filter((missile) => missile.y >= -24);
    },
    getState: () => {
      if (!initialized) {
        return { cannon: null, missiles };
      }

      return {
        cannon: {
          x: cannonX,
          y: cannonY,
          width: config.cannonWidthPx,
          height: config.cannonHeightPx,
          reloadDelayMs: config.reloadDelayMs,
        },
        missiles,
      };
    },
  };
}
