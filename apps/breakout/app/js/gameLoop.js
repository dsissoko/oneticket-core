/**
 * GameLoop — Orchestrates the game at 60 FPS
 * 
 * Responsibilities:
 * - Schedule frames with requestAnimationFrame
 * - Call renderer.draw() each frame
 * - Manage game lifecycle
 */

class GameLoop {
  constructor(gameState, renderer) {
    this.gameState = gameState;
    this.renderer = renderer;
    
    this.isRunning = false;
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.fpsInterval = 1000; // Log FPS every 1 second
    this.fpsCheckTime = 0;
    
    // Bind run method to preserve context in requestAnimationFrame
    this.run = this.run.bind(this);
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) {
      console.log("Game loop already running");
      return;
    }
    
    console.log("Game loop started");
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.fpsCheckTime = performance.now();
    this.frameCount = 0;
    
    requestAnimationFrame(this.run);
  }

  /**
   * Stop the game loop
   */
  stop() {
    console.log("Game loop stopped");
    this.isRunning = false;
  }

  /**
   * Main game loop frame
   */
  run(currentTime) {
    if (!this.isRunning) {
      return;
    }

    // Calculate delta time
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;

    // Update frame counter and log FPS
    this.frameCount++;
    const elapsedTime = currentTime - this.fpsCheckTime;
    if (elapsedTime >= this.fpsInterval) {
      const fps = (this.frameCount / elapsedTime) * 1000;
      console.log(`FPS: ${fps.toFixed(1)}`);
      this.fpsCheckTime = currentTime;
      this.frameCount = 0;
    }

    // Render current frame
    this.renderer.draw(this.gameState);

    // Schedule next frame
    requestAnimationFrame(this.run);
  }

  /**
   * Handle game phase change
   */
  handleGamePhaseChange(newPhase) {
    console.log(`Phase changed to: ${newPhase}`);
    this.gameState.setPhase(newPhase);
    
    switch (newPhase) {
      case "playing":
        this.start();
        break;
      
      case "menu":
      case "victory":
      case "gameover":
        this.stop();
        break;
    }
  }

  /**
   * Check win condition
   */
  checkWinCondition() {
    if (this.gameState.isVictory()) {
      console.log("Victory condition met!");
      return true;
    }
    return false;
  }

  /**
   * Check loss condition
   */
  checkLossCondition() {
    if (this.gameState.isGameOver()) {
      console.log("Loss condition met!");
      return true;
    }
    return false;
  }
}
