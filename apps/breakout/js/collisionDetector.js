/**
 * CollisionDetector.js
 * Detects and resolves collisions between ball and game objects.
 * Prevents tunneling by resolving only one collision per frame.
 */

class CollisionDetector {
  /**
   * Initialize collision detector.
   */
  constructor() {
    this.canvasWidth = 800;
    this.canvasHeight = 600;
    this.floorY = 600; // Floor position
  }

  /**
   * Detect and resolve collisions.
   * Checks collisions in priority order and resolves the first one found.
   * @param {Object} gameState - Current game state
   * @returns {string|null} Collision type: "ball-lost" | "brick-destroyed" | "paddle-bounce" | null
   */
  detectAndResolve(gameState) {
    const ball = gameState.ball;

    // 1. Check floor collision first (highest priority)
    if (this.checkFloorCollision(ball)) {
      return 'ball-lost';
    }

    // 2. Check brick collisions
    const hitBrick = this.checkBrickCollision(ball, gameState.bricks);
    if (hitBrick) {
      this.resolveBrickCollision(ball, hitBrick, gameState);
      return 'brick-destroyed';
    }

    // 3. Check paddle collision
    if (this.checkPaddleCollision(ball, gameState.paddle)) {
      this.resolvePaddleCollision(ball, gameState.paddle);
      return 'paddle-bounce';
    }

    // 4. Check wall and ceiling collisions
    if (this.checkWallCollision(ball)) {
      this.resolveWallCollision(ball);
    }

    if (this.checkCeilingCollision(ball)) {
      this.resolveCeilingCollision(ball);
    }

    return null;
  }

  /**
   * Check if ball has gone below the floor (ball lost).
   * @param {Object} ball - Ball object
   * @returns {boolean} True if ball is below floor
   */
  checkFloorCollision(ball) {
    return ball.y + ball.radius > this.floorY;
  }

  /**
   * Check collision between ball and any brick.
   * @param {Object} ball - Ball object
   * @param {Array} bricks - Array of brick objects
   * @returns {Object|null} First brick hit, or null
   */
  checkBrickCollision(ball, bricks) {
    for (const brick of bricks) {
      if (!brick.isDestroyed && this.intersectsCircleRect(ball, brick)) {
        return brick;
      }
    }
    return null;
  }

  /**
   * Check collision between ball and paddle.
   * @param {Object} ball - Ball object
   * @param {Object} paddle - Paddle object
   * @returns {boolean} True if ball intersects paddle
   */
  checkPaddleCollision(ball, paddle) {
    return this.intersectsCircleRect(ball, paddle);
  }

  /**
   * Check if ball hits left or right wall.
   * @param {Object} ball - Ball object
   * @returns {boolean} True if ball intersects wall
   */
  checkWallCollision(ball) {
    return ball.x - ball.radius < 0 || ball.x + ball.radius > this.canvasWidth;
  }

  /**
   * Check if ball hits ceiling (top).
   * @param {Object} ball - Ball object
   * @returns {boolean} True if ball intersects ceiling
   */
  checkCeilingCollision(ball) {
    return ball.y - ball.radius < 0;
  }

  /**
   * Resolve brick collision: reflect ball and mark brick as destroyed.
   * @param {Object} ball - Ball object
   * @param {Object} brick - Brick object
   * @param {Object} gameState - Current game state
   */
  resolveBrickCollision(ball, brick, gameState) {
    // Reflect ball
    const side = this.getCollisionSide(ball, brick);
    if (side === 'top' || side === 'bottom') {
      ball.vy *= -1;
    } else {
      ball.vx *= -1;
    }

    // Mark brick as destroyed and remove from game state
    brick.isDestroyed = true;
    gameState.removeBrick(brick.id);
  }

  /**
   * Resolve paddle collision: reflect ball with angle-dependent behavior.
   * @param {Object} ball - Ball object
   * @param {Object} paddle - Paddle object
   */
  resolvePaddleCollision(ball, paddle) {
    // Reflect ball on Y axis
    ball.vy *= -1;

    // Optional: angle-dependent reflection based on impact position
    // This is a simple implementation; can be enhanced for smoother gameplay
  }

  /**
   * Resolve wall collision: reflect ball on X axis.
   * @param {Object} ball - Ball object
   */
  resolveWallCollision(ball) {
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.canvasWidth) {
      ball.vx *= -1;
    }
  }

  /**
   * Resolve ceiling collision: reflect ball on Y axis.
   * @param {Object} ball - Ball object
   */
  resolveCeilingCollision(ball) {
    if (ball.y - ball.radius < 0) {
      ball.vy *= -1;
    }
  }

  /**
   * Check if circle (ball) intersects axis-aligned rectangle.
   * @param {Object} circle - Ball object (has x, y, radius)
   * @param {Object} rect - Rectangle object (has x, y, width, height)
   * @returns {boolean} True if intersecting
   */
  intersectsCircleRect(circle, rect) {
    // Clamp circle center to rectangle bounds
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Calculate distance between circle center and closest point
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    // Check if distance is less than radius
    return distanceSquared < circle.radius * circle.radius;
  }

  /**
   * Determine which side of rectangle the ball hit.
   * @param {Object} ball - Ball object
   * @param {Object} rect - Rectangle object
   * @returns {string} Collision side: "top" | "bottom" | "left" | "right"
   */
  getCollisionSide(ball, rect) {
    const overlapLeft = ball.x + ball.radius - rect.x;
    const overlapRight = rect.x + rect.width - (ball.x - ball.radius);
    const overlapTop = ball.y + ball.radius - rect.y;
    const overlapBottom = rect.y + rect.height - (ball.y - ball.radius);

    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapTop) return 'top';
    if (minOverlap === overlapBottom) return 'bottom';
    if (minOverlap === overlapLeft) return 'left';
    return 'right';
  }

  /**
   * Set canvas dimensions for boundary checking.
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  setCanvasDimensions(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.floorY = height;
  }
}
