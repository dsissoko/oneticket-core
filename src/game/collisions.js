/**
 * CollisionDetector Module
 * Handles collision detection and response for ball vs bricks and ball vs paddle
 * Uses simple AABB (Axis-Aligned Bounding Box) collision detection
 * Returns collision events for integration with score system
 */

class CollisionDetector {
  /**
   * Check for collisions between ball and active bricks
   * Uses AABB intersection test
   * @param {Object} gameState - Game state object containing ball and bricks
   * @param {Object} gameState.ball - Ball object with x, y, radius, vx, vy
   * @param {Array} gameState.bricks - Array of brick objects
   * @returns {Array} Array of collision events {brick, side}
   */
  checkBallBrickCollisions(gameState) {
    const { ball, bricks } = gameState;
    const collisions = [];

    // Filter only active bricks and test each one
    bricks.forEach((brick) => {
      if (!brick.active) return;

      // Test AABB collision between ball and brick
      const collision = this.testAABBCollision(
        ball.x - ball.radius,
        ball.y - ball.radius,
        ball.radius * 2,
        ball.radius * 2,
        brick.x,
        brick.y,
        brick.width,
        brick.height
      );

      if (collision) {
        // Determine which side of the brick was hit
        const side = this.getCollisionSide(
          ball.x,
          ball.y,
          brick.x,
          brick.y,
          brick.width,
          brick.height
        );

        // Invert velocity based on collision side
        if (side === 'top' || side === 'bottom') {
          ball.vy = -ball.vy;
        } else if (side === 'left' || side === 'right') {
          ball.vx = -ball.vx;
        }

        // Mark brick as inactive
        brick.active = false;

        // Record collision event
        collisions.push({
          brick: brick,
          side: side
        });
      }
    });

    return collisions;
  }

  /**
   * Check for collision between ball and paddle
   * Uses AABB intersection test
   * @param {Object} gameState - Game state object containing ball and paddle
   * @param {Object} gameState.ball - Ball object with x, y, radius, vx, vy
   * @param {Object} gameState.paddle - Paddle object with x, y, width, height
   * @returns {Object|null} Collision event {side} or null if no collision
   */
  checkBallPaddleCollisions(gameState) {
    const { ball, paddle } = gameState;

    // Test AABB collision between ball and paddle
    const collision = this.testAABBCollision(
      ball.x - ball.radius,
      ball.y - ball.radius,
      ball.radius * 2,
      ball.radius * 2,
      paddle.x,
      paddle.y,
      paddle.width,
      paddle.height
    );

    if (collision) {
      // Determine which side of the paddle was hit
      const side = this.getCollisionSide(
        ball.x,
        ball.y,
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
      );

      // Invert vy when hitting paddle (typically from top)
      if (side === 'top' || side === 'bottom') {
        ball.vy = -ball.vy;
      } else if (side === 'left' || side === 'right') {
        ball.vx = -ball.vx;
      }

      return {
        side: side
      };
    }

    return null;
  }

  /**
   * Test AABB (Axis-Aligned Bounding Box) collision between two rectangles
   * @param {number} x1 - Left edge of first box
   * @param {number} y1 - Top edge of first box
   * @param {number} w1 - Width of first box
   * @param {number} h1 - Height of first box
   * @param {number} x2 - Left edge of second box
   * @param {number} y2 - Top edge of second box
   * @param {number} w2 - Width of second box
   * @param {number} h2 - Height of second box
   * @returns {boolean} True if boxes overlap, false otherwise
   */
  testAABBCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (
      x1 < x2 + w2 &&
      x1 + w1 > x2 &&
      y1 < y2 + h2 &&
      y1 + h1 > y2
    );
  }

  /**
   * Determine which side of a rectangle the ball collided with
   * Uses distance from ball center to each edge to determine closest side
   * @param {number} ballX - X position of ball center
   * @param {number} ballY - Y position of ball center
   * @param {number} rectX - X position of rectangle (left edge)
   * @param {number} rectY - Y position of rectangle (top edge)
   * @param {number} rectWidth - Width of rectangle
   * @param {number} rectHeight - Height of rectangle
   * @returns {string} Collision side: 'top', 'bottom', 'left', or 'right'
   */
  getCollisionSide(ballX, ballY, rectX, rectY, rectWidth, rectHeight) {
    // Calculate distances from ball center to each edge
    const distTop = Math.abs(ballY - (rectY + rectHeight / 2)) - rectHeight / 2;
    const distBottom = Math.abs(ballY - (rectY + rectHeight / 2)) - rectHeight / 2;
    const distLeft = Math.abs(ballX - (rectX + rectWidth / 2)) - rectWidth / 2;
    const distRight = Math.abs(ballX - (rectX + rectWidth / 2)) - rectWidth / 2;

    // Calculate actual distances to each edge
    const top = Math.abs(ballY - rectY);
    const bottom = Math.abs(ballY - (rectY + rectHeight));
    const left = Math.abs(ballX - rectX);
    const right = Math.abs(ballX - (rectX + rectWidth));

    // Find minimum distance to determine collision side
    const minDist = Math.min(top, bottom, left, right);

    if (minDist === top) return 'top';
    if (minDist === bottom) return 'bottom';
    if (minDist === left) return 'left';
    return 'right';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CollisionDetector;
}
