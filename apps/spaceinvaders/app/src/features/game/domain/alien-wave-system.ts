import type { AlienState, AlienWaveState, MissileState, WaveDirection } from '@/game/types';

const DEFAULT_ROWS = 5;
const DEFAULT_COLUMNS = 11;
const DEFAULT_WAVE_WIDTH_RATIO = 0.7;
const DEFAULT_WAVE_TOP_PADDING = 48;
const DEFAULT_BOUNDARY_PADDING = 16;
const DEFAULT_HORIZONTAL_SPEED = 72;
const DEFAULT_DROP_DISTANCE = 20;
const DEFAULT_FIRE_INTERVAL_MIN_MS = 450;
const DEFAULT_FIRE_INTERVAL_MAX_MS = 1300;
const DEFAULT_MISSILE_SPEED = 180;

export interface AlienWaveSystemConfig {
  rows: number;
  columns: number;
  waveWidthRatio: number;
  waveTopPaddingPx: number;
  boundaryPaddingPx: number;
  horizontalSpeedPxPerSecond: number;
  dropDistancePx: number;
  fireIntervalMinMs: number;
  fireIntervalMaxMs: number;
  missileSpeedPxPerSecond: number;
  random: () => number;
}

export interface AlienWaveSystem {
  update: (deltaMs: number, viewportWidth: number, viewportHeight: number) => void;
  getState: () => AlienWaveState;
  setAliens: (nextAliens: AlienState[]) => void;
  setMissiles: (nextMissiles: MissileState[]) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createInitialAliens(
  rows: number,
  columns: number,
  waveLeft: number,
  waveTop: number,
  waveWidth: number,
): { aliens: AlienState[]; alienWidth: number; alienHeight: number } {
  const gapX = Math.max(8, waveWidth * 0.012);
  const alienWidth = (waveWidth - gapX * (columns - 1)) / columns;
  const alienHeight = Math.max(14, alienWidth * 0.72);
  const gapY = Math.max(8, alienHeight * 0.45);

  const aliens: AlienState[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      aliens.push({
        id: `alien-${row}-${column}`,
        row,
        column,
        x: waveLeft + column * (alienWidth + gapX),
        y: waveTop + row * (alienHeight + gapY),
        width: alienWidth,
        height: alienHeight,
      });
    }
  }

  return { aliens, alienWidth, alienHeight };
}

function randomInterval(config: AlienWaveSystemConfig): number {
  const minValue = Math.min(config.fireIntervalMinMs, config.fireIntervalMaxMs);
  const maxValue = Math.max(config.fireIntervalMinMs, config.fireIntervalMaxMs);
  const value = minValue + config.random() * (maxValue - minValue);
  return Math.max(1, Math.floor(value));
}

export function createAlienWaveSystem(
  partialConfig: Partial<AlienWaveSystemConfig> = {},
): AlienWaveSystem {
  const config: AlienWaveSystemConfig = {
    rows: partialConfig.rows ?? DEFAULT_ROWS,
    columns: partialConfig.columns ?? DEFAULT_COLUMNS,
    waveWidthRatio: partialConfig.waveWidthRatio ?? DEFAULT_WAVE_WIDTH_RATIO,
    waveTopPaddingPx: partialConfig.waveTopPaddingPx ?? DEFAULT_WAVE_TOP_PADDING,
    boundaryPaddingPx: partialConfig.boundaryPaddingPx ?? DEFAULT_BOUNDARY_PADDING,
    horizontalSpeedPxPerSecond:
      partialConfig.horizontalSpeedPxPerSecond ?? DEFAULT_HORIZONTAL_SPEED,
    dropDistancePx: partialConfig.dropDistancePx ?? DEFAULT_DROP_DISTANCE,
    fireIntervalMinMs: partialConfig.fireIntervalMinMs ?? DEFAULT_FIRE_INTERVAL_MIN_MS,
    fireIntervalMaxMs: partialConfig.fireIntervalMaxMs ?? DEFAULT_FIRE_INTERVAL_MAX_MS,
    missileSpeedPxPerSecond: partialConfig.missileSpeedPxPerSecond ?? DEFAULT_MISSILE_SPEED,
    random: partialConfig.random ?? Math.random,
  };

  let initialized = false;
  let waveWidth = 0;
  let waveLeft = 0;
  let direction: WaveDirection = 1;
  let pendingDropOffsetY = 0;
  let stepEvents = 0;
  let dropCount = 0;
  let missiles: MissileState[] = [];
  let nextMissileId = 0;
  let fireTimerMs = randomInterval(config);
  let aliens: AlienState[] = [];

  const ensureInitialized = (viewportWidth: number): void => {
    if (initialized || viewportWidth <= 0) return;
    waveWidth = viewportWidth * config.waveWidthRatio;
    waveLeft = (viewportWidth - waveWidth) / 2;
    const initial = createInitialAliens(
      config.rows,
      config.columns,
      waveLeft,
      config.waveTopPaddingPx,
      waveWidth,
    );
    aliens = initial.aliens;
    initialized = true;
  };

  const spawnMissile = (): void => {
    if (aliens.length === 0) return;
    const shooterIndex = Math.floor(config.random() * aliens.length);
    const shooter = aliens[clamp(shooterIndex, 0, aliens.length - 1)];

    missiles.push({
      id: `alien-missile-${nextMissileId}`,
      x: shooter.x + shooter.width / 2,
      y: shooter.y + shooter.height,
      velocityY: config.missileSpeedPxPerSecond,
    });
    nextMissileId += 1;
  };

  return {
    update: (deltaMs: number, viewportWidth: number, viewportHeight: number) => {
      ensureInitialized(viewportWidth);
      if (!initialized) return;

      const deltaSeconds = Math.max(0, deltaMs) / 1000;
      if (deltaSeconds > 0) {
        const horizontalDelta =
          direction * config.horizontalSpeedPxPerSecond * deltaSeconds;
        aliens = aliens.map((alien) => ({
          ...alien,
          x: alien.x + horizontalDelta,
          y: alien.y + pendingDropOffsetY,
        }));
        pendingDropOffsetY = 0;

        const minX = Math.min(...aliens.map((alien) => alien.x));
        const maxX = Math.max(...aliens.map((alien) => alien.x + alien.width));

        const leftBoundary = config.boundaryPaddingPx;
        const rightBoundary = viewportWidth - config.boundaryPaddingPx;
        const hitLeftBoundary = minX <= leftBoundary;
        const hitRightBoundary = maxX >= rightBoundary;

        if (hitLeftBoundary || hitRightBoundary) {
          const overflow = hitLeftBoundary
            ? leftBoundary - minX
            : maxX - rightBoundary;

          aliens = aliens.map((alien) => ({
            ...alien,
            x: hitLeftBoundary ? alien.x + overflow : alien.x - overflow,
            y: alien.y + config.dropDistancePx,
          }));
          direction = (direction * -1) as WaveDirection;
          dropCount += 1;
          stepEvents += 1;
        }

        fireTimerMs -= deltaMs;
        while (fireTimerMs <= 0) {
          spawnMissile();
          fireTimerMs += randomInterval(config);
        }

        missiles = missiles
          .map((missile) => ({
            ...missile,
            y: missile.y + missile.velocityY * deltaSeconds,
          }))
          .filter((missile) => missile.y <= viewportHeight + 24);
      }
    },
    getState: () => ({
      aliens,
      missiles,
      direction,
      dropCount,
      stepEvents,
      waveWidth,
    }),
    setAliens: (nextAliens) => {
      aliens = nextAliens;
    },
    setMissiles: (nextMissiles) => {
      missiles = nextMissiles;
    },
  };
}
