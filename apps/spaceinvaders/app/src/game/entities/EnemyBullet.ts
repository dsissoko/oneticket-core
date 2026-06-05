/**
 * EnemyBullet class — represents a single bullet fired by an enemy
 */

import type { BoundingBox } from '../types'

export class EnemyBullet implements BoundingBox {
  x: number
  y: number
  vx: number = 0
  vy: number = 150 // pixels per second, downward
  width: number = 4
  height: number = 12
  active: boolean = false

  constructor(x: number = 0, y: number = 0, vy: number = 150) {
    this.x = x
    this.y = y
    this.vy = vy
  }

  /**
   * Update bullet position based on deltaTime
   */
  update(deltaTime: number): void {
    this.y += this.vy * (deltaTime / 1000)
  }

  /**
   * Check if bullet is out of bounds (below canvas)
   */
  isOutOfBounds(canvasHeight: number): boolean {
    return this.y > canvasHeight
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
   * Reset bullet to inactive state and new position
   */
  reset(x: number, y: number): void {
    this.x = x
    this.y = y
    this.active = true
  }

  /**
   * Deactivate bullet (return to pool)
   */
  deactivate(): void {
    this.active = false
  }
}
