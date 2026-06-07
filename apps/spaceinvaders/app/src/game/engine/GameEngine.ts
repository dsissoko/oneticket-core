import {
  advanceAlienWave,
  createAlienWave,
  getEligibleFireAliens,
  type Alien,
  type AlienWaveState,
} from '@/game/domain/alienWave';
import {
  createShields,
  resolveMissileShieldCollisions,
  type Shield,
} from '@/game/domain/shields';
import { NO_INPUT_INTENTS, type GameInputIntents, type InputSource } from '@/game/input/InputController';

type EnemyMissile = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
};

type PlayerMissile = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
};

type Cannon = {
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
  cannon: Cannon;
  shields: Shield[];
  playerMissiles: PlayerMissile[];
  enemyMissiles: EnemyMissile[];
  debug: {
    activeAliens: number;
    playerMissiles: number;
    enemyMissiles: number;
    rejectedPlayerShots: number;
    lastInputSource: InputSource;
  };
};

type EngineState = {
  wave: AlienWaveState;
  cannon: Cannon;
  shields: Shield[];
  playerMissiles: PlayerMissile[];
  playerReloadRemainingMs: number;
  rejectedPlayerShots: number;
  lastInputSource: InputSource;
  enemyMissiles: EnemyMissile[];
  enemyFireCooldownSeconds: number;
};

type GameEngineOptions = {
  playerReloadDelayMs?: number;
};

const MIN_FIRE_COOLDOWN_SECONDS = 0.45;
const MAX_FIRE_COOLDOWN_SECONDS = 1.35;
const MAX_DELTA_SECONDS = 0.1;
const MIN_PLAYER_RELOAD_DELAY_MS = 0;
const MAX_PLAYER_RELOAD_DELAY_MS = 5000;

export class GameEngine {
  private readonly random: () => number;

  private readonly playerReloadDelayMs: number;

  private state: EngineState | null = null;

  private previousTimestamp: number | null = null;

  private playfield = { width: 1, height: 1 };

  constructor(random: () => number = Math.random, options?: GameEngineOptions) {
    this.random = random;
    this.playerReloadDelayMs = this.clampPlayerReloadDelay(options?.playerReloadDelayMs ?? 0);
  }

  public tick(
    timestamp: number,
    width: number,
    height: number,
    input: GameInputIntents = NO_INPUT_INTENTS,
  ): GameFrameState {
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
    const nextCannon = this.moveCannon(this.state.cannon, input.moveAxis, dtSeconds, safeWidth);

    const nextReloadRemainingMs = Math.max(
      0,
      this.state.playerReloadRemainingMs - dtSeconds * 1000,
    );

    const playerFireResult = this.trySpawnPlayerMissile(
      nextCannon,
      this.state.playerMissiles,
      nextReloadRemainingMs,
      safeHeight,
      input.firePressed,
      this.state.rejectedPlayerShots,
    );

    const movedPlayerMissiles = playerFireResult.playerMissiles
      .map((missile) => ({
        ...missile,
        y: missile.y - missile.speed * dtSeconds,
      }))
      .filter((missile) => missile.y + missile.height >= 0);

    const nextCooldown = this.state.enemyFireCooldownSeconds - dtSeconds;
    const spawnResult = this.trySpawnEnemyMissile(nextWave.aliens, nextCooldown, safeHeight);
    const movedMissiles = spawnResult.enemyMissiles
      .map((missile) => ({
        ...missile,
        y: missile.y + missile.speed * dtSeconds,
      }))
      .filter((missile) => missile.y - missile.height <= safeHeight);

    const collisionResult = resolveMissileShieldCollisions(
      movedPlayerMissiles,
      movedMissiles,
      this.state.shields,
    );

    if (collisionResult.durabilityTransitions.length > 0 && import.meta.env.DEV) {
      for (const transition of collisionResult.durabilityTransitions) {
        console.debug(
          `[SpaceInvaders] Shield ${transition.shieldId} durability ${transition.fromDurability} -> ${transition.toDurability}`,
        );
      }
    }

    this.state = {
      wave: nextWave,
      cannon: nextCannon,
      shields: collisionResult.shields,
      playerMissiles: collisionResult.playerMissiles,
      playerReloadRemainingMs: playerFireResult.playerReloadRemainingMs,
      rejectedPlayerShots: playerFireResult.rejectedPlayerShots,
      lastInputSource: input.inputSource,
      enemyMissiles: collisionResult.enemyMissiles,
      enemyFireCooldownSeconds: spawnResult.enemyFireCooldownSeconds,
    };

    return this.toFrameState(this.state, this.playfield);
  }

  private createInitialState(width: number, height: number): EngineState {
    const cannon = this.createCannon(width, height);

    return {
      wave: createAlienWave(width, height),
      cannon,
      shields: createShields(width, height),
      playerMissiles: [],
      playerReloadRemainingMs: 0,
      rejectedPlayerShots: 0,
      lastInputSource: 'none',
      enemyMissiles: [],
      enemyFireCooldownSeconds: this.getRandomFireCooldownSeconds(),
    };
  }

  private createCannon(width: number, height: number): Cannon {
    const cannonWidth = Math.max(20, width * 0.055);
    const cannonHeight = Math.max(12, height * 0.035);
    const bottomMargin = Math.max(8, height * 0.035);

    return {
      x: width / 2 - cannonWidth / 2,
      y: Math.max(0, height - cannonHeight - bottomMargin),
      width: cannonWidth,
      height: cannonHeight,
      speed: Math.max(140, width * 0.55),
    };
  }

  private moveCannon(cannon: Cannon, moveAxis: number, dtSeconds: number, playfieldWidth: number): Cannon {
    const clampedAxis = Math.min(1, Math.max(-1, moveAxis));
    const nextX = cannon.x + clampedAxis * cannon.speed * dtSeconds;

    return {
      ...cannon,
      x: Math.min(playfieldWidth - cannon.width, Math.max(0, nextX)),
    };
  }

  private trySpawnPlayerMissile(
    cannon: Cannon,
    playerMissiles: PlayerMissile[],
    playerReloadRemainingMs: number,
    playfieldHeight: number,
    firePressed: boolean,
    rejectedPlayerShots: number,
  ): Pick<
    EngineState,
    'playerMissiles' | 'playerReloadRemainingMs' | 'rejectedPlayerShots'
  > {
    if (!firePressed) {
      return {
        playerMissiles,
        playerReloadRemainingMs,
        rejectedPlayerShots,
      };
    }

    if (playerReloadRemainingMs > 0) {
      return {
        playerMissiles,
        playerReloadRemainingMs,
        rejectedPlayerShots: rejectedPlayerShots + 1,
      };
    }

    const missileHeight = Math.max(10, playfieldHeight * 0.025);
    const missileWidth = Math.max(2, missileHeight * 0.22);
    const missile: PlayerMissile = {
      id: `player-missile-${Date.now()}-${Math.floor(this.random() * 100_000)}`,
      x: cannon.x + cannon.width / 2 - missileWidth / 2,
      y: cannon.y - missileHeight,
      width: missileWidth,
      height: missileHeight,
      speed: Math.max(180, playfieldHeight * 0.65),
    };

    return {
      playerMissiles: [...playerMissiles, missile],
      playerReloadRemainingMs: this.playerReloadDelayMs,
      rejectedPlayerShots,
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

  private clampPlayerReloadDelay(value: number): number {
    if (!Number.isFinite(value)) {
      return MIN_PLAYER_RELOAD_DELAY_MS;
    }

    return Math.min(MAX_PLAYER_RELOAD_DELAY_MS, Math.max(MIN_PLAYER_RELOAD_DELAY_MS, Math.round(value)));
  }

  private toFrameState(state: EngineState, playfield: { width: number; height: number }): GameFrameState {
    const activeAliens = state.wave.aliens.filter((alien) => alien.isAlive).length;

    return {
      playfield,
      aliens: state.wave.aliens,
      cannon: state.cannon,
      shields: state.shields,
      playerMissiles: state.playerMissiles,
      enemyMissiles: state.enemyMissiles,
      debug: {
        activeAliens,
        playerMissiles: state.playerMissiles.length,
        enemyMissiles: state.enemyMissiles.length,
        rejectedPlayerShots: state.rejectedPlayerShots,
        lastInputSource: state.lastInputSource,
      },
    };
  }
}
