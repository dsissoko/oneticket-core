/**
 * Entity classes for game objects
 */

import type {
  Player,
  PlayerBullet,
  Shield,
  Segment,
  MysteryShip,
  PlayerInputState,
  BoundingBox
} from './types'
import { Formation as FormationImpl } from './entities/Formation'
import { ShieldImpl } from './Shield'

// Re-export for backward compatibility
export { Formation as FormationImpl } from './entities/Formation'
export { Enemy } from './entities/Enemy'
export { ShieldImpl } from './Shield'

/**
 * Player class - represents the player's ship
 */
export class PlayerImpl implements Player {
  x: number
  y: number
  width: number = 25
  height: number = 25
  invincible: boolean = false
  invincibilityTimer: number = 0
  bulletInFlight: PlayerBullet | null = null
  maxSpeed: number = 200 // pixels per second
  private canvasWidth: number
  private canvasHeight: number

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    // Start at bottom-center
    this.x = canvasWidth / 2 - this.width / 2
    this.y = canvasHeight - 50
  }

  /**
   * Update player position and state based on input
   */
  update(deltaTime: number, inputState: PlayerInputState): void {
    // Determine movement direction
    let direction: -1 | 0 | 1 = 0
    if (inputState.left) {
      direction = -1
    } else if (inputState.right) {
      direction = 1
    }

    // Move player
    this.move(direction, deltaTime)

    // Update invincibility timer
    this.updateInvincibility(deltaTime)
  }

  /**
   * Move in a direction with boundary constraints
   */
  move(direction: -1 | 0 | 1, deltaTime: number): void {
    this.x += direction * this.maxSpeed * (deltaTime / 1000)
    // Clamp to screen bounds
    this.x = Math.max(0, Math.min(this.x, this.canvasWidth - this.width))
  }

  /**
   * Fire a bullet
   */
  fire(): PlayerBullet | null {
    if (this.bulletInFlight) {
      return null // Only one bullet at a time
    }

    const bullet = new PlayerBulletImpl(
      this.x + this.width / 2 - 2,
      this.y
    )

    this.bulletInFlight = bullet
    console.log(`Bullet fired at y=${bullet.y}`)
    return bullet
  }

  /**
   * Take damage - set invincibility
   */
  takeDamage(): void {
    this.invincible = true
    this.invincibilityTimer = 2000 // 2 seconds in milliseconds
    console.log(`Player hit! Invincibility: ${this.invincibilityTimer} ms`)
  }

  /**
   * Update invincibility timer
   */
  updateInvincibility(deltaTime: number): void {
    if (this.invincible) {
      this.invincibilityTimer -= deltaTime
      if (this.invincibilityTimer <= 0) {
        this.invincible = false
        this.invincibilityTimer = 0
      }
    }
  }

  /**
   * Get bounding box for collision detection
   */
  getBoundingBox(): BoundingBox {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }
  }

  /**
   * Render player (delegated to RenderingSystem)
   */
  render(ctx: CanvasRenderingContext2D): void {
    // Drawing is handled by RenderingSystem
    // This method is here for interface completeness
  }
}

/**
 * PlayerBullet class
 */
export class PlayerBulletImpl implements PlayerBullet {
  x: number
  y: number
  width: number = 4
  height: number = 12
  vx: number = 0
  vy: number = -300
  type: 'player' = 'player'
  active: boolean = false // Flag for collision and pooling tracking

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.active = true
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
    return this.y + this.height < 0
  }

  /**
    * Get bounding box for collision detection
    */
  getBoundingBox(): BoundingBox {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }
  }

  /**
    * Render bullet (delegated to RenderingSystem)
    */
  render(ctx: CanvasRenderingContext2D): void {
    // Drawing is handled by RenderingSystem
    // This method is here for interface completeness
  }

  /**
    * Reset bullet to active state (for pooling)
    */
  reset(x: number, y: number): void {
    this.x = x
    this.y = y
    this.active = true
  }

  /**
    * Deactivate bullet (remove from game)
    */
  deactivate(): void {
    this.active = false
  }
}



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
  alive: boolean = false // For collision tracking

  constructor() {
    this.x = 0
    this.y = 50
  }

  /**
    * Activate the mystery ship
    */
  activate(): void {
    this.active = true
    this.alive = true
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
      this.alive = false
    }
  }

  /**
    * Get bounding box for collision detection
    */
  getBoundingBox(): BoundingBox {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }
  }
}
