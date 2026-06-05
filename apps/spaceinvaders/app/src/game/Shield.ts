/**
 * Shield and Segment classes for destructible shields
 * Manages 4×4 grid of segments per shield with damage tracking
 */

import type { Segment } from './types'

/**
 * Segment class - represents a single segment in a shield grid
 * Each segment can be damaged up to 3 times before destruction
 */
export class SegmentImpl implements Segment {
  gridX: number
  gridY: number
  x: number
  y: number
  width: number
  height: number
  alive: boolean = true
  hitCount: number = 0
  opacity: number = 1.0

  constructor(gridX: number, gridY: number, x: number, y: number, size: number) {
    this.gridX = gridX
    this.gridY = gridY
    this.x = x
    this.y = y
    this.width = size
    this.height = size
  }

  /**
   * Apply damage to this segment
   * Each hit reduces opacity and increments hitCount
   * After 3 hits, segment is destroyed
   */
  takeDamage(): void {
    this.hitCount++
    this.updateOpacity()
    if (this.hitCount >= 3) {
      this.alive = false
    }
  }

  /**
   * Update opacity based on hit count
   * Opacity decreases: 1.0 -> 0.67 -> 0.33 -> 0
   */
  updateOpacity(): void {
    this.opacity = Math.max(0, 1.0 - this.hitCount * 0.33)
  }

  /**
   * Check if segment is destroyed
   */
  isDestroyed(): boolean {
    return !this.alive || this.opacity <= 0
  }

  /**
   * Reset segment to initial state
   */
  reset(): void {
    this.alive = true
    this.hitCount = 0
    this.opacity = 1.0
  }
}

/**
 * Shield class - represents a destructible shield bunker
 * Contains a 4×4 grid of segments (16 total)
 * Segment size: 12×12 pixels, shield total: 48×48 pixels
 */
export class ShieldImpl {
  x: number
  y: number
  width: number = 48 // 4 columns × 12 pixels per segment
  height: number = 48 // 4 rows × 12 pixels per segment
  segments: SegmentImpl[][] = []

  private readonly SEGMENT_SIZE = 12
  private readonly GRID_COLS = 4
  private readonly GRID_ROWS = 4

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.initializeSegments()
  }

  /**
   * Initialize 4×4 grid of segments
   */
  private initializeSegments(): void {
    this.segments = []

    for (let gridY = 0; gridY < this.GRID_ROWS; gridY++) {
      this.segments[gridY] = []
      for (let gridX = 0; gridX < this.GRID_COLS; gridX++) {
        const segmentX = this.x + gridX * this.SEGMENT_SIZE
        const segmentY = this.y + gridY * this.SEGMENT_SIZE

        this.segments[gridY][gridX] = new SegmentImpl(
          gridX,
          gridY,
          segmentX,
          segmentY,
          this.SEGMENT_SIZE
        )
      }
    }
  }

  /**
   * Damage a specific segment at grid position
   * Returns true if segment was destroyed, false otherwise
   */
  damageSegment(gridX: number, gridY: number): boolean {
    if (this.isValidGridPosition(gridX, gridY)) {
      const segment = this.segments[gridY][gridX]
      const wasAlive = segment.alive
      segment.takeDamage()
      return wasAlive && !segment.alive
    }
    return false
  }

  /**
   * Check if shield is completely destroyed
   * All segments must be destroyed
   */
  isDestroyed(): boolean {
    return this.segments.every((row) => row.every((seg) => seg.isDestroyed()))
  }

  /**
   * Get all visible (alive) segments
   */
  getVisibleSegments(): SegmentImpl[] {
    const visible: SegmentImpl[] = []
    for (let gridY = 0; gridY < this.GRID_ROWS; gridY++) {
      for (let gridX = 0; gridX < this.GRID_COLS; gridX++) {
        const segment = this.segments[gridY][gridX]
        if (segment.alive) {
          visible.push(segment)
        }
      }
    }
    return visible
  }

  /**
   * Reset shield to full health
   * All segments reset to alive = true, hitCount = 0, opacity = 1.0
   */
  reset(): void {
    for (let gridY = 0; gridY < this.GRID_ROWS; gridY++) {
      for (let gridX = 0; gridX < this.GRID_COLS; gridX++) {
        this.segments[gridY][gridX].reset()
      }
    }
  }

  /**
   * Get bounding box for collision detection
   */
  getBoundingBox(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }
  }

  /**
   * Check if grid position is valid
   */
  private isValidGridPosition(gridX: number, gridY: number): boolean {
    return gridX >= 0 && gridX < this.GRID_COLS && gridY >= 0 && gridY < this.GRID_ROWS
  }
}
