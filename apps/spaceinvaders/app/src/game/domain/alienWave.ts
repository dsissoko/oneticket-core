export const ALIEN_ROWS = 5;
export const ALIEN_COLUMNS = 11;
const WAVE_WIDTH_RATIO = 0.7;
const HORIZONTAL_GAP_RATIO = 0.35;
const VERTICAL_GAP_RATIO = 0.6;

export type WaveDirection = -1 | 1;

export type Alien = {
  id: string;
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isAlive: boolean;
};

export type AlienWaveState = {
  aliens: Alien[];
  direction: WaveDirection;
  horizontalSpeed: number;
  dropDistance: number;
};

export type WaveBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

export function createAlienWave(playfieldWidth: number, playfieldHeight: number): AlienWaveState {
  const safeWidth = Math.max(1, playfieldWidth);
  const safeHeight = Math.max(1, playfieldHeight);

  const waveTargetWidth = safeWidth * WAVE_WIDTH_RATIO;
  const horizontalUnits = ALIEN_COLUMNS + (ALIEN_COLUMNS - 1) * HORIZONTAL_GAP_RATIO;
  const alienWidth = waveTargetWidth / horizontalUnits;
  const horizontalGap = alienWidth * HORIZONTAL_GAP_RATIO;
  const alienHeight = alienWidth * 0.65;
  const verticalGap = alienHeight * VERTICAL_GAP_RATIO;
  const startX = (safeWidth - waveTargetWidth) / 2;
  const startY = Math.max(20, safeHeight * 0.12);

  const aliens: Alien[] = [];
  for (let row = 0; row < ALIEN_ROWS; row += 1) {
    for (let column = 0; column < ALIEN_COLUMNS; column += 1) {
      aliens.push({
        id: `alien-${row}-${column}`,
        row,
        column,
        x: startX + column * (alienWidth + horizontalGap),
        y: startY + row * (alienHeight + verticalGap),
        width: alienWidth,
        height: alienHeight,
        isAlive: true,
      });
    }
  }

  return {
    aliens,
    direction: -1,
    horizontalSpeed: Math.max(30, safeWidth * 0.08),
    dropDistance: Math.max(12, alienHeight * 1.2),
  };
}

export function getWaveBounds(aliens: Alien[]): WaveBounds {
  const aliveAliens = aliens.filter((alien) => alien.isAlive);
  const source = aliveAliens.length > 0 ? aliveAliens : aliens;

  if (source.length === 0) {
    return {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: 0,
      height: 0,
    };
  }

  const left = Math.min(...source.map((alien) => alien.x));
  const right = Math.max(...source.map((alien) => alien.x + alien.width));
  const top = Math.min(...source.map((alien) => alien.y));
  const bottom = Math.max(...source.map((alien) => alien.y + alien.height));

  return {
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

export function advanceAlienWave(
  state: AlienWaveState,
  deltaSeconds: number,
  playfieldWidth: number,
): AlienWaveState {
  const dt = Math.max(0, deltaSeconds);
  if (dt === 0) {
    return state;
  }

  const aliveAliens = state.aliens.filter((alien) => alien.isAlive);
  if (aliveAliens.length === 0) {
    return state;
  }

  const horizontalDelta = state.direction * state.horizontalSpeed * dt;
  const bounds = getWaveBounds(aliveAliens);
  const safePlayfieldWidth = Math.max(1, playfieldWidth);
  const wouldHitBoundary =
    state.direction > 0
      ? bounds.right + horizontalDelta >= safePlayfieldWidth
      : bounds.left + horizontalDelta <= 0;

  if (wouldHitBoundary) {
    return {
      ...state,
      direction: (state.direction * -1) as WaveDirection,
      aliens: state.aliens.map((alien) => ({
        ...alien,
        y: alien.y + state.dropDistance,
      })),
    };
  }

  return {
    ...state,
    aliens: state.aliens.map((alien) => ({
      ...alien,
      x: alien.x + horizontalDelta,
    })),
  };
}

export function getEligibleFireAliens(aliens: Alien[]): Alien[] {
  const byColumn = new Map<number, Alien>();

  for (const alien of aliens) {
    if (!alien.isAlive) {
      continue;
    }

    const current = byColumn.get(alien.column);
    if (!current || alien.row > current.row) {
      byColumn.set(alien.column, alien);
    }
  }

  return Array.from(byColumn.values());
}
