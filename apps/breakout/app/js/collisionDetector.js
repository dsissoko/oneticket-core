/**
 * CollisionDetector.js
 * 
 * Purpose: Detects and resolves collisions; prevents tunneling.
 * 
 * Collision Types (Priority Order):
 * 1. Floor Collision → Ball below play area → Emit "ball-lost" event
 * 2. Brick Collision → Ball intersects brick → Reflect ball, destroy brick
 * 3. Paddle Collision → Ball intersects paddle → Reflect ball (angle-dependent)
 * 4. Wall/Ceiling Collision → Ball intersects left/right/top → Reflect ball
 * 
 * Resolution Strategy:
 * - Only resolve ONE collision per frame to prevent tunneling
 * - Check collisions in priority order; return after first match
 * - Use AABB (Axis-Aligned Bounding Box) for brick/wall checks
 * - Use circle-vs-rect for ball-vs-paddle (angle-dependent reflection)
 */

class CollisionDetector {
  /**
   * Creates a new CollisionDetector instance.
   * 
   * @param {number} canvasWidth - Canvas width in pixels
   * @param {number} canvasHeight - Canvas height in pixels
   */
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Main collision detection and resolution method.
   * 
   * Checks collisions in priority order and resolves only the first collision found.
   * Returns collision event or null if no collision detected.
   * 
   * @param {GameState} gameState - Current game state
   * @returns {Object|null} Collision event: { type, object, impact } or null
   */
  detectAndResolve(gameState) {
    const ball = gameState.ball;

    // 1. Check floor collision (highest priority)
    if (this.detectFloorCollision(ball)) {
      console.log('[Collision] Ball lost - floor collision detected');
      return { type: 'ball-lost', object: 'floor', impact: { x: ball.x, y: ball.y } };
    }

    // 2. Check brick collisions
    const brickCollision = this.detectBrickCollision(ball, gameState.bricks);
    if (brickCollision) {
      const { brick, side } = brickCollision;
      this.reflectBallFromBrick(ball, side);
      this.destroyBrick(brick, gameState.bricks);
      console.log(`[Collision] Brick #${brick.id} destroyed - collision from ${side}`);
      return { type: 'brick-destroyed', object: brick, impact: { x: ball.x, y: ball.y }, side };
    }

    // 3. Check paddle collision
    const paddleCollision = this.detectPaddleCollision(ball, gameState.paddle);
    if (paddleCollision) {
      this.reflectBallFromPaddle(ball, gameState.paddle);
      console.log('[Collision] Paddle bounce');
      return { type: 'paddle-bounce', object: gameState.paddle, impact: { x: ball.x, y: ball.y } };
    }

    // 4. Check wall/ceiling collisions
    if (this.detectWallCollision(ball)) {
      console.log('[Collision] Wall collision - reversing horizontal velocity');
      ball.vx = -ball.vx;
    }

    if (this.detectCeilingCollision(ball)) {
      console.log('[Collision] Ceiling collision - reversing vertical velocity');
      ball.vy = -ball.vy;
    }

    return null;
  }

  /**
   * Detects if the ball has fallen below the play area (floor collision).
   * 
   * @param {Object} ball - Ball object with x, y, radius, vx, vy
   * @returns {boolean} True if ball is below the floor
   */
  detectFloorCollision(ball) {
    return ball.y + ball.radius > this.canvasHeight;
  }

  /**
   * Detects collision between ball and any brick in the array.
   * 
   * Returns the first brick that collides with the ball and the collision side.
   * 
   * @param {Object} ball - Ball object
   * @param {Array} bricks - Array of brick objects
   * @returns {Object|null} { brick, side } or null
   */
  detectBrickCollision(ball, bricks) {
    for (let brick of bricks) {
      if (brick.isDestroyed) {
        continue; // Skip destroyed bricks
      }

      const collision = this.intersectCircleRect(ball, brick);
      if (collision) {
        return { brick, side: collision.side };
      }
    }
    return null;
  }

  /**
   * Detects collision between ball and paddle.
   * 
   * @param {Object} ball - Ball object
   * @param {Object} paddle - Paddle object
   * @returns {boolean} True if ball intersects paddle
   */
  detectPaddleCollision(ball, paddle) {
    return this.intersectCircleRect(ball, paddle) !== null;
  }

  /**
   * Detects collision between ball and left/right walls.
   * 
   * @param {Object} ball - Ball object
   * @returns {boolean} True if ball hits left or right wall
   */
  detectWallCollision(ball) {
    // Left wall
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius; // Clamp to prevent tunneling
      return true;
    }
    // Right wall
    if (ball.x + ball.radius > this.canvasWidth) {
      ball.x = this.canvasWidth - ball.radius; // Clamp to prevent tunneling
      return true;
    }
    return false;
  }

  /**
   * Detects collision between ball and ceiling (top).
   * 
   * @param {Object} ball - Ball object
   * @returns {boolean} True if ball hits the ceiling
   */
  detectCeilingCollision(ball) {
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius; // Clamp to prevent tunneling
      return true;
    }
    return false;
  }

  /**
   * Detects intersection between a circle (ball) and an axis-aligned rectangle (brick/paddle).
   * 
   * Returns collision info with the side of impact if collision occurs.
   * 
   * @param {Object} circle - Circle object with { x, y, radius }
   * @param {Object} rect - Rectangle object with { x, y, width, height }
   * @returns {Object|null} { side: "top"|"bottom"|"left"|"right" } or null
   */
  intersectCircleRect(circle, rect) {
    // Find the closest point on the rectangle to the circle's center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Calculate distance between circle's center and closest point
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if distance is less than radius
    if (distance < circle.radius) {
      // Determine which side of the rectangle was hit
      const rectCenterX = rect.x + rect.width / 2;
      const rectCenterY = rect.y + rect.height / 2;

      const overlapLeft = circle.x + circle.radius - rect.x;
      const overlapRight = rect.x + rect.width - (circle.x - circle.radius);
      const overlapTop = circle.y + circle.radius - rect.y;
      const overlapBottom = rect.y + rect.height - (circle.y - circle.radius);

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      let side = 'top';
      if (minOverlap === overlapLeft) side = 'left';
      else if (minOverlap === overlapRight) side = 'right';
      else if (minOverlap === overlapTop) side = 'top';
      else if (minOverlap === overlapBottom) side = 'bottom';

      return { side };
    }

    return null;
  }

  /**
   * Reflects the ball off a brick based on collision side.
   * 
   * Simple reflection: reverse velocity component perpendicular to the impact surface.
   * 
   * @param {Object} ball - Ball object
   * @param {string} side - Collision side: "top", "bottom", "left", "right"
   */
  reflectBallFromBrick(ball, side) {
    if (side === 'left' || side === 'right') {
      ball.vx = -ball.vx;
    } else if (side === 'top' || side === 'bottom') {
      ball.vy = -ball.vy;
    }
  }

  /**
   * Reflects the ball off the paddle with angle-dependent reflection.
   * 
   * Impact position on paddle determines reflection angle:
   * - Center of paddle → vertical reflection (vy reversed)
   * - Left edge → angled left reflection
   * - Right edge → angled right reflection
   * 
   * @param {Object} ball - Ball object
   * @param {Object} paddle - Paddle object
   */
  reflectBallFromPaddle(ball, paddle) {
    // Calculate impact position on paddle (0 = left edge, 1 = right edge)
    const paddleLeft = paddle.x - paddle.width / 2;
    const paddleRight = paddle.x + paddle.width / 2;
    const impactRatio = (ball.x - paddleLeft) / paddle.width; // 0 to 1
    const clampedRatio = Math.max(0, Math.min(1, impactRatio));

    // Always reverse vertical velocity (bounce up)
    ball.vy = -Math.abs(ball.vy);

    // Apply angle-dependent horizontal reflection based on paddle impact position
    // Left third: angle left; center third: straight up; right third: angle right
    const angleStrength = 0.5; // Controls how much angle affects horizontal velocity
    const horizontalInfluence = (clampedRatio - 0.5) * 2; // -1 to 1
    
    // Modify horizontal velocity based on impact position
    ball.vx = horizontalInfluence * Math.abs(ball.vy) * angleStrength;

    console.log(`[Paddle Bounce] Impact ratio: ${clampedRatio.toFixed(2)}, new velocity: vx=${ball.vx.toFixed(1)}, vy=${ball.vy.toFixed(1)}`);
  }

  /**
   * Marks a brick as destroyed and removes it from the bricks array.
   * 
   * @param {Object} brick - Brick object to destroy
   * @param {Array} bricks - Array of bricks
   */
  destroyBrick(brick, bricks) {
    brick.isDestroyed = true;
    
    // Remove destroyed brick from array
    const index = bricks.findIndex(b => b.id === brick.id);
    if (index !== -1) {
      bricks.splice(index, 1);
    }
  }

  /**
   * Updates canvas dimensions (useful if canvas is resized).
   * 
   * @param {number} width - New canvas width
   * @param {number} height - New canvas height
   */
  setCanvasDimensions(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
}
