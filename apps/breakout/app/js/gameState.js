/**
 * GameState — Single source of truth for game data
 * 
 * Maintains the complete game state including phase, lives,
 * bricks, ball, paddle, and settings.
 */

class GameState {
  constructor(bricks = []) {
    this.phase = "menu"; // "menu", "playing", "victory", "gameover"
    this.lives = 3;
    this.bricks = bricks;
    this.ball = {
      x: 400,
      y: 560,
      vx: 0,
      vy: 0,
      radius: 5
    };
    this.paddle = {
      x: 400, // center X
      y: 580,
      width: 60,
      height: 10,
      vx: 0
    };
    this.speedMultiplier = 1.0;
    this.isPaused = false;
    this.score = 0;
    this.isWon = false;
  }

  /**
   * Reset game to initial state (for new game)
   */
  resetGame(bricks) {
    this.phase = "playing";
    this.lives = 3;
    this.bricks = bricks;
    this.ball.x = 400;
    this.ball.y = 560;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.paddle.x = 400;
    this.paddle.vx = 0;
    this.speedMultiplier = 1.0;
    this.isPaused = false;
    this.score = 0;
    this.isWon = false;
  }

  /**
   * Decrement lives and check for game over
   */
  decrementLives() {
    if (this.lives > 0) {
      this.lives--;
    }
  }

  /**
   * Remove a brick by ID
   */
  removeBrick(brickId) {
    this.bricks = this.bricks.filter(brick => brick.id !== brickId);
  }

  /**
   * Set pause state
   */
  setPause(isPaused) {
    this.isPaused = isPaused;
  }

  /**
   * Set speed multiplier (clamp to 0.5 - 2.0)
   */
  setSpeedMultiplier(factor) {
    this.speedMultiplier = Math.max(0.5, Math.min(2.0, factor));
  }

  /**
   * Check if game is over (no lives left)
   */
  isGameOver() {
    return this.lives === 0;
  }

  /**
   * Check if player has won (all bricks destroyed)
   */
  isVictory() {
    return this.bricks.length === 0 && this.lives > 0;
  }

  /**
   * Transition to a new phase
   */
  setPhase(phase) {
    this.phase = phase;
  }
}
