/**
 * Entity classes for game objects
 */

import type {
  Enemy,
  Formation,
  Player,
  PlayerBullet,
  Shield,
  Segment,
  MysteryShip,
  PlayerInputState
} from './types'
import { ShieldImpl } from './Shield'

// Re-export ShieldImpl for backward compatibility
export { ShieldImpl } from './Shield'

/**
 * Formation class - represents the grid of enemies
 */
export class FormationImpl implements Formation {
  x: number
  y: number
  directionX: -1 | 1 = 1
  speed: number = 30 // pixels per second
  enemies: Enemy[] = []

  constructor(canvasWidth: number) {
    // Initialize formation at top-center
    this.x = canvasWidth / 2 - 100
    this.y = 50

    // Create a simple stub formation
    // In later slices, this will be a full 11×5 grid
    for (let i = 0; i < 5; i++) {
      this.enemies.push({
        x: this.x + i * 30,
        y: this.y,
        width: 20,
        height: 15,
        alive: true
      })
    }
  }

  /**
   * Update formation position (stub)
   */
  update(deltaTime: number, waveNumber: number): void {
    // Stub implementation - will be expanded in later slices
    // Would move enemies horizontally and drop down on bounce
    this.x += this.directionX * this.speed * (deltaTime / 1000)
  }
}

/**
 * Player class - represents the player's ship
 */
export class PlayerImpl implements Player {
  x: number
  y: number
  width: number = 20
  height: number = 20
  invincible: boolean = false
  invincibilityTimer: number = 0
  bulletInFlight: PlayerBullet | null = null

  constructor(canvasWidth: number, canvasHeight: number) {
    // Start at bottom-center
    this.x = canvasWidth / 2 - this.width / 2
    this.y = canvasHeight - 50
  }

  /**
   * Update player position based on input
   */
  update(deltaTime: number, inputState: PlayerInputState): void {
    const speed = 200 // pixels per second

    // Move left
    if (inputState.left) {
      this.x -= speed * (deltaTime / 1000)
    }

    // Move right
    if (inputState.right) {
      this.x += speed * (deltaTime / 1000)
    }

    // Update invincibility timer
    if (this.invincible) {
      this.invincibilityTimer -= deltaTime
      if (this.invincibilityTimer <= 0) {
        this.invincible = false
        this.invincibilityTimer = 0
      }
    }

    // Clamp to screen bounds
    this.x = Math.max(0, Math.min(this.x, 800 - this.width))
  }

  /**
   * Fire a bullet
   */
  fire(): PlayerBullet | null {
    if (this.bulletInFlight) {
      return null // Only one bullet at a time
    }

    const bullet: PlayerBullet = {
      x: this.x + this.width / 2 - 2,
      y: this.y - 10,
      width: 4,
      height: 10,
      vx: 0,
      vy: -300, // pixels per second, moving upward
      type: 'player'
    }

    this.bulletInFlight = bullet
    return bullet
  }

  /**
   * Move in a direction
   */
  move(direction: -1 | 0 | 1, deltaTime: number): void {
    const speed = 200 // pixels per second
    this.x += direction * speed * (deltaTime / 1000)
    this.x = Math.max(0, Math.min(this.x, 800 - this.width))
  }
}

/**
 * PlayerBullet class
 */
export class PlayerBulletImpl implements PlayerBullet {
  x: number
  y: number
  width: number = 4
  height: number = 10
  vx: number = 0
  vy: number = -300
  type: 'player' = 'player'

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  /**
   * Update bullet position
   */
  update(deltaTime: number): void {
    this.y += this.vy * (deltaTime / 1000)
  }

  /**
   * Check if bullet is off-screen
   */
  isOffScreen(canvasHeight: number): boolean {
    return this.y < 0 || this.y > canvasHeight
  }
}

// Shield is now exported from Shield.ts

/**
 * MysteryShip class
 */
export class MysteryShipImpl implements MysteryShip {
  x: number
  y: number
  width: number = 30
  height: number = 15
  vx: number = 100 // pixels per second
  active: boolean = false

  constructor() {
    this.x = 0
    this.y = 50
  }

  /**
   * Activate the mystery ship
   */
  activate(): void {
    this.active = true
  }

  /**
   * Deactivate the mystery ship
   */
  deactivate(): void {
    this.active = false
  }

  /**
   * Update position
   */
  update(deltaTime: number, canvasWidth: number): void {
    if (!this.active) return

    this.x += this.vx * (deltaTime / 1000)

    // Deactivate if off-screen
    if (this.x > canvasWidth) {
      this.deactivate()
    }
  }
}
