/**
 * Game type definitions and interfaces
 */

export type GameState = 'Start' | 'Playing' | 'Victory' | 'GameOver'

export interface PlayerInputState {
  left: boolean
  right: boolean
  fire: boolean
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface Enemy extends BoundingBox {
  alive: boolean
}

export interface Player extends BoundingBox {
  invincible: boolean
  invincibilityTimer: number
  bulletInFlight: PlayerBullet | null
}

export interface PlayerBullet extends BoundingBox {
  vx: number
  vy: number
  type: 'player'
  update(deltaTime: number): void
  isOffScreen(canvasHeight: number): boolean
  getBoundingBox(): BoundingBox
}

export interface EnemyBullet extends BoundingBox {
  vx: number
  vy: number
  type: 'enemy'
}

export type Bullet = PlayerBullet | EnemyBullet

export interface Segment extends BoundingBox {
  alive: boolean
}

export interface Shield {
  x: number
  y: number
  segments: Segment[]
  reset(): void
  damageSegment(index: number): void
  isDestroyed(): boolean
}

export interface Formation {
  x: number
  y: number
  directionX: -1 | 1
  speed: number
  enemies: Enemy[]
  update(deltaTime: number, waveNumber: number): void
}

export interface MysteryShip extends BoundingBox {
  vx: number
  active: boolean
}

export interface GameLoopState {
  formation: Formation | null
  player: Player | null
  bullets: Bullet[]
  shields: Shield[]
  mysteryShip: MysteryShip | null
  inputState: PlayerInputState
  score: number
  lives: number
  waveNumber: number
  gameState: GameState
  deltaTime: number
  lastFrameTime: number
}
