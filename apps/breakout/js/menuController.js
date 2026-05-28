/**
 * MenuController.js
 * Manages navigation between menu screens and game states.
 * Handles menu interactions, button clicks, and screen transitions.
 */

class MenuController {
  /**
   * Initialize menu controller.
   * @param {HTMLCanvasElement} canvas - Game canvas element
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.currentScreen = 'main'; // main | options | game
    this.speedMultiplier = 1.0;
    this.callbacks = {
      startGame: null,
      replay: null,
      returnToMenu: null,
      setSpeed: null,
    };

    this.registerMenuListeners();
  }

  /**
   * Register menu event listeners.
   */
  registerMenuListeners() {
    // Event delegation for dynamic menu buttons
    document.addEventListener('click', (e) => {
      this.handleMenuClick(e);
    });

    // Speed slider change listener
    document.addEventListener('change', (e) => {
      if (e.target.id === 'speed-slider') {
        this.onSliderChange(e.target.value);
      }
    });

    // Real-time slider input
    document.addEventListener('input', (e) => {
      if (e.target.id === 'speed-slider') {
        this.onSliderChange(e.target.value);
      }
    });
  }

  /**
   * Handle menu button clicks.
   * @param {MouseEvent} event - Click event
   */
  handleMenuClick(event) {
    const target = event.target;
    const targetId = target.id;

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
   * Handle start game action.
   */
  handleStartGame() {
    if (this.callbacks.startGame) {
      this.callbacks.startGame();
    }
  }

  /**
   * Handle options menu action.
   */
  handleOptionsMenu() {
    this.currentScreen = 'options';
    if (this.callbacks.showOptions) {
      this.callbacks.showOptions();
    }
  }

  /**
   * Handle replay action.
   */
  handleReplay() {
    if (this.callbacks.replay) {
      this.callbacks.replay();
    }
  }

  /**
   * Handle return to menu action.
   */
  handleReturnToMenu() {
    this.currentScreen = 'main';
    if (this.callbacks.returnToMenu) {
      this.callbacks.returnToMenu();
    }
  }

  /**
   * Handle back from options action.
   */
  handleBackFromOptions() {
    this.currentScreen = 'main';
    if (this.callbacks.backFromOptions) {
      this.callbacks.backFromOptions();
    }
  }

  /**
   * Handle speed slider change.
   * @param {string|number} value - New slider value
   */
  onSliderChange(value) {
    this.speedMultiplier = parseFloat(value);

    // Update display
    const speedValueElement = document.getElementById('speed-value');
    if (speedValueElement) {
      speedValueElement.textContent = this.speedMultiplier.toFixed(1);
    }

    if (this.callbacks.setSpeed) {
      this.callbacks.setSpeed(this.speedMultiplier);
    }
  }

  /**
   * Get current speed multiplier.
   * @returns {number} Speed multiplier (0.5-2.0)
   */
  getSpeedMultiplier() {
    return this.speedMultiplier;
  }

  /**
   * Set speed multiplier.
   * @param {number} multiplier - Speed multiplier (0.5-2.0)
   */
  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = Math.max(0.5, Math.min(2.0, multiplier));
  }

  /**
   * Register callback function for game action.
   * @param {string} action - Action name: "startGame" | "replay" | "returnToMenu" | "setSpeed" | "showOptions" | "backFromOptions"
   * @param {Function} callback - Callback function
   */
  on(action, callback) {
    if (this.callbacks.hasOwnProperty(action)) {
      this.callbacks[action] = callback;
    }
  }

  /**
   * Get current screen name.
   * @returns {string} Current screen: "main" | "options" | "game"
   */
  getCurrentScreen() {
    return this.currentScreen;
  }

  /**
   * Set current screen.
   * @param {string} screenName - Screen name: "main" | "options" | "game"
   */
  setCurrentScreen(screenName) {
    this.currentScreen = screenName;
  }

  /**
   * Render main menu.
   */
  render() {
    // This will be called by renderer
  }
}
