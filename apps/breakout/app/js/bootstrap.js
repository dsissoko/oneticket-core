/**
 * Bootstrap — Initialize and start the game
 */

// Global game controller
window.gameController = {
  gameState: null,
  gameLoop: null,
  renderer: null,
  brickFactory: null,

  /**
   * Initialize the game
   */
  init() {
    console.log("Initializing Breakout game...");

    // Create instances
    this.brickFactory = new BrickFactory(800, 600);
    const initialBricks = this.brickFactory.createInitialLayout();
    
    this.gameState = new GameState(initialBricks);
    this.renderer = new Renderer("gameCanvas");
    this.gameLoop = new GameLoop(this.gameState, this.renderer);

    console.log(`Bricks created: ${initialBricks.length}`);
    console.log("Canvas initialized: 800×600");

    // Render initial menu
    this.gameState.phase = "menu";
    this.renderer.draw(this.gameState);
  },

  /**
   * Handle start game button
   */
  handleStartGame() {
    console.log("Start game triggered");
    this.gameState.resetGame(this.brickFactory.createInitialLayout());
    this.gameState.phase = "playing";
    this.gameLoop.start();
  },

  /**
   * Handle options button
   */
  handleOptions() {
    console.log("Options triggered");
    // Placeholder for options screen
  },

  /**
   * Handle replay button
   */
  handleReplay() {
    console.log("Replay triggered");
    this.gameState.resetGame(this.brickFactory.createInitialLayout());
    this.gameState.phase = "playing";
    this.gameLoop.start();
  },

  /**
   * Handle return to menu button
   */
  handleReturnToMenu() {
    console.log("Return to menu triggered");
    this.gameLoop.stop();
    this.gameState.phase = "menu";
    this.renderer.draw(this.gameState);
  }
};

// Start the game when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.gameController.init();
});
