/**
 * PhysicsEngine Module
 * Handles ball physics including movement, collision detection, and elastic bouncing.
 * Frame-rate independent using delta time (dt).
 */

class PhysicsEngine {
  /**
   * Initialize the PhysicsEngine
   * @param {number} canvasWidth - Width of the game canvas
   * @param {number} canvasHeight - Height of the game canvas
   */
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Update game state based on physics simulation
   * @param {Object} gameState - Game state object containing ball properties
   * @param {Object} gameState.ball - Ball object with x, y, vx, vy, radius
   * @param {number} dt - Delta time in seconds since last frame
   */
  update(gameState, dt) {
    const { ball } = gameState;

    // Update ball position based on velocity (frame-rate independent)
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Detect and handle collisions with walls
    this.handleWallCollisions(ball);

    // Keep ball within canvas bounds
    this.constrainToBounds(ball);
  }

  /**
   * Detect and handle collisions with canvas walls
   * Implements elastic bouncing by inverting velocity components
   * @param {Object} ball - Ball object with position, velocity, and radius
   */
  handleWallCollisions(ball) {
    // Left wall collision
    if (ball.x - ball.radius <= 0) {
      ball.x = ball.radius;
      ball.vx = Math.abs(ball.vx); // Bounce right
    }

    // Right wall collision
    if (ball.x + ball.radius >= this.canvasWidth) {
      ball.x = this.canvasWidth - ball.radius;
      ball.vx = -Math.abs(ball.vx); // Bounce left
    }

    // Top wall collision
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy); // Bounce down
    }

    // Bottom wall collision
    if (ball.y + ball.radius >= this.canvasHeight) {
      ball.y = this.canvasHeight - ball.radius;
      ball.vy = -Math.abs(ball.vy); // Bounce up
    }
  }

  /**
   * Constrain ball position to canvas bounds
   * Ensures ball never goes outside the playable area
   * @param {Object} ball - Ball object with position and radius
   */
  constrainToBounds(ball) {
    // Clamp x position
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
    }
    if (ball.x + ball.radius > this.canvasWidth) {
      ball.x = this.canvasWidth - ball.radius;
    }

    // Clamp y position
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
    }
    if (ball.y + ball.radius > this.canvasHeight) {
      ball.y = this.canvasHeight - ball.radius;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhysicsEngine;
}
