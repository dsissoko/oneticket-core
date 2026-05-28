/**
 * InputHandler — Captures and translates user input into game state changes.
 * 
 * Responsibilities:
 * - Listen to keydown events (arrow keys) to set paddle velocity
 * - Listen to keyup events to clear paddle velocity
 * - Update gameState.paddle.vx based on key state
 * - Ignore non-arrow keys (no diagonal or modifier combinations)
 * 
 * Input Handling:
 * - Keyboard (Arrow Keys):
 *   - Left arrow → Set paddle.vx = -paddleSpeed (e.g., -300 px/s)
 *   - Right arrow → Set paddle.vx = +paddleSpeed (e.g., +300 px/s)
 *   - Key release → Set paddle.vx = 0
 */

class InputHandler {
  /**
   * Creates a new InputHandler instance.
   * 
   * @param {number} paddleSpeed - Paddle movement speed in pixels per second (default: 300)
   */
  constructor(paddleSpeed = 300) {
    this.paddleSpeed = paddleSpeed;
    
    // Internal state to track which keys are currently pressed
    this.keysPressed = {
      ArrowLeft: false,
      ArrowRight: false
    };
    
    // Bind event handlers to preserve `this` context
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    
    // Flag to indicate if input handler has been initialized
    this.isInitialized = false;
  }

  /**
   * Initialize input listeners.
   * 
   * Attaches keydown and keyup event listeners to the document.
   * This should be called once when the game starts.
   */
  initialize() {
    if (this.isInitialized) {
      console.warn('InputHandler is already initialized');
      return;
    }
    
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    this.isInitialized = true;
    
    console.log('InputHandler initialized');
  }

  /**
   * Cleanup input listeners.
   * 
   * Removes keydown and keyup event listeners from the document.
   * This should be called when the game stops.
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.isInitialized = false;
    
    console.log('InputHandler destroyed');
  }

  /**
   * Handle keydown event.
   * 
   * Sets the keysPressed state for arrow keys.
   * Ignores non-arrow keys and modifier combinations.
   * 
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyDown(event) {
    // Only handle arrow keys
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      this.keysPressed[event.key] = true;
      console.log(`${event.key} pressed`);
    }
  }

  /**
   * Handle keyup event.
   * 
   * Clears the keysPressed state for arrow keys.
   * 
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyUp(event) {
    // Only handle arrow keys
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      this.keysPressed[event.key] = false;
      console.log(`${event.key} released`);
    }
  }

  /**
   * Update game state based on current input state.
   * 
   * Called once per frame by the GameLoop.
   * Checks which arrow keys are currently pressed and updates paddle.vx accordingly.
   * 
   * Logic:
   * - If ArrowLeft is held: paddle.vx = -paddleSpeed
   * - If ArrowRight is held: paddle.vx = +paddleSpeed
   * - If neither is held: paddle.vx = 0
   * - If both are held: paddle.vx = 0 (neutrals out)
   * 
   * @param {GameState} gameState - The game state to update
   */
  update(gameState) {
    const isLeftPressed = this.keysPressed.ArrowLeft;
    const isRightPressed = this.keysPressed.ArrowRight;
    
    // Determine paddle velocity based on key states
    if (isLeftPressed && !isRightPressed) {
      gameState.paddle.vx = -this.paddleSpeed;
    } else if (!isLeftPressed && isRightPressed) {
      gameState.paddle.vx = this.paddleSpeed;
    } else {
      // Neither pressed or both pressed → stop paddle
      gameState.paddle.vx = 0;
    }
  }
}

// Export for use in other modules
export default InputHandler;
