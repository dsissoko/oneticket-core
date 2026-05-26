/**
 * GameState - Manages the complete state of the Breakout game
 * Handles game initialization, entity placement, and game lifecycle
 */

class GameState {
  constructor(canvasWidth = 800, canvasHeight = 600) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.paddle = null;
    this.ball = null;
    this.bricks = [];
    this.score = 0;
    this.status = 'init'; // 'init' | 'playing' | 'gameover'
  }

  /**
   * Initialize the game state
   * Creates the brick grid (3 rows x 6 cols)
   * Places paddle at bottom center
   * Places ball at center
   */
  init() {
    // Initialize paddle at bottom center
    this.paddle = {
      x: this.canvasWidth / 2 - 40, // 80px width, centered
      y: this.canvasHeight - 20,
      width: 80,
      height: 10
    };

    // Initialize ball at center
    this.ball = {
      x: this.canvasWidth / 2,
      y: this.canvasHeight / 2,
      radius: 5,
      vx: 3, // velocity x
      vy: -3 // velocity y
    };

    // Initialize brick grid (3 rows x 6 cols)
    this.bricks = [];
    const brickWidth = 100;
    const brickHeight = 15;
    const startX = 50;
    const startY = 50;
    const spacing = 10;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        this.bricks.push({
          x: startX + col * (brickWidth + spacing),
          y: startY + row * (brickHeight + spacing),
          width: brickWidth,
          height: brickHeight,
          active: true
        });
      }
    }

    this.score = 0;
    this.status = 'playing';
  }

  /**
   * Reset the game to its initial state
   * Resets all entities to initial values and sets status to 'playing'
   */
  resetGame() {
    this.paddle = {
      x: this.canvasWidth / 2 - 40,
      y: this.canvasHeight - 20,
      width: 80,
      height: 10
    };

    this.ball = {
      x: this.canvasWidth / 2,
      y: this.canvasHeight / 2,
      radius: 5,
      vx: 3,
      vy: -3
    };

    // Reset bricks
    this.bricks.forEach(brick => {
      brick.active = true;
    });

    this.score = 0;
    this.status = 'playing';
  }

  /**
   * End the game
   * Sets status to 'gameover'
   */
  endGame() {
    this.status = 'gameover';
  }

  /**
   * Check for game over condition
   * If ball falls below canvas height, end the game
   */
  checkGameOver() {
    if (this.ball.y > this.canvasHeight) {
      this.endGame();
    }
  }

  /**
   * Get the current game state
   * @returns {Object} Current game state
   */
  getState() {
    return {
      paddle: this.paddle,
      ball: this.ball,
      bricks: this.bricks,
      score: this.score,
      status: this.status
    };
  }
}

module.exports = GameState;
