/**
 * BrickFactory — Creates and manages brick layouts for Breakout game
 * Responsible for initializing brick grid with positioning, colors, and unique IDs
 */

class BrickFactory {
  // Configuration constants
  static BRICK_ROWS = 5;
  static BRICK_COLS = 10;
  static BRICK_WIDTH = 80;
  static BRICK_HEIGHT = 20;
  static START_X = 0;
  static START_Y = 30;
  static BRICK_SPACING_Y = 20;

  // Color mapping for each row (rainbow progression)
  static COLORS = ['red', 'orange', 'yellow', 'green', 'blue'];

  /**
   * Creates initial brick layout (5 rows × 10 cols = 50 bricks)
   * Each brick gets a unique ID and positioned in grid
   *
   * @returns {Array<Object>} Array of 50 brick objects with properties:
   *   - id: string (unique identifier: "brick-{row}-{col}")
   *   - x: number (left position)
   *   - y: number (top position)
   *   - width: number (brick width in pixels)
   *   - height: number (brick height in pixels)
   *   - color: string (one of: red, orange, yellow, green, blue)
   *
   * @example
   * const bricks = brickFactory.createInitialLayout()
   * console.log(bricks.length) // 50
   * console.log(bricks[0]) // { id: "brick-0-0", x: 0, y: 30, width: 80, height: 20, color: "red" }
   */
  createInitialLayout() {
    const bricks = [];
    let brickId = 0;

    for (let row = 0; row < BrickFactory.BRICK_ROWS; row++) {
      const color = BrickFactory.COLORS[row];
      const y = BrickFactory.START_Y + row * BrickFactory.BRICK_SPACING_Y;

      for (let col = 0; col < BrickFactory.BRICK_COLS; col++) {
        const x = BrickFactory.START_X + col * BrickFactory.BRICK_WIDTH;

        const brick = {
          id: `brick-${row}-${col}`,
          x: x,
          y: y,
          width: BrickFactory.BRICK_WIDTH,
          height: BrickFactory.BRICK_HEIGHT,
          color: color,
        };

        bricks.push(brick);
        brickId++;
      }
    }

    return bricks;
  }
}

// Export for use in game loop
export default BrickFactory;
