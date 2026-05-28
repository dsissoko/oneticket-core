/**
 * GameState.js
 * Single source of truth for all game data.
 * Manages game phase, lives, ball, paddle, bricks, and game settings.
 */

class GameState {
  /**
   * Initialize game state with default values.
   */
  constructor() {
    this.resetGame();
  }

  /**
   * Reset game to initial state.
   * Called when starting a new game or replaying.
   */
  resetGame() {
    // Game phase: "menu" | "playing" | "victory" | "gameover"
    this.phase = 'menu';

    // Lives remaining (0-3)
    this.lives = 3;

    // Array of brick objects
    this.bricks = [];

    // Ball object: { x, y, vx, vy, radius }
    this.ball = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 0,
    };

    // Paddle object: { x, y, width, height, vx }
    this.paddle = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      vx: 0,
    };

    // Speed multiplier (0.5 - 2.0)
    this.speedMultiplier = 1.0;

    // Score (for future use)
    this.score = 0;

    // Victory flag
    this.isWon = false;

    // Pause state
    this.isPaused = false;
  }

  /**
   * Decrement lives by 1.
   */
  decrementLives() {
    if (this.lives > 0) {
      this.lives--;
    }
  }

  /**
   * Remove a brick by ID from the bricks array.
   * @param {string|number} id - Unique brick identifier
   */
  removeBrick(id) {
    this.bricks = this.bricks.filter((brick) => brick.id !== id);
  }

  /**
   * Set pause state.
   * @param {boolean} isPaused - Pause state
   */
  setPause(isPaused) {
    this.isPaused = isPaused;
  }

  /**
   * Set speed multiplier.
   * Clamps value to [0.5, 2.0] range.
   * @param {number} factor - Speed multiplier (0.5-2.0)
   */
  setSpeedMultiplier(factor) {
    this.speedMultiplier = Math.max(0.5, Math.min(2.0, factor));
  }

  /**
   * Check if game is over (lives exhausted).
   * @returns {boolean} True if lives <= 0
   */
  isGameOver() {
    return this.lives <= 0;
  }

  /**
   * Check if victory condition is met (all bricks destroyed).
   * @returns {boolean} True if no bricks remain
   */
  isVictory() {
    return this.bricks.length === 0;
  }

  /**
   * Transition to a new game phase.
   * @param {string} newPhase - New phase: "menu" | "playing" | "victory" | "gameover"
   */
  setPhase(newPhase) {
    this.phase = newPhase;
  }
}
