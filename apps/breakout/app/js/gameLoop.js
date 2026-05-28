/**
 * GameLoop.js
 * 
 * Purpose: Orchestrates each frame; synchronizes all subsystems.
 * 
 * Responsibilities:
 * - Call inputHandler.update() to process keyboard/mouse input
 * - Call physics.update(deltaTime) to move ball and paddle
 * - Call collisionDetector.detectAndResolve() to handle collisions
 * - Call renderer.draw() to render canvas
 * - Check win/loss/game-over conditions
 * - Manage game phase transitions (menu → playing → victory/gameover)
 * 
 * Frame-Driven Model: All updates driven by requestAnimationFrame for 60 FPS consistency.
 */

class GameLoop {
  /**
   * Creates a new GameLoop instance.
   * 
   * @param {GameState} gameState - The game state manager
   * @param {InputHandler} inputHandler - The input event handler
   * @param {Physics} physics - The physics engine
   * @param {CollisionDetector} collisionDetector - The collision detection system
   * @param {Renderer} renderer - The renderer
   */
  constructor(gameState, inputHandler, physics, collisionDetector, renderer) {
    this.gameState = gameState;
    this.inputHandler = inputHandler;
    this.physics = physics;
    this.collisionDetector = collisionDetector;
    this.renderer = renderer;

    // Frame tracking for delta-time calculation
    this.lastFrameTime = 0;
    this.animationFrameId = null;
    this.isRunning = false;

    // Bind the frame loop to preserve `this` context
    this.frameLoop = this.frameLoop.bind(this);
  }

  /**
   * Starts the game loop using requestAnimationFrame.
   * 
   * Initializes the game loop scheduler and begins continuous frame rendering.
   * Each frame executes:
   * 1. Process Input → Update State
   * 2. Update Physics (Δt)
   * 3. Detect & Resolve Collisions
   * 4. Render Canvas
   * 5. Check Win/Loss Conditions
   */
  run() {
    if (this.isRunning) {
      console.warn('GameLoop is already running');
      return;
    }

    this.isRunning = true;
    this.lastFrameTime = performance.now();

    // Start the animation frame loop
    this.animationFrameId = requestAnimationFrame(this.frameLoop);
  }

  /**
   * Stops the game loop.
   * 
   * Cancels the requestAnimationFrame scheduler and halts frame rendering.
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isRunning = false;
  }

  /**
   * Main frame loop executed every frame via requestAnimationFrame.
   * 
   * Implements the frame-driven model:
   * 1. Calculate delta time since last frame
   * 2. Process input from keyboard/mouse
   * 3. Update physics based on delta time
   * 4. Detect and resolve collisions
   * 5. Render the game state
   * 6. Check game phase transitions
   * 
   * @param {DOMHighResTimeStamp} currentTime - The current time in milliseconds
   */
  frameLoop(currentTime) {
    // Calculate delta time in seconds
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    // Only process game logic if the game is actively playing
    if (this.gameState.phase === 'playing' && !this.gameState.isPaused) {
      // 1. Process Input → Update State
      this.inputHandler.update(this.gameState);

      // 2. Update Physics (Δt)
      this.physics.update(deltaTime, this.gameState);

      // 3. Detect & Resolve Collisions
      this.collisionDetector.detectAndResolve(this.gameState);

      // 4. Check Win/Loss/Game-Over Conditions
      this.checkGameConditions();
    }

    // 5. Render Canvas (execute every frame regardless of game phase)
    this.renderer.draw(this.gameState);

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(this.frameLoop);
  }

  /**
   * Checks for win, loss, and game-over conditions.
   * 
   * Evaluates:
   * - Victory: All bricks destroyed
   * - Loss/Game-Over: Lives exhausted
   * - Game phase transitions based on conditions
   */
  checkGameConditions() {
    if (this.checkWinCondition()) {
      this.handleGamePhaseChange('victory');
    } else if (this.checkLossCondition()) {
      this.handleGamePhaseChange('gameover');
    }
  }

  /**
   * Checks if the player has won (all bricks destroyed).
   * 
   * @returns {boolean} True if all bricks are destroyed, false otherwise
   */
  checkWinCondition() {
    const allBricksDestroyed = this.gameState.bricks.every(
      (brick) => brick.isDestroyed
    );
    return allBricksDestroyed;
  }

  /**
   * Checks if the player has lost (no lives remaining).
   * 
   * @returns {boolean} True if lives === 0, false otherwise
   */
  checkLossCondition() {
    return this.gameState.lives === 0;
  }

  /**
   * Handles game phase transitions.
   * 
   * Updates game state with the new phase and adjusts game loop behavior
   * (e.g., stop physics updates during menu/game-over states).
   * 
   * Phases: "menu" | "playing" | "victory" | "gameover"
   * 
   * @param {string} newPhase - The new game phase
   */
  handleGamePhaseChange(newPhase) {
    const oldPhase = this.gameState.phase;
    this.gameState.phase = newPhase;

    // Log phase transition for debugging
    console.log(`Game phase changed: ${oldPhase} → ${newPhase}`);

    // Stop physics updates when exiting the playing phase
    if (oldPhase === 'playing' && newPhase !== 'playing') {
      console.log('Physics updates suspended');
    }

    // Resume physics updates when entering the playing phase
    if (oldPhase !== 'playing' && newPhase === 'playing') {
      console.log('Physics updates resumed');
    }
  }
}
