/**
 * Physics.js
 * Updates ball and paddle position/velocity based on deltaTime.
 * Applies speed multiplier and enforces boundary constraints.
 */

class Physics {
  /**
   * Initialize physics engine with default parameters.
   */
  constructor() {
    this.canvasWidth = 800;
    this.canvasHeight = 600;
    this.paddleSpeed = 400; // pixels per second
    this.gravity = 0; // No gravity in Breakout
  }

  /**
   * Update ball and paddle positions based on deltaTime.
   * @param {number} deltaTime - Time since last frame (in seconds)
   * @param {Object} gameState - Current game state
   */
  update(deltaTime, gameState) {
    if (gameState.isPaused) {
      return;
    }

    // Update ball position
    this.updateBallPosition(deltaTime, gameState);

    // Update paddle position
    this.updatePaddlePosition(deltaTime, gameState);
  }

  /**
   * Update ball position and velocity.
   * @param {number} deltaTime - Time delta
   * @param {Object} gameState - Current game state
   */
  updateBallPosition(deltaTime, gameState) {
    const ball = gameState.ball;

    // Apply speed multiplier to velocity
    const speedFactor = gameState.speedMultiplier;
    const adjustedVx = ball.vx * speedFactor;
    const adjustedVy = ball.vy * speedFactor;

    // Update position: p += v * dt
    ball.x += adjustedVx * deltaTime;
    ball.y += adjustedVy * deltaTime;
  }

  /**
   * Update paddle position based on velocity.
   * Clamps paddle to screen bounds.
   * @param {number} deltaTime - Time delta
   * @param {Object} gameState - Current game state
   */
  updatePaddlePosition(deltaTime, gameState) {
    const paddle = gameState.paddle;

    // Update position: x += vx * dt
    paddle.x += paddle.vx * deltaTime;

    // Clamp paddle to screen bounds
    const minX = 0;
    const maxX = this.canvasWidth - paddle.width;
    paddle.x = Math.max(minX, Math.min(maxX, paddle.x));
  }

  /**
   * Apply speed multiplier to ball velocity.
   * Called when speed multiplier changes.
   * @param {number} multiplier - Speed multiplier (0.5-2.0)
   * @param {Object} gameState - Current game state
   */
  applySpeedMultiplier(multiplier, gameState) {
    gameState.setSpeedMultiplier(multiplier);
  }

  /**
   * Set canvas dimensions for boundary checking.
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  setCanvasDimensions(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * Reflect ball velocity on X axis (for wall/paddle collisions).
   * @param {Object} ball - Ball object
   */
  reflectBallX(ball) {
    ball.vx *= -1;
  }

  /**
   * Reflect ball velocity on Y axis (for ceiling/floor collisions).
   * @param {Object} ball - Ball object
   */
  reflectBallY(ball) {
    ball.vy *= -1;
  }
}
