/**
 * GameLoop - Main game orchestration module for Breakout game
 * 
 * Coordinates all game systems including:
 * - GameState initialization and management
 * - Renderer for drawing game elements
 * - PhysicsEngine for ball movement and wall collisions
 * - InputHandler for paddle control
 * - CollisionDetector for brick and paddle collisions
 * - ScoreManager for score tracking
 * 
 * Implements a fixed-timestep game loop using requestAnimationFrame
 * Target: 60 FPS with frame-rate independent physics
 */

// Import game modules
const GameState = require('./gamestate');
const Renderer = require('./renderer');
const PhysicsEngine = require('./physics');
const InputHandler = require('./input');
const CollisionDetector = require('./collisions');
const ScoreManager = require('./score');

class GameLoop {
  constructor() {
    // Game configuration
    this.canvasWidth = 800;
    this.canvasHeight = 600;
    this.targetFPS = 60;
    this.frameTime = 1000 / this.targetFPS; // ~16.67ms per frame
    
    // Game systems
    this.gameState = null;
    this.renderer = null;
    this.physics = null;
    this.input = null;
    this.collisions = null;
    this.score = null;
    
    // Game loop control
    this.isRunning = false;
    this.lastFrameTime = 0;
    this.accumulator = 0;
    this.animationFrameId = null;
    
    // Game over state
    this.gameOverDisplayed = false;
  }

  /**
   * Initialize the game
   * Sets up all game systems and attaches to canvas
   */
  init() {
    // Get canvas element
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return false;
    }

    // Initialize GameState
    this.gameState = new GameState(this.canvasWidth, this.canvasHeight);
    this.gameState.init();
    
    // Add canvas reference to gameState for input handler
    this.gameState.canvas = canvas;
    this.gameState.paddleSpeed = 6;

    // Initialize Renderer
    this.renderer = new Renderer(canvas);

    // Initialize PhysicsEngine
    this.physics = new PhysicsEngine(this.canvasWidth, this.canvasHeight);

    // Initialize InputHandler
    this.input = new InputHandler();
    this.input.init(this.gameState, window);

    // Initialize CollisionDetector
    this.collisions = new CollisionDetector();

    // Initialize ScoreManager
    this.score = new ScoreManager(this.gameState);

    // Set up restart key handler
    this._setupRestartHandler();

    // Start the game loop
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this._gameLoopTick();

    console.log('Game initialized and started');
    return true;
  }

  /**
   * Main game loop tick
   * Uses requestAnimationFrame for smooth animations
   * 
   * Update order:
   * 1. Input handling (update paddle position)
   * 2. Physics simulation (update ball position and wall collisions)
   * 3. Collision detection (ball-brick and ball-paddle)
   * 4. Score update (based on collisions)
   * 5. Game over check
   * 6. Rendering
   */
  _gameLoopTick() {
    if (!this.isRunning) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;

    // Cap delta time to prevent physics instability on frame drops
    const cappedDeltaTime = Math.min(deltaTime, 0.05);

    // Only update game if playing
    if (this.gameState.status === 'playing') {
      // Step 1: Input handling
      this.input.update(this.gameState);

      // Step 2: Physics simulation
      this.physics.update(this.gameState, cappedDeltaTime);

      // Step 3: Collision detection
      // Check ball-brick collisions
      const brickCollisions = this.collisions.checkBallBrickCollisions(this.gameState);
      
      // Check ball-paddle collisions
      this.collisions.checkBallPaddleCollisions(this.gameState);

      // Step 4: Score update
      if (brickCollisions.length > 0) {
        brickCollisions.forEach(collision => {
          this.score.addScore(1);
        });
      }

      // Step 5: Check for game over condition
      this.gameState.checkGameOver();
      this.gameOverDisplayed = false;
    }

    // Step 6: Rendering
    this.renderer.render(this.gameState);

    // Draw game over message if game is over
    if (this.gameState.status === 'gameover' && !this.gameOverDisplayed) {
      this._drawGameOver();
      this.gameOverDisplayed = true;
    }

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(() => this._gameLoopTick());
  }

  /**
   * Set up the restart key handler
   * Listens for SPACE key to restart the game
   */
  _setupRestartHandler() {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space' && this.gameState.status === 'gameover') {
        event.preventDefault();
        this._restartGame();
      }
    });
  }

  /**
   * Restart the game
   * Resets all game state and resumes playing
   */
  _restartGame() {
    console.log('Restarting game...');
    this.gameState.resetGame();
    this.score.resetScore();
    this.gameOverDisplayed = false;
    console.log('Game restarted');
  }

  /**
   * Draw the game over screen
   * Displays "GAME OVER" and restart instructions
   */
  _drawGameOver() {
    const ctx = this.renderer.context;
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Game over text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', this.canvasWidth / 2, this.canvasHeight / 2 - 40);

    // Restart instruction
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE to restart', this.canvasWidth / 2, this.canvasHeight / 2 + 40);
    
    // Reset text alignment
    ctx.textAlign = 'left';
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Get current game state (for debugging/testing)
   */
  getGameState() {
    return this.gameState;
  }
}

// Initialize and start the game when DOM is ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const game = new GameLoop();
    game.init();
    
    // Expose game to global scope for debugging
    window.game = game;
  });
}

// Export for use in testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameLoop;
}
