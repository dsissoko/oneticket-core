/**
 * BrickFactory — Creates and manages brick layout
 * 
 * Generates initial brick arrangement for the game.
 * Layout: 5 rows × 10 bricks per row (50 total bricks)
 */

class BrickFactory {
  constructor(canvasWidth = 800, canvasHeight = 600) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // Brick layout parameters
    this.brickWidth = 70;
    this.brickHeight = 15;
    this.brickPadding = 5;
    this.topOffset = 30;
    
    // Brick row colors (5 rows, 5 colors)
    this.colors = ["#FF6B6B", "#FFA500", "#FFD93D", "#6BCB77", "#4D96FF"];
  }

  /**
   * Create initial brick layout
   * Returns array of brick objects
   */
  createInitialLayout() {
    const bricks = [];
    let brickId = 0;
    
    // 5 rows of bricks
    const rows = 5;
    const bricksPerRow = 10;
    
    // Calculate total width needed
    const totalBrickWidth = (this.brickWidth * bricksPerRow) + (this.brickPadding * (bricksPerRow - 1));
    const startX = (this.canvasWidth - totalBrickWidth) / 2;
    
    for (let row = 0; row < rows; row++) {
      const y = this.topOffset + (row * (this.brickHeight + this.brickPadding));
      const color = this.colors[row];
      
      for (let col = 0; col < bricksPerRow; col++) {
        const x = startX + (col * (this.brickWidth + this.brickPadding));
        
        bricks.push({
          id: brickId++,
          x: x,
          y: y,
          width: this.brickWidth,
          height: this.brickHeight,
          color: color,
          isDestroyed: false
        });
      }
    }
    
    return bricks;
  }
}
