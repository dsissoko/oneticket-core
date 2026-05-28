/**
 * MenuController.js
 * Manages navigation and settings across menu screens.
 * Handles transitions: Main Menu → Options → Playing → Victory/GameOver
 * Persists speed slider value in memory, resets to 1.0x on new game start.
 */

class MenuController {
  /**
   * Initialize menu controller.
   * @param {HTMLCanvasElement} canvas - Game canvas element
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.currentScreen = 'main'; // main | options | playing | victory | gameover
    this.speedMultiplier = 1.0; // Persists in memory while menu open
    this.callbacks = {
      startGame: null,
      replay: null,
      returnToMenu: null,
      setSpeed: null,
      showOptions: null,
      backFromOptions: null,
    };

    this.registerMenuListeners();
  }

  /**
   * Register menu event listeners.
   * Delegates clicks and slider changes to handler methods.
   */
  registerMenuListeners() {
    // Event delegation for dynamic menu buttons
    document.addEventListener('click', (e) => {
      this.handleMenuClick(e);
    });

    // Speed slider change listener (real-time input)
    document.addEventListener('change', (e) => {
      if (e.target.id === 'speed-slider') {
        this.handleSliderChange(parseFloat(e.target.value));
      }
    });

    // Real-time slider input for live preview
    document.addEventListener('input', (e) => {
      if (e.target.id === 'speed-slider') {
        this.handleSliderChange(parseFloat(e.target.value));
      }
    });
  }

  /**
   * Handle menu button clicks.
   * Routes click events to appropriate handler based on button ID.
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
   * Handle "Start Game" button click.
   * Transitions from Main Menu → Playing
   * Resets speed multiplier to 1.0x for new game session.
   */
  handleStartGame() {
    try {
      // Reset speed to default for new game
      this.speedMultiplier = 1.0;
      
      this.currentScreen = 'playing';
      
      if (this.callbacks.startGame) {
        this.callbacks.startGame();
      }
    } catch (error) {
      console.error('Error in handleStartGame:', error);
    }
  }

  /**
   * Handle "Options" button click.
   * Transitions from Main Menu → Options Screen
   * Speed slider value persists from previous menu session.
   */
  handleOptionsMenu() {
    try {
      this.currentScreen = 'options';
      
      if (this.callbacks.showOptions) {
        this.callbacks.showOptions();
      }
    } catch (error) {
      console.error('Error in handleOptionsMenu:', error);
    }
  }

  /**
   * Handle speed slider change.
   * Updates speed multiplier and persists in memory.
   * Clamps value to [0.5, 2.0] range for valid game speeds.
   * @param {number} value - New slider value (0.5 to 2.0)
   */
  handleSliderChange(value) {
    try {
      // Clamp to valid range
      this.speedMultiplier = Math.max(0.5, Math.min(2.0, parseFloat(value)));

      // Update DOM display
      const speedValueElement = document.getElementById('speed-value');
      if (speedValueElement) {
        speedValueElement.textContent = this.speedMultiplier.toFixed(1) + 'x';
      }

      // Notify game state via callback
      if (this.callbacks.setSpeed) {
        this.callbacks.setSpeed(this.speedMultiplier);
      }
    } catch (error) {
      console.error('Error in handleSliderChange:', error);
    }
  }

  /**
   * Handle "Replay" button click.
   * Transitions from Victory/GameOver → Playing
   * Resets speed multiplier to 1.0x for new game session.
   */
  handleReplay() {
    try {
      // Reset speed to default for new game
      this.speedMultiplier = 1.0;
      
      this.currentScreen = 'playing';
      
      if (this.callbacks.replay) {
        this.callbacks.replay();
      }
    } catch (error) {
      console.error('Error in handleReplay:', error);
    }
  }

  /**
   * Handle "Return to Menu" button click.
   * Transitions from Victory/GameOver → Main Menu
   * Preserves speed multiplier in memory for future options menu.
   */
  handleReturnToMenu() {
    try {
      this.currentScreen = 'main';
      
      if (this.callbacks.returnToMenu) {
        this.callbacks.returnToMenu();
      }
    } catch (error) {
      console.error('Error in handleReturnToMenu:', error);
    }
  }

  /**
   * Handle "Back" button click from Options Screen.
   * Transitions from Options → Main Menu
   * Persists speed multiplier value in memory.
   */
  handleBackFromOptions() {
    try {
      this.currentScreen = 'main';
      
      if (this.callbacks.backFromOptions) {
        this.callbacks.backFromOptions();
      }
    } catch (error) {
      console.error('Error in handleBackFromOptions:', error);
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
   * Set speed multiplier programmatically.
   * Clamps value to [0.5, 2.0] range.
   * @param {number} multiplier - Speed multiplier (0.5-2.0)
   */
  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = Math.max(0.5, Math.min(2.0, parseFloat(multiplier)));
  }

  /**
   * Register callback function for game action.
   * @param {string} action - Action name
   * @param {Function} callback - Callback function to execute
   */
  on(action, callback) {
    if (this.callbacks.hasOwnProperty(action)) {
      this.callbacks[action] = callback;
    }
  }

  /**
   * Get current screen name.
   * @returns {string} Current screen: "main" | "options" | "playing" | "victory" | "gameover"
   */
  getCurrentScreen() {
    return this.currentScreen;
  }

  /**
   * Set current screen.
   * @param {string} screenName - Screen name to transition to
   */
  setCurrentScreen(screenName) {
    this.currentScreen = screenName;
  }

  /**
   * Render menu DOM elements based on current screen.
   * Called by renderer to update menu UI.
   * Handles Main Menu, Options, Victory, and GameOver screens.
   */
  render() {
    const menuContent = document.getElementById('menu-content');
    const menuOverlay = document.getElementById('menu-overlay');
    
    if (!menuContent || !menuOverlay) {
      return;
    }

    // Clear previous menu content
    menuContent.innerHTML = '';

    switch (this.currentScreen) {
      case 'main':
        this.renderMainMenu(menuContent, menuOverlay);
        break;
      case 'options':
        this.renderOptionsScreen(menuContent, menuOverlay);
        break;
      case 'victory':
        this.renderVictoryScreen(menuContent, menuOverlay);
        break;
      case 'gameover':
        this.renderGameOverScreen(menuContent, menuOverlay);
        break;
      case 'playing':
        // Hide overlay during gameplay
        menuOverlay.style.display = 'none';
        break;
      default:
        console.warn('Unknown screen name:', this.currentScreen);
    }
  }

  /**
   * Render Main Menu screen.
   * Displays "Start Game" and "Options" buttons.
   * @param {HTMLElement} menuContent - Menu content container
   * @param {HTMLElement} menuOverlay - Menu overlay backdrop
   */
  renderMainMenu(menuContent, menuOverlay) {
    menuOverlay.style.display = 'flex';
    menuContent.innerHTML = `
      <div class="menu-screen main-menu">
        <h1>Breakout</h1>
        <div class="menu-buttons">
          <button id="start-button" class="menu-button">Start Game</button>
          <button id="options-button" class="menu-button">Options</button>
        </div>
      </div>
    `;
  }

  /**
   * Render Options Screen.
   * Displays speed slider (0.5x to 2.0x) and back button.
   * Speed persists in memory.
   * @param {HTMLElement} menuContent - Menu content container
   * @param {HTMLElement} menuOverlay - Menu overlay backdrop
   */
  renderOptionsScreen(menuContent, menuOverlay) {
    menuOverlay.style.display = 'flex';
    menuContent.innerHTML = `
      <div class="menu-screen options-screen">
        <h2>Options</h2>
        <div class="options-group">
          <label for="speed-slider">Game Speed</label>
          <input 
            type="range" 
            id="speed-slider" 
            min="0.5" 
            max="2.0" 
            step="0.1" 
            value="${this.speedMultiplier}"
          >
          <span id="speed-value">${this.speedMultiplier.toFixed(1)}x</span>
        </div>
        <button id="back-button" class="menu-button">Back</button>
      </div>
    `;
  }

  /**
   * Render Victory Screen.
   * Displays victory message and "Play Again" / "Return to Menu" buttons.
   * Resets speed multiplier to 1.0x on next game start.
   * @param {HTMLElement} menuContent - Menu content container
   * @param {HTMLElement} menuOverlay - Menu overlay backdrop
   */
  renderVictoryScreen(menuContent, menuOverlay) {
    menuOverlay.style.display = 'flex';
    menuContent.innerHTML = `
      <div class="menu-screen victory-screen">
        <h1>Victory!</h1>
        <p>You destroyed all bricks!</p>
        <div class="menu-buttons">
          <button id="replay-button" class="menu-button">Play Again</button>
          <button id="return-button" class="menu-button">Return to Menu</button>
        </div>
      </div>
    `;
  }

  /**
   * Render Game Over Screen.
   * Displays game over message and "Play Again" / "Return to Menu" buttons.
   * Resets speed multiplier to 1.0x on next game start.
   * @param {HTMLElement} menuContent - Menu content container
   * @param {HTMLElement} menuOverlay - Menu overlay backdrop
   */
  renderGameOverScreen(menuContent, menuOverlay) {
    menuOverlay.style.display = 'flex';
    menuContent.innerHTML = `
      <div class="menu-screen gameover-screen">
        <h1>Game Over</h1>
        <p>You ran out of lives!</p>
        <div class="menu-buttons">
          <button id="replay-button" class="menu-button">Play Again</button>
          <button id="return-button" class="menu-button">Return to Menu</button>
        </div>
      </div>
    `;
  }
}
