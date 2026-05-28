/**
 * BrickFactory.js
 * Creates and manages brick layouts for the game.
 * Responsible for generating the initial brick arrangement.
 */

class BrickFactory {
  /**
   * Initialize brick factory with default parameters.
   */
  constructor() {
    this.brickWidth = 60;
    this.brickHeight = 15;
    this.brickPaddingX = 8;
    this.brickPaddingY = 8;
    this.rows = 5;
    this.columns = 10;
    this.colors = ['#ff6b6b', '#ffa500', '#ffd700', '#4ade80', '#00d4ff'];
  }

  /**
   * Create initial brick layout.
   * Generates a 5x10 grid of bricks evenly spaced.
   * @returns {Array} Array of brick objects
   */
  createInitialLayout() {
    const bricks = [];
    let brickId = 0;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const brick = {
          id: brickId++,
          x: col * (this.brickWidth + this.brickPaddingX) + this.brickPaddingX,
          y: row * (this.brickHeight + this.brickPaddingY) + this.brickPaddingY + 40,
          width: this.brickWidth,
          height: this.brickHeight,
          color: this.colors[row % this.colors.length],
          isDestroyed: false,
        };
        bricks.push(brick);
      }
    }

    return bricks;
  }

  /**
   * Create a single brick object.
   * @param {number} x - Brick X position
   * @param {number} y - Brick Y position
   * @param {string} color - Brick color
   * @param {number} id - Unique brick identifier
   * @returns {Object} Brick object
   */
  createBrick(x, y, color, id) {
    return {
      id,
      x,
      y,
      width: this.brickWidth,
      height: this.brickHeight,
      color,
      isDestroyed: false,
    };
  }

  /**
   * Get color for a specific row.
   * @param {number} row - Row index (0-4)
   * @returns {string} CSS color string
   */
  getColorForRow(row) {
    return this.colors[row % this.colors.length];
  }
}
window.BrickFactory = BrickFactory;
