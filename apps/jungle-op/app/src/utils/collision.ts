/**
 * Collision Detection & Resolution Module for Jungle Op
 *
 * Pure functions for circle-circle and circle-rectangle collision detection.
 */

export interface Circle {
  x: number;  // center x
  y: number;  // center y
  radius: number;
}

export interface Rect {
  x: number;      // top-left x
  y: number;      // top-left y
  width: number;
  height: number;
}

/**
 * Check if two circles overlap.
 */
export function circlesOverlap(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distSq = dx * dx + dy * dy;
  const radiusSum = a.radius + b.radius;
  return distSq <= radiusSum * radiusSum;
}

/**
 * Check if a circle overlaps a rectangle.
 * Uses closest-point-on-rectangle to circle-center distance.
 */
export function circleRectOverlap(circle: Circle, rect: Rect): boolean {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

/** @deprecated Use circlesOverlap or circleRectOverlap instead */
export function checkAABB(_rect1: Rect, _rect2: Rect): boolean {
  return false;
}

/** @deprecated Use circleRectOverlap instead */
export function checkCircleAABB(ball: Circle, rect: Rect): boolean {
  return circleRectOverlap(ball, rect);
}

/** @deprecated Use circlesOverlap instead */
export function resolveBallCollision(_a: Circle, _obstacle: Rect): { vx: number; vy: number } {
  return { vx: 0, vy: 0 };
}
