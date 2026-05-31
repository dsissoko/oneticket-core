/**
 * Collision Detection & Resolution Module
 *
 * Pure functions for circle-AABB collision detection and physics resolution.
 * Convention: ball.x and ball.y are the TOP-LEFT corner of the bounding box,
 * so the ball center is at (ball.x + ball.radius, ball.y + ball.radius).
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}

export interface CollisionResult {
  hit: boolean;
  vx: number;
  vy: number;
  /** Corrected ball position to push it out of the obstacle */
  nx: number;
  ny: number;
}

/**
 * Detects and resolves a collision between a ball and a rectangle.
 *
 * Returns hit=false if no collision.
 * Returns hit=true with corrected velocity AND position to push ball
 * out of the obstacle — prevents double-bounce on next frame.
 *
 * Algorithm:
 * 1. Find closest point on rect to ball center
 * 2. Check if distance <= radius (collision)
 * 3. Determine collision normal (which face was hit)
 * 4. Reverse velocity component on that axis
 * 5. Push ball out of obstacle along the normal
 */
export function resolveCollision(ball: Ball, rect: Rect): CollisionResult {
  const cx = ball.x + ball.radius;
  const cy = ball.y + ball.radius;

  // Closest point on rect to ball center
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));

  const dx = cx - closestX;
  const dy = cy - closestY;
  const distSq = dx * dx + dy * dy;

  if (distSq > ball.radius * ball.radius) {
    return { hit: false, vx: ball.vx, vy: ball.vy, nx: ball.x, ny: ball.y };
  }

  const dist = Math.sqrt(distSq);

  // Determine collision normal — which face of the rect was hit
  // by comparing overlap depth on each axis
  const overlapLeft   = cx - rect.x;
  const overlapRight  = rect.x + rect.width - cx;
  const overlapTop    = cy - rect.y;
  const overlapBottom = rect.y + rect.height - cy;

  const minH = Math.min(overlapLeft, overlapRight);
  const minV = Math.min(overlapTop, overlapBottom);

  let vx = ball.vx;
  let vy = ball.vy;
  let nx = ball.x;
  let ny = ball.y;

  if (dist === 0) {
    // Ball center exactly on rect edge — use overlap depth to determine axis
    if (minH <= minV) {
      vx = -ball.vx;
      nx = overlapLeft < overlapRight ? rect.x - ball.radius * 2 : rect.x + rect.width;
    } else {
      vy = -ball.vy;
      ny = overlapTop < overlapBottom ? rect.y - ball.radius * 2 : rect.y + rect.height;
    }
    return { hit: true, vx, vy, nx, ny };
  }

  if (minH < minV) {
    // Hit left or right face → reverse vx
    vx = -ball.vx;
    if (overlapLeft < overlapRight) {
      // Hit left face — push ball left
      nx = rect.x - ball.radius * 2;
    } else {
      // Hit right face — push ball right
      nx = rect.x + rect.width;
    }
  } else {
    // Hit top or bottom face → reverse vy
    vy = -ball.vy;
    if (overlapTop < overlapBottom) {
      // Hit top face — push ball up
      ny = rect.y - ball.radius * 2;
    } else {
      // Hit bottom face — push ball down
      ny = rect.y + rect.height;
    }
  }

  return { hit: true, vx, vy, nx, ny };
}

/** @deprecated Use resolveCollision instead */
export function checkAABB(rect1: Rect, rect2: Rect): boolean {
  const noOverlapX = rect1.x + rect1.width <= rect2.x || rect2.x + rect2.width <= rect1.x;
  const noOverlapY = rect1.y + rect1.height <= rect2.y || rect2.y + rect2.height <= rect1.y;
  return !noOverlapX && !noOverlapY;
}

/** @deprecated Use resolveCollision instead */
export function checkCircleAABB(ball: Ball, rect: Rect): boolean {
  const { hit } = resolveCollision(ball, rect);
  return hit;
}

/** @deprecated Use resolveCollision instead */
export function resolveBallCollision(ball: Ball, obstacle: Rect): { vx: number; vy: number } {
  const { vx, vy } = resolveCollision(ball, obstacle);
  return { vx, vy };
}
