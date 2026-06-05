/**
 * Game type definitions and interfaces
 */

import type { Enemy as EnemyClass } from './entities/Enemy'
import type { Formation as FormationClass } from './entities/Formation'
import type { MysteryShipSpawner as MysteryShipSpawnerClass } from './entities/MysteryShip'

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

// Re-export Enemy and Formation as types for compatibility
export type Enemy = EnemyClass
export type Formation = FormationClass
export type MysteryShipSpawner = MysteryShipSpawnerClass

export interface Player extends BoundingBox {
  invincible: boolean
  invincibilityTimer: number
  bulletInFlight: PlayerBullet | null
  takeDamage(): void
  fire(): PlayerBullet | null
  getBoundingBox(): BoundingBox
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
  active: boolean
  update(deltaTime: number): void
  isOutOfBounds(canvasHeight: number): boolean
  getBoundingBox(): BoundingBox
}

export type Bullet = PlayerBullet | EnemyBullet

export interface Segment extends BoundingBox {
  gridX: number
  gridY: number
  alive: boolean
  hitCount: number
  opacity: number
  takeDamage(): void
}

export interface Shield extends BoundingBox {
  segments: Segment[][]
  reset(): void
  damageSegment(gridX: number, gridY: number): boolean
  isDestroyed(): boolean
  getVisibleSegments(): Segment[]
  getBoundingBox(): BoundingBox
}

export interface MysteryShip extends BoundingBox {
  vx: number
  active: boolean
  pointValue: number
  alive: boolean
  spawnTime: number
  update(deltaTime: number, canvasWidth: number): boolean
  getBoundingBox(): BoundingBox
  getPointValue(): number
}

export interface CollisionResponse {
  pointsAwarded: number
  entitiesToDestroy: any[]
  playerDamage: boolean
  playerInvincibility: boolean
  gameOverTriggered: boolean
  shieldDamageData?: {
    shieldIndex: number
    segmentGridX: number
    segmentGridY: number
  }
}

export interface CollisionEvent {
  type:
    | 'bullet-enemy'
    | 'bullet-mystery'
    | 'bullet-shield'
    | 'enemy-bullet-player'
    | 'formation-shield'
    | 'formation-player'
  entities: any[]
  response: CollisionResponse
}

export interface GameLoopState {
  formation: Formation | null
  player: Player | null
  bullets: Bullet[]
  shields: Shield[]
  mysteryShip: MysteryShip | null
  mysteryShipSpawner: MysteryShipSpawner | null
  inputState: PlayerInputState
  score: number
  lives: number
  waveNumber: number
  gameState: GameState
  deltaTime: number
  lastFrameTime: number
}
