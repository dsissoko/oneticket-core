/**
 * GameState — Single source of truth for all game data
 * 
 * Manages game state: phase, lives, bricks, ball, paddle, speed multiplier.
 * Provides methods to update state and check win/loss conditions.
 */

class GameState {
  constructor(options = {}) {
    // Game phase: "menu", "playing", "victory", "gameover"
    this.phase = options.phase || "menu";
    
    // Lives (0-3)
    this.lives = options.lives !== undefined ? options.lives : 3;
    
    // Array of brick objects: { id, x, y, width, height, color, isDestroyed }
    this.bricks = options.bricks || [];
    
    // Ball: { x, y, vx, vy, radius }
    this.ball = options.ball || {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 5
    };
    
    // Paddle: { x, y, width, height, vx }
    this.paddle = options.paddle || {
      x: 0,
      y: 0,
      width: 60,
      height: 10,
      vx: 0
    };
    
    // Speed multiplier (0.5 - 2.0)
    this.speedMultiplier = options.speedMultiplier || 1.0;
    
    // Pause state
    this.isPaused = options.isPaused || false;
    
    // Score (for future use)
    this.score = options.score || 0;
    
    // Victory flag
    this.isWon = options.isWon || false;
  }

  /**
   * Reset game to initial state
   * Clears all bricks, resets ball position, resets lives to 3
   */
  resetGame(initialBricks = []) {
    this.phase = "menu";
    this.lives = 3;
    this.bricks = JSON.parse(JSON.stringify(initialBricks)); // Deep copy
    this.ball = {
      x: this.paddle.x,
      y: this.paddle.y - 20,
      vx: 0,
      vy: 0,
      radius: 5
    };
    this.paddle.vx = 0;
    this.speedMultiplier = 1.0;
    this.isPaused = false;
    this.score = 0;
    this.isWon = false;
  }

  /**
   * Decrement lives by 1
   * Triggers game over if lives reach 0
   */
  decrementLives() {
    if (this.lives > 0) {
      this.lives--;
    }
    if (this.lives === 0) {
      this.phase = "gameover";
    }
  }

  /**
   * Check if game is over (no lives left)
   * @returns {boolean} True if lives === 0
   */
  isGameOver() {
    return this.lives === 0;
  }

  /**
   * Check if player has won (all bricks destroyed)
   * @returns {boolean} True if all bricks are destroyed
   */
  isVictory() {
    // Victory condition: all bricks destroyed (empty array or all marked as destroyed)
    return this.bricks.length === 0 || this.bricks.every(brick => brick.isDestroyed);
  }

  /**
   * Set speed multiplier and clamp to valid range [0.5, 2.0]
   * @param {number} factor Speed multiplier factor (0.5 - 2.0)
   */
  setSpeedMultiplier(factor) {
    // Validate and clamp to [0.5, 2.0]
    this.speedMultiplier = Math.max(0.5, Math.min(2.0, factor));
  }

  /**
   * Remove brick from the game state
   * @param {string|number} brickId Unique brick identifier
   */
  removeBrick(brickId) {
    this.bricks = this.bricks.filter(brick => brick.id !== brickId);
  }

  /**
   * Mark brick as destroyed without removing from array
   * @param {string|number} brickId Unique brick identifier
   */
  destroyBrick(brickId) {
    const brick = this.bricks.find(b => b.id === brickId);
    if (brick) {
      brick.isDestroyed = true;
    }
  }

  /**
   * Toggle pause state
   * @param {boolean} isPaused Pause state
   */
  setPause(isPaused) {
    this.isPaused = isPaused;
  }

  /**
   * Get a copy of the current state (for debugging/logging)
   * @returns {object} Shallow copy of current game state
   */
  getState() {
    return {
      phase: this.phase,
      lives: this.lives,
      brickCount: this.bricks.length,
      ball: { ...this.ball },
      paddle: { ...this.paddle },
      speedMultiplier: this.speedMultiplier,
      isPaused: this.isPaused,
      score: this.score,
      isWon: this.isWon
    };
  }
}

// Export for use in other modules
export default GameState;
