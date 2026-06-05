/**
 * Enemy class — represents a single enemy in the formation
 */

import type { BoundingBox } from '../types'

export type EnemyType = 'small' | 'medium' | 'large'

export class Enemy {
  x: number
  y: number
  type: EnemyType
  points: number
  alive: boolean
  width: number
  height: number

  constructor(x: number, y: number, type: EnemyType) {
    this.x = x
    this.y = y
    this.type = type
    this.alive = true

    // Set dimensions and points based on type
    switch (type) {
      case 'small':
        this.width = 24
        this.height = 24
        this.points = 40
        break
      case 'medium':
        this.width = 32
        this.height = 32
        this.points = 20
        break
      case 'large':
        this.width = 40
        this.height = 40
        this.points = 10
        break
    }
  }

  /**
    * Get the points value for this enemy
    */
  getPoints(): number {
    return this.points
  }

  /**
    * Set the bounding box dimensions
    */
  setBoundingBox(width: number, height: number): void {
    this.width = width
    this.height = height
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
