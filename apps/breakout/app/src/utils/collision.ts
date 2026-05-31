/**
 * Collision Detection & Resolution Module
 *
 * Pure functions for AABB collision detection and ball-obstacle physics resolution.
 * No side effects, all functions are deterministic.
 */

/**
 * Represents a rectangle with position and dimensions.
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Represents a circular ball with position, radius, and velocity.
 */
export interface Ball {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}

/**
 * Represents velocity components after collision resolution.
 */
export interface VelocityResolution {
  vx: number;
  vy: number;
}

/**
 * Detects overlap between two axis-aligned rectangles using AABB algorithm.
 *
 * Two rectangles overlap if they share space on both X and Y axes.
 * - No overlap on X axis: rect1.right <= rect2.left OR rect2.right <= rect1.left
 * - No overlap on Y axis: rect1.bottom <= rect2.top OR rect2.bottom <= rect1.top
 * - Overlap exists if BOTH axes overlap
 *
 * @param rect1 First rectangle
 * @param rect2 Second rectangle
 * @returns true if rectangles overlap, false otherwise
 */
export function checkAABB(rect1: Rect, rect2: Rect): boolean {
  const noOverlapX = rect1.x + rect1.width <= rect2.x || rect2.x + rect2.width <= rect1.x;
  const noOverlapY = rect1.y + rect1.height <= rect2.y || rect2.y + rect2.height <= rect1.y;

  return !noOverlapX && !noOverlapY;
}

/**
 * Detects collision between a circular ball and an axis-aligned rectangle.
 *
 * Uses circle-AABB collision by finding the closest point on the rectangle
 * to the ball's center, then checking if that point is within the ball's radius.
 *
 * Algorithm:
 * 1. Clamp ball center to rectangle bounds (find closest point)
 * 2. Calculate distance from clamped point to ball center
 * 3. Collision occurs if distance <= radius
 *
 * @param ball Ball with position, radius, and velocity
 * @param rect Rectangle to test against
 * @returns true if ball and rectangle overlap, false otherwise
 */
export function checkCircleAABB(ball: Ball, rect: Rect): boolean {
  const ballCenterX = ball.x + ball.radius;
  const ballCenterY = ball.y + ball.radius;

  // Find the closest point on the rectangle to the ball's center
  const closestX = Math.max(rect.x, Math.min(ballCenterX, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(ballCenterY, rect.y + rect.height));

  // Calculate distance between closest point and ball center
  const distanceX = ballCenterX - closestX;
  const distanceY = ballCenterY - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  // Collision if distance <= radius
  return distanceSquared <= ball.radius * ball.radius;
}

/**
 * Determines which velocity components to reverse after ball-obstacle collision.
 *
 * For physics, we need to determine whether the collision happened primarily
 * on the horizontal (left/right) or vertical (top/bottom) axis:
 *
 * - If ball is more overlapped horizontally: reverse vx (bounce left/right)
 * - If ball is more overlapped vertically: reverse vy (bounce up/down)
 * - If equal overlap: reverse both (corner case)
 *
 * We use the overlap depth on each axis to determine this:
 * - Horizontal overlap depth = (rect.left + rect.width - ball.x) OR (ball.x + ball.radius - rect.x)
 * - Vertical overlap depth = (rect.top + rect.height - ball.y) OR (ball.y + ball.radius - rect.y)
 *
 * @param ball Ball with position, radius, and velocity
 * @param obstacle Rectangle representing the obstacle
 * @returns Object with vx and vy indicating direction of velocity reversal (0 or reversed value)
 */
export function resolveBallCollision(ball: Ball, obstacle: Rect): VelocityResolution {
  const ballCenterX = ball.x + ball.radius;
  const ballCenterY = ball.y + ball.radius;

  // Calculate overlap on each axis
  // Horizontal overlap: how much the ball overlaps with the obstacle left/right
  const overlapLeft = ballCenterX - (obstacle.x);
  const overlapRight = (obstacle.x + obstacle.width) - ballCenterX;
  const horizontalOverlap = Math.min(overlapLeft, overlapRight);

  // Vertical overlap: how much the ball overlaps with the obstacle top/bottom
  const overlapTop = ballCenterY - (obstacle.y);
  const overlapBottom = (obstacle.y + obstacle.height) - ballCenterY;
  const verticalOverlap = Math.min(overlapTop, overlapBottom);

  // Reverse velocity on the axis with smaller overlap (that's the collision edge)
  let vx = ball.vx;
  let vy = ball.vy;

  if (horizontalOverlap < verticalOverlap) {
    // Collision on left/right edge
    vx = -ball.vx;
  } else if (verticalOverlap < horizontalOverlap) {
    // Collision on top/bottom edge
    vy = -ball.vy;
  } else {
    // Corner case: equal overlap, reverse both
    vx = -ball.vx;
    vy = -ball.vy;
  }

  return { vx, vy };
}
