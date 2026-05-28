/**
 * Physics Engine — Updates ball and paddle position/velocity based on deltaTime.
 * 
 * Purpose: Calculate motion for all game objects each frame.
 * 
 * Responsibilities:
 * - Update ball position: x += vx * dt, y += vy * dt
 * - Apply speed multiplier to ball velocity
 * - Update paddle position based on input velocity
 * - Clamp paddle to screen bounds
 * - Handle frame-independent movement via delta-time
 * 
 * Frame-Driven Model: All updates are delta-time based for consistent motion
 * across variable frame rates.
 */

class Physics {
  /**
   * Creates a new Physics engine instance.
   * 
   * @param {object} options Configuration options
   * @param {number} options.canvasWidth Canvas width in pixels (default: 800)
   * @param {number} options.canvasHeight Canvas height in pixels (default: 600)
   */
  constructor(options = {}) {
    this.canvasWidth = options.canvasWidth || 800;
    this.canvasHeight = options.canvasHeight || 600;

    // Debug logging flag
    this.debugMode = options.debugMode || false;
    this.logCounter = 0;
  }

  /**
   * Update ball and paddle position/velocity based on deltaTime.
   * 
   * This is the main physics update method called every frame by the game loop.
   * 
   * Steps:
   * 1. Update ball position: ball.x += ball.vx * deltaTime, ball.y += ball.vy * deltaTime
   * 2. Apply speed multiplier to ball velocity: vx *= speedMultiplier, vy *= speedMultiplier
   * 3. Update paddle position: paddle.x += paddle.vx * deltaTime
   * 4. Clamp paddle to screen bounds: [0, canvasWidth - paddleWidth]
   * 
   * @param {number} deltaTime Time elapsed since last frame in seconds
   * @param {GameState} gameState The current game state (contains ball, paddle, speedMultiplier)
   */
  update(deltaTime, gameState) {
    if (!gameState) {
      throw new Error('Physics.update() requires a GameState object');
    }

    if (deltaTime <= 0) {
      // Skip update if deltaTime is invalid (prevents negative/zero time steps)
      return;
    }

    // Clamp deltaTime to prevent large jumps (common at app startup or tab switch)
    const MAX_DELTA_TIME = 0.05; // 50ms max per frame
    const clampedDeltaTime = Math.min(deltaTime, MAX_DELTA_TIME);

    // Step 1: Update ball position based on velocity
    this.updateBallPosition(clampedDeltaTime, gameState);

    // Step 2: Apply speed multiplier to ball velocity
    this.applySpeedMultiplier(gameState);

    // Step 3: Update paddle position and clamp to bounds
    this.updatePaddlePosition(clampedDeltaTime, gameState);

    // Debug logging (every 10 frames if enabled)
    if (this.debugMode) {
      this.logCounter++;
      if (this.logCounter >= 10) {
        this.logPhysicsState(gameState);
        this.logCounter = 0;
      }
    }
  }

  /**
   * Update ball position based on current velocity and deltaTime.
   * 
   * Formula: position += velocity * deltaTime
   * This provides frame-independent motion.
   * 
   * @private
   * @param {number} deltaTime Time elapsed since last frame in seconds
   * @param {GameState} gameState The current game state
   */
  updateBallPosition(deltaTime, gameState) {
    const { ball } = gameState;

    if (!ball) {
      throw new Error('GameState must contain a ball object');
    }

    // Update X position
    ball.x += ball.vx * deltaTime;

    // Update Y position
    ball.y += ball.vy * deltaTime;
  }

  /**
   * Apply speed multiplier to ball velocity.
   * 
   * The speed multiplier (0.5 - 2.0) scales the ball's velocity magnitude
   * without changing its direction.
   * 
   * Formula: vx *= speedMultiplier, vy *= speedMultiplier
   * 
   * @private
   * @param {GameState} gameState The current game state
   */
  applySpeedMultiplier(gameState) {
    const { ball, speedMultiplier } = gameState;

    if (!ball) {
      throw new Error('GameState must contain a ball object');
    }

    if (speedMultiplier === undefined || speedMultiplier === null) {
      throw new Error('GameState must contain a speedMultiplier');
    }

    // Validate speedMultiplier is in valid range [0.5, 2.0]
    const clampedMultiplier = Math.max(0.5, Math.min(2.0, speedMultiplier));

    // Apply multiplier to both velocity components
    ball.vx *= clampedMultiplier;
    ball.vy *= clampedMultiplier;
  }

  /**
   * Update paddle position based on velocity and clamp to screen bounds.
   * 
   * Steps:
   * 1. Update X position: paddle.x += paddle.vx * deltaTime
   * 2. Clamp to bounds: [0, canvasWidth - paddleWidth]
   * 
   * The paddle Y position is fixed (always at bottom of play area).
   * 
   * @private
   * @param {number} deltaTime Time elapsed since last frame in seconds
   * @param {GameState} gameState The current game state
   */
  updatePaddlePosition(deltaTime, gameState) {
    const { paddle } = gameState;

    if (!paddle) {
      throw new Error('GameState must contain a paddle object');
    }

    // Update X position based on velocity
    paddle.x += paddle.vx * deltaTime;

    // Clamp paddle X to valid range [0, canvasWidth - paddleWidth]
    const minX = 0;
    const maxX = this.canvasWidth - paddle.width;

    paddle.x = Math.max(minX, Math.min(maxX, paddle.x));
  }

  /**
   * Log current physics state for debugging.
   * 
   * Outputs ball position/velocity and paddle position/velocity.
   * Called every 10 frames when debugMode is enabled.
   * 
   * @private
   * @param {GameState} gameState The current game state
   */
  logPhysicsState(gameState) {
    const { ball, paddle } = gameState;

    console.log(
      `Physics Update - Ball: (${ball.x.toFixed(2)}, ${ball.y.toFixed(2)}) ` +
      `vx=${ball.vx.toFixed(2)} vy=${ball.vy.toFixed(2)} | ` +
      `Paddle: x=${paddle.x.toFixed(2)} vx=${paddle.vx.toFixed(2)}`
    );
  }
}

// Export for use in other modules
export default Physics;
