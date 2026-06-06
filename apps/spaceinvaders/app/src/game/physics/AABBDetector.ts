/**
 * AABBDetector — Axis-Aligned Bounding Box collision detection utility
 * Provides static methods for AABB-based collision detection
 */

import type { BoundingBox } from '../types'

export class AABBDetector {
  /**
   * Check if two axis-aligned bounding boxes collide
   * Uses the separating axis theorem: if we can find a gap between boxes on any axis, they don't collide
   *
   * @param a First bounding box
   * @param b Second bounding box
   * @returns true if boxes overlap, false otherwise
   */
  static checkCollision(a: BoundingBox, b: BoundingBox): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    )
  }

  /**
   * Get the overlap rectangle (intersection) of two bounding boxes
   * Returns null if boxes don't overlap
   *
   * @param a First bounding box
   * @param b Second bounding box
   * @returns Overlap bounding box or null if no collision
   */
  static getOverlapRect(a: BoundingBox, b: BoundingBox): BoundingBox | null {
    if (!this.checkCollision(a, b)) {
      return null
    }

    const overlapX = Math.max(a.x, b.x)
    const overlapY = Math.max(a.y, b.y)
    const overlapWidth = Math.min(a.x + a.width, b.x + b.width) - overlapX
    const overlapHeight = Math.min(a.y + a.height, b.y + b.height) - overlapY

    return {
      x: overlapX,
      y: overlapY,
      width: Math.max(0, overlapWidth),
      height: Math.max(0, overlapHeight)
    }
  }

  /**
   * Check if a point is inside a bounding box
   *
   * @param point Point with x, y coordinates
   * @param box Bounding box
   * @returns true if point is inside box, false otherwise
   */
  static pointInBox(point: { x: number; y: number }, box: BoundingBox): boolean {
    return (
      point.x >= box.x &&
      point.x <= box.x + box.width &&
      point.y >= box.y &&
      point.y <= box.y + box.height
    )
  }

  /**
   * Calculate the penetration depth and direction between two boxes
   * Useful for separation responses
   *
   * @param a First bounding box
   * @param b Second bounding box
   * @returns Object with penetration depth and direction, or null if no collision
   */
  static getPenetrationInfo(
    a: BoundingBox,
    b: BoundingBox
  ): { depth: number; directionX: number; directionY: number } | null {
    if (!this.checkCollision(a, b)) {
      return null
    }

    // Calculate penetration on each axis
    const leftPenetration = a.x + a.width - b.x
    const rightPenetration = b.x + b.width - a.x
    const topPenetration = a.y + a.height - b.y
    const bottomPenetration = b.y + b.height - a.y

    // Find minimum penetration (shallowest overlap)
    const minX = Math.min(leftPenetration, rightPenetration)
    const minY = Math.min(topPenetration, bottomPenetration)

    let directionX = 0
    let directionY = 0

    if (minX < minY) {
      // Collision on horizontal axis
      directionX = leftPenetration < rightPenetration ? 1 : -1
    } else {
      // Collision on vertical axis
      directionY = topPenetration < bottomPenetration ? 1 : -1
    }

    return {
      depth: Math.min(minX, minY),
      directionX,
      directionY
    }
  }
}
