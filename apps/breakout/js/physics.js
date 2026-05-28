/**
 * Physics.js
 * Physics Engine — Updates ball and paddle position/velocity based on deltaTime.
 *
 * Responsibilities:
 * - Update ball position: x += vx * dt, y += vy * dt (applying speed multiplier)
 * - Update paddle position based on input velocity
 * - Apply speed multiplier to ball velocity
 * - Clamp paddle to screen bounds
 *
 * NOTE: This module contains NO collision detection logic.
 *       Collision resolution is handled by collisionDetector.js.
 */

class Physics {
  /**
   * Initialize physics engine with default parameters.
   * @param {number} canvasWidth - Canvas width (default: 800)
   * @param {number} canvasHeight - Canvas height (default: 600)
   */
  constructor(canvasWidth = 800, canvasHeight = 600) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.paddleSpeed = 400; // pixels per second
    this.gravity = 0; // No gravity in Breakout
  }

  /**
   * Update ball and paddle positions based on deltaTime.
   * Main entry point for physics simulation.
   *
   * @param {number} deltaTime - Time since last frame (in seconds)
   * @param {Object} gameState - Current game state
   */
  update(deltaTime, gameState) {
    if (gameState.isPaused) {
      return;
    }

    // Update ball position (applies speed multiplier)
    this.updateBallPosition(deltaTime, gameState);

    // Update paddle position and enforce bounds
    this.updatePaddlePosition(deltaTime, gameState);
  }

  /**
   * Update ball position and apply speed multiplier.
   * Formula: x += (vx * speedMultiplier) * deltaTime
   *          y += (vy * speedMultiplier) * deltaTime
   *
   * @param {number} deltaTime - Time delta (in seconds)
   * @param {Object} gameState - Current game state
   */
  updateBallPosition(deltaTime, gameState) {
    const ball = gameState.ball;
    const speedFactor = gameState.speedMultiplier;

    // Apply speed multiplier to velocity, then integrate position
    const adjustedVx = ball.vx * speedFactor;
    const adjustedVy = ball.vy * speedFactor;

    ball.x += adjustedVx * deltaTime;
    ball.y += adjustedVy * deltaTime;
  }

  /**
   * Update paddle position based on velocity and clamp to bounds.
   * Formula: x += vx * deltaTime
   * Then clamp x to [0, canvasWidth - paddleWidth]
   *
   * @param {number} deltaTime - Time delta (in seconds)
   * @param {Object} gameState - Current game state
   */
  updatePaddlePosition(deltaTime, gameState) {
    const paddle = gameState.paddle;

    // Update position: x += vx * dt
    paddle.x += paddle.vx * deltaTime;

    // Clamp paddle to screen bounds
    this.clampPaddleToBounds(paddle);
  }

  /**
   * Clamp paddle X position to valid screen bounds.
   * Ensures paddle does not extend beyond left or right edge of canvas.
   *
   * Bounds: [0, canvasWidth - paddleWidth]
   *
   * @param {Object} paddle - Paddle object { x, y, width, height, vx }
   */
  clampPaddleToBounds(paddle) {
    const minX = 0;
    const maxX = this.canvasWidth - paddle.width;
    paddle.x = Math.max(minX, Math.min(maxX, paddle.x));
  }

  /**
   * Apply speed multiplier and update game state.
   * Clamps multiplier to [0.5, 2.0] range.
   *
   * @param {number} multiplier - Speed multiplier factor (0.5 - 2.0)
   * @param {Object} gameState - Current game state
   */
  applySpeedMultiplier(multiplier, gameState) {
    gameState.setSpeedMultiplier(multiplier);
  }

  /**
   * Set canvas dimensions for boundary checking.
   * Called during initialization or when canvas is resized.
   *
   * @param {number} width - Canvas width (pixels)
   * @param {number} height - Canvas height (pixels)
   */
  setCanvasDimensions(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * Reflect ball velocity on X axis (for wall/paddle collisions).
   * Multiplies vx by -1 to reverse horizontal direction.
   *
   * @param {Object} ball - Ball object { x, y, vx, vy, radius }
   */
  reflectBallX(ball) {
    ball.vx *= -1;
  }

  /**
   * Reflect ball velocity on Y axis (for ceiling/floor collisions).
   * Multiplies vy by -1 to reverse vertical direction.
   *
   * @param {Object} ball - Ball object { x, y, vx, vy, radius }
   */
  reflectBallY(ball) {
    ball.vy *= -1;
  }
}
