/**
 * Game type definitions and interfaces
 */

import type { Enemy as EnemyClass } from './entities/Enemy'
import type { Formation as FormationClass } from './entities/Formation'

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
  gridX: number
  gridY: number
  alive: boolean
  hitCount: number
  opacity: number
}

export interface Shield {
  x: number
  y: number
  width: number
  height: number
  segments: Segment[][]
  reset(): void
  damageSegment(gridX: number, gridY: number): boolean
  isDestroyed(): boolean
  getVisibleSegments(): Segment[]
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
