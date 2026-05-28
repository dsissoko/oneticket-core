/**
 * GameLoop.js
 * Orchestrates the main game loop.
 * Synchronizes input, physics, collision detection, and rendering at 60 FPS.
 */

class GameLoop {
  /**
   * Initialize game loop with all subsystems.
   * @param {GameState} gameState - Game state manager
   * @param {Physics} physics - Physics engine
   * @param {CollisionDetector} collisionDetector - Collision detector
   * @param {Renderer} renderer - Renderer
   * @param {InputHandler} inputHandler - Input handler
   * @param {MenuController} menuController - Menu controller
   */
  constructor(gameState, physics, collisionDetector, renderer, inputHandler, menuController) {
    this.gameState = gameState;
    this.physics = physics;
    this.collisionDetector = collisionDetector;
    this.renderer = renderer;
    this.inputHandler = inputHandler;
    this.menuController = menuController;

    this.lastFrameTime = 0;
    this.animationFrameId = null;
    this.isRunning = false;

    // Initialize game state
    this.initializeGame();

    // Register menu callbacks
    this.registerMenuCallbacks();
  }

  /**
   * Initialize game state with default values and layouts.
   */
  initializeGame() {
    const brickFactory = new BrickFactory();

    this.gameState.bricks = brickFactory.createInitialLayout();
    this.gameState.phase = 'menu';

    // Set canvas dimensions
    const canvasWidth = this.renderer.canvas.width;
    const canvasHeight = this.renderer.canvas.height;

    this.physics.setCanvasDimensions(canvasWidth, canvasHeight);
    this.collisionDetector.setCanvasDimensions(canvasWidth, canvasHeight);

    // Initialize ball
    this.gameState.ball = {
      x: canvasWidth / 2,
      y: canvasHeight - 80,
      vx: 200,
      vy: -200,
      radius: 6,
    };

    // Initialize paddle
    this.gameState.paddle = {
      x: canvasWidth / 2,
      y: canvasHeight - 30,
      width: 80,
      height: 15,
      vx: 0,
    };
  }

  /**
   * Register menu controller callbacks.
   */
  registerMenuCallbacks() {
    this.menuController.on('startGame', () => this.startGame());
    this.menuController.on('replay', () => this.replay());
    this.menuController.on('returnToMenu', () => this.returnToMenu());
    this.menuController.on('setSpeed', (value) => this.setSpeedMultiplier(value));
    this.menuController.on('showOptions', () => this.showOptions());
    this.menuController.on('backFromOptions', () => this.showMenu());
  }

  /**
   * Start the main game loop.
   */
  run() {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.gameLoop(performance.now());
  }

  /**
   * Main game loop function (called by requestAnimationFrame).
   * @param {number} currentTime - Current timestamp
   */
  gameLoop(currentTime) {
    // Calculate delta time
    const deltaTime = Math.max(0, (currentTime - this.lastFrameTime) / 1000);
    this.lastFrameTime = currentTime;

    // Only process physics and collisions during gameplay
    if (this.gameState.phase === 'playing') {
      // 1. Process input
      this.inputHandler.update(this.gameState);

      // 2. Update physics — cap deltaTime to avoid large jumps after menu
      const cappedDelta = Math.min(deltaTime, 0.05);
      this.physics.update(cappedDelta, this.gameState);

      // 3. Detect and resolve collisions
      this.handleCollisions();

      // 4. Check win/loss conditions
      this.checkGameConditions();
    }

    // 5. Render always (menu, playing, victory, gameover)
    this.renderer.draw(this.gameState);

    // Continue loop
    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }
  }

  /**
   * Handle all collisions in the current frame.
   */
  handleCollisions() {
    const collisionResult = this.collisionDetector.detectAndResolve(this.gameState);

    if (collisionResult === 'ball-lost') {
      this.handleBallLost();
    } else if (collisionResult === 'brick-destroyed') {
      // Brick destruction already handled by collision detector
    } else if (collisionResult === 'paddle-bounce') {
      // Paddle bounce already handled by collision detector
    }
  }

  /**
   * Handle ball lost (fell below play area).
   */
  handleBallLost() {
    this.gameState.decrementLives();

    if (this.gameState.isGameOver()) {
      this.handleGameOver();
    } else {
      // Reset ball and paddle for next life
      this.resetBallAndPaddle();
    }
  }

  /**
   * Check win and loss conditions.
   */
  checkGameConditions() {
    if (this.gameState.phase !== 'playing') {
      return;
    }

    if (this.gameState.isVictory()) {
      this.handleVictory();
    }

    if (this.gameState.isGameOver()) {
      this.handleGameOver();
    }
  }

  /**
   * Handle victory condition (all bricks destroyed).
   */
  handleVictory() {
    this.gameState.isWon = true;
    this.gameState.setPhase('victory');
    this.renderer.renderVictory();
  }

  /**
   * Handle game over condition (lives exhausted).
   */
  handleGameOver() {
    this.gameState.setPhase('gameover');
    this.renderer.renderGameOver();
  }

  /**
   * Reset ball and paddle for next life.
   */
  resetBallAndPaddle() {
    const canvasWidth = this.renderer.canvas.width;
    const canvasHeight = this.renderer.canvas.height;

    this.gameState.ball.x = canvasWidth / 2;
    this.gameState.ball.y = canvasHeight - 80;
    this.gameState.ball.vx = 200;
    this.gameState.ball.vy = -200;

    this.gameState.paddle.x = canvasWidth / 2;
    this.gameState.paddle.vx = 0;
  }

  /**
   * Handle game phase transitions.
   * @param {string} newPhase - New game phase
   */
  handleGamePhaseChange(newPhase) {
    this.gameState.setPhase(newPhase);

    if (newPhase === 'playing') {
      // Resume physics and input processing
    } else if (newPhase === 'menu') {
      // Pause physics
    }
  }

  /**
   * Check win condition (all bricks destroyed).
   * @returns {boolean} True if all bricks destroyed
   */
  checkWinCondition() {
    return this.gameState.isVictory();
  }

  /**
   * Check loss condition (lives exhausted).
   * @returns {boolean} True if lives <= 0
   */
  checkLossCondition() {
    return this.gameState.isGameOver();
  }

  /**
   * Start game action.
   */
  startGame() {
    this.gameState.resetGame();
    const brickFactory = new BrickFactory();
    this.gameState.bricks = brickFactory.createInitialLayout();
    this.resetBallAndPaddle();
    this.gameState.setPhase('playing');
    this.renderer.hideMenuOverlay();
  }

  /**
   * Replay game action.
   */
  replay() {
    this.startGame();
  }

  /**
   * Return to menu action.
   */
  returnToMenu() {
    this.showMenu();
  }

  /**
   * Show main menu.
   */
  showMenu() {
    this.gameState.setPhase('menu');
    this.renderer.renderMenu();
  }

  /**
   * Show options menu.
   */
  showOptions() {
    this.renderer.renderOptions();
  }

  /**
   * Set speed multiplier.
   * @param {number} value - Speed multiplier (0.5-2.0)
   */
  setSpeedMultiplier(value) {
    this.gameState.setSpeedMultiplier(value);
  }

  /**
   * Stop the game loop.
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
window.GameLoop = GameLoop;
