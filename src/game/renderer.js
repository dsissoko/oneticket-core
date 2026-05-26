/**
 * Renderer module for the Breakout game
 * Handles canvas initialization and rendering of game elements
 */

class Renderer {
  /**
   * Initialize the Renderer with a canvas element
   * @param {HTMLCanvasElement} canvas - The canvas element to render on
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
  }

  /**
   * Main render method - clears canvas and redraws all game elements
   * @param {Object} gameState - The current game state containing paddle, ball, bricks, score
   */
  render(gameState) {
    this.clear();
    
    if (gameState.paddle) {
      this.drawPaddle(gameState.paddle);
    }
    
    if (gameState.ball) {
      this.drawBall(gameState.ball);
    }
    
    if (gameState.bricks) {
      this.drawBricks(gameState.bricks);
    }
    
    if (gameState.score !== undefined) {
      this.drawScore(gameState.score);
    }
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw the paddle
   * @param {Object} paddle - Paddle object with x, y, width, height properties
   */
  drawPaddle(paddle) {
    this.context.fillStyle = '#ffffff';
    this.context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }

  /**
   * Draw the ball
   * @param {Object} ball - Ball object with x, y, radius properties
   */
  drawBall(ball) {
    this.context.fillStyle = '#ffffff';
    this.context.beginPath();
    this.context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    this.context.fill();
  }

  /**
   * Draw all bricks
   * @param {Array} bricks - Array of brick objects with x, y, width, height properties
   */
  drawBricks(bricks) {
    this.context.fillStyle = '#ff6b6b';
    bricks.forEach(brick => {
      this.context.fillRect(brick.x, brick.y, brick.width, brick.height);
    });
  }

  /**
   * Draw the score
   * @param {number} score - The current score value
   */
  drawScore(score) {
    this.context.fillStyle = '#ffffff';
    this.context.font = '16px Arial';
    this.context.fillText(`Score: ${score}`, 10, 20);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Renderer;
}
