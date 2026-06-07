import {
  advanceAlienWave,
  createAlienWave,
  getEligibleFireAliens,
  type Alien,
  type AlienWaveState,
} from '@/game/domain/alienWave';

type EnemyMissile = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
};

export type GameFrameState = {
  playfield: {
    width: number;
    height: number;
  };
  aliens: Alien[];
  enemyMissiles: EnemyMissile[];
  debug: {
    activeAliens: number;
    enemyMissiles: number;
  };
};

type EngineState = {
  wave: AlienWaveState;
  enemyMissiles: EnemyMissile[];
  enemyFireCooldownSeconds: number;
};

const MIN_FIRE_COOLDOWN_SECONDS = 0.45;
const MAX_FIRE_COOLDOWN_SECONDS = 1.35;
const MAX_DELTA_SECONDS = 0.1;

export class GameEngine {
  private readonly random: () => number;

  private state: EngineState | null = null;

  private previousTimestamp: number | null = null;

  private playfield = { width: 1, height: 1 };

  constructor(random: () => number = Math.random) {
    this.random = random;
  }

  public tick(timestamp: number, width: number, height: number): GameFrameState {
    const safeWidth = Math.max(1, Math.floor(width));
    const safeHeight = Math.max(1, Math.floor(height));

    if (!this.state || safeWidth !== this.playfield.width || safeHeight !== this.playfield.height) {
      this.playfield = { width: safeWidth, height: safeHeight };
      this.state = this.createInitialState(safeWidth, safeHeight);
      this.previousTimestamp = timestamp;

      return this.toFrameState(this.state, this.playfield);
    }

    const dtSeconds =
      this.previousTimestamp === null
        ? 0
        : Math.min(MAX_DELTA_SECONDS, Math.max(0, (timestamp - this.previousTimestamp) / 1000));
    this.previousTimestamp = timestamp;

    const nextWave = advanceAlienWave(this.state.wave, dtSeconds, safeWidth);
    const nextCooldown = this.state.enemyFireCooldownSeconds - dtSeconds;
    const spawnResult = this.trySpawnEnemyMissile(nextWave.aliens, nextCooldown, safeHeight);
    const movedMissiles = spawnResult.enemyMissiles
      .map((missile) => ({
        ...missile,
        y: missile.y + missile.speed * dtSeconds,
      }))
      .filter((missile) => missile.y - missile.height <= safeHeight);

    this.state = {
      wave: nextWave,
      enemyMissiles: movedMissiles,
      enemyFireCooldownSeconds: spawnResult.enemyFireCooldownSeconds,
    };

    return this.toFrameState(this.state, this.playfield);
  }

  private createInitialState(width: number, height: number): EngineState {
    return {
      wave: createAlienWave(width, height),
      enemyMissiles: [],
      enemyFireCooldownSeconds: this.getRandomFireCooldownSeconds(),
    };
  }

  private trySpawnEnemyMissile(
    aliens: Alien[],
    cooldownSeconds: number,
    playfieldHeight: number,
  ): Pick<EngineState, 'enemyMissiles' | 'enemyFireCooldownSeconds'> {
    if (!this.state) {
      return {
        enemyMissiles: [],
        enemyFireCooldownSeconds: this.getRandomFireCooldownSeconds(),
      };
    }

    if (cooldownSeconds > 0) {
      return {
        enemyMissiles: this.state.enemyMissiles,
        enemyFireCooldownSeconds: cooldownSeconds,
      };
    }

    const eligibleAliens = getEligibleFireAliens(aliens);
    if (eligibleAliens.length === 0) {
      return {
        enemyMissiles: this.state.enemyMissiles,
        enemyFireCooldownSeconds: this.getRandomFireCooldownSeconds(),
      };
    }

    const selectedIndex = Math.floor(this.random() * eligibleAliens.length);
    const shooter = eligibleAliens[Math.min(eligibleAliens.length - 1, Math.max(0, selectedIndex))];

    const missileHeight = Math.max(8, playfieldHeight * 0.02);
    const missileWidth = Math.max(2, missileHeight * 0.22);
    const missile: EnemyMissile = {
      id: `enemy-missile-${Date.now()}-${Math.floor(this.random() * 100_000)}`,
      x: shooter.x + shooter.width / 2 - missileWidth / 2,
      y: shooter.y + shooter.height,
      width: missileWidth,
      height: missileHeight,
      speed: Math.max(100, playfieldHeight * 0.3),
    };

    return {
      enemyMissiles: [...this.state.enemyMissiles, missile],
      enemyFireCooldownSeconds: this.getRandomFireCooldownSeconds(),
    };
  }

  private getRandomFireCooldownSeconds(): number {
    return MIN_FIRE_COOLDOWN_SECONDS + this.random() * (MAX_FIRE_COOLDOWN_SECONDS - MIN_FIRE_COOLDOWN_SECONDS);
  }

  private toFrameState(state: EngineState, playfield: { width: number; height: number }): GameFrameState {
    const activeAliens = state.wave.aliens.filter((alien) => alien.isAlive).length;

    return {
      playfield,
      aliens: state.wave.aliens,
      enemyMissiles: state.enemyMissiles,
      debug: {
        activeAliens,
        enemyMissiles: state.enemyMissiles.length,
      },
    };
  }
}
