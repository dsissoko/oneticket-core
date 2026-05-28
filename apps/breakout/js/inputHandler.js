/**
 * InputHandler.js
 * Captures and translates user input (keyboard, mouse) into game state changes.
 * Manages paddle movement and menu interactions.
 */

class InputHandler {
  /**
   * Initialize input handler and register event listeners.
   */
  constructor() {
    this.keysPressed = new Set();
    this.paddleSpeed = 400; // pixels per second
    this.sliderValue = 1.0;

    // Register event listeners
    this.registerEventListeners();
  }

  /**
   * Register DOM event listeners.
   */
  registerEventListeners() {
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
    document.addEventListener('click', (e) => this.onMouseClick(e));
  }

  /**
   * Handle keydown event.
   * @param {KeyboardEvent} event - Keyboard event
   */
  onKeyDown(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      this.keysPressed.add(event.key);
      event.preventDefault();
    }
  }

  /**
   * Handle keyup event.
   * @param {KeyboardEvent} event - Keyboard event
   */
  onKeyUp(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      this.keysPressed.delete(event.key);
      event.preventDefault();
    }
  }

  /**
   * Handle mouse click event.
   * @param {MouseEvent} event - Mouse event
   */
  onMouseClick(event) {
    const target = event.target;
    const targetId = target.id;

    // Route click to appropriate handler
    if (targetId === 'start-button') {
      this.handleStartGame();
    } else if (targetId === 'options-button') {
      this.handleOptionsMenu();
    } else if (targetId === 'replay-button') {
      this.handleReplay();
    } else if (targetId === 'return-button') {
      this.handleReturnToMenu();
    } else if (targetId === 'back-button') {
      this.handleBackFromOptions();
    }
  }

  /**
   * Update input state for the current frame.
   * Called by game loop to process current keyboard state.
   * @param {Object} gameState - Current game state
   */
  update(gameState) {
    if (gameState.phase !== 'playing') {
      return;
    }

    // Update paddle velocity based on key presses
    const paddle = gameState.paddle;
    paddle.vx = 0; // Reset velocity

    if (this.keysPressed.has('ArrowLeft')) {
      paddle.vx = -this.paddleSpeed;
    }

    if (this.keysPressed.has('ArrowRight')) {
      paddle.vx = this.paddleSpeed;
    }
  }

  /**
   * Handle start game action.
   */
  handleStartGame() {
    // This will be implemented by game loop callback
  }

  /**
   * Handle options menu action.
   */
  handleOptionsMenu() {
    // This will be implemented by menu controller callback
  }

  /**
   * Handle replay action.
   */
  handleReplay() {
    // This will be implemented by game loop callback
  }

  /**
   * Handle return to menu action.
   */
  handleReturnToMenu() {
    // This will be implemented by game loop callback
  }

  /**
   * Handle back from options action.
   */
  handleBackFromOptions() {
    // This will be implemented by menu controller callback
  }

  /**
   * Handle slider change event.
   * @param {number} value - New slider value
   */
  onSliderChange(value) {
    this.sliderValue = parseFloat(value);
  }

  /**
   * Get current slider value.
   * @returns {number} Current slider value (0.5-2.0)
   */
  getSliderValue() {
    return this.sliderValue;
  }

  /**
   * Clear all pressed keys.
   */
  clearKeysPressed() {
    this.keysPressed.clear();
  }
}
