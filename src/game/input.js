/**
 * InputHandler Module
 * 
 * Manages keyboard input for paddle control in the breakout game.
 * Maintains state of active keys and applies movement updates to the game state.
 */

class InputHandler {
  constructor() {
    // Track which keys are currently pressed
    this.activeKeys = new Set();
    
    // Key bindings for paddle movement
    this.keyBindings = {
      left: ['ArrowLeft', 'a', 'A'],
      right: ['ArrowRight', 'd', 'D']
    };
  }

  /**
   * Initialize input handling
   * Attaches keydown and keyup event listeners to the window
   * 
   * @param {Object} gameState - The current game state object
   * @param {Window} window - The window object for event listeners
   */
  init(gameState, window) {
    // Handle keydown events
    window.addEventListener('keydown', (event) => {
      // Only track keys we care about
      if (this._isRelevantKey(event.key)) {
        this.activeKeys.add(event.key);
        // Prevent default behavior for arrow keys
        if (event.key.startsWith('Arrow')) {
          event.preventDefault();
        }
      }
    });

    // Handle keyup events
    window.addEventListener('keyup', (event) => {
      if (this._isRelevantKey(event.key)) {
        this.activeKeys.delete(event.key);
      }
    });
  }

  /**
   * Update game state based on active input
   * Applies paddle movement according to active keys
   * 
   * @param {Object} gameState - The current game state containing paddle and canvas data
   */
  update(gameState) {
    if (!gameState || !gameState.paddle || !gameState.canvas) {
      return;
    }

    const paddle = gameState.paddle;
    const canvas = gameState.canvas;
    const moveDistance = gameState.paddleSpeed || 5; // Default movement speed

    // Check for left movement
    const moveLeft = this.keyBindings.left.some(key => this.activeKeys.has(key));
    if (moveLeft) {
      paddle.x -= moveDistance;
    }

    // Check for right movement
    const moveRight = this.keyBindings.right.some(key => this.activeKeys.has(key));
    if (moveRight) {
      paddle.x += moveDistance;
    }

    // Clamp paddle position to canvas boundaries
    this._clampPaddlePosition(paddle, canvas);
  }

  /**
   * Check if a key is relevant to paddle control
   * 
   * @private
   * @param {string} key - The key code/name to check
   * @returns {boolean} True if the key controls paddle movement
   */
  _isRelevantKey(key) {
    return (
      this.keyBindings.left.includes(key) ||
      this.keyBindings.right.includes(key)
    );
  }

  /**
   * Constrain paddle position within canvas boundaries
   * 
   * @private
   * @param {Object} paddle - The paddle object with x and width properties
   * @param {Object} canvas - The canvas object with width property
   */
  _clampPaddlePosition(paddle, canvas) {
    // Minimum x is 0
    if (paddle.x < 0) {
      paddle.x = 0;
    }
    
    // Maximum x is canvas width minus paddle width
    const maxX = canvas.width - paddle.width;
    if (paddle.x > maxX) {
      paddle.x = maxX;
    }
  }

  /**
   * Get the current set of active keys
   * Useful for testing and debugging
   * 
   * @returns {Set} Set of currently pressed keys
   */
  getActiveKeys() {
    return new Set(this.activeKeys);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputHandler;
}
