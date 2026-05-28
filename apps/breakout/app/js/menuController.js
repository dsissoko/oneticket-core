/**
 * MenuController.js
 * 
 * Purpose: Manages navigation between menu screens (main menu, options, victory, game-over).
 * Handles button clicks, speed slider adjustments, and screen transitions.
 * 
 * Responsibilities:
 * - Render main menu, options screen, victory, and game-over screens
 * - Handle "Start Game" button click → transition to "playing" phase
 * - Handle "Options" button click → show speed slider
 * - Handle "Play Again" button click → reset game and resume playing
 * - Handle "Return to Menu" button click → return to main menu
 * - Handle speed slider changes → update speedMultiplier in real-time
 * - Attach click event listeners to all menu buttons
 */

class MenuController {
  /**
   * Creates a new MenuController instance.
   * 
   * @param {GameState} gameState - The game state manager
   * @param {BrickFactory} brickFactory - Factory for creating brick layouts
   * @param {HTMLElement} canvasElement - The canvas DOM element
   */
  constructor(gameState, brickFactory, canvasElement) {
    this.gameState = gameState;
    this.brickFactory = brickFactory;
    this.canvasElement = canvasElement;
    
    // Internal state for menu navigation
    this.showOptions = false;
    this.speedValue = 1.0;
    
    // Store references to DOM elements
    this.menuElement = document.getElementById('menu');
    this.gameUIElement = document.getElementById('game-ui');
    
    // Bind all methods to preserve `this` context
    this.handleStartGame = this.handleStartGame.bind(this);
    this.handlePlayAgain = this.handlePlayAgain.bind(this);
    this.handleReturnToMenu = this.handleReturnToMenu.bind(this);
    this.handleOptionsClicked = this.handleOptionsClicked.bind(this);
    this.handleSpeedChange = this.handleSpeedChange.bind(this);
    this.handleBackFromOptions = this.handleBackFromOptions.bind(this);
    
    // Initialize button listeners
    this.attachEventListeners();
  }

  /**
   * Attach click event listeners to all menu buttons.
   * This method is called during initialization and whenever the menu is re-rendered.
   */
  attachEventListeners() {
    // Start Game button
    const startButton = document.getElementById('startButton');
    if (startButton) {
      startButton.addEventListener('click', this.handleStartGame);
    }
    
    // Instructions/Options button
    const instructionsButton = document.getElementById('instructionsButton');
    if (instructionsButton) {
      instructionsButton.addEventListener('click', this.handleOptionsClicked);
    }
    
    // Speed slider (if present in options screen)
    const speedSlider = document.getElementById('speedSlider');
    if (speedSlider) {
      speedSlider.addEventListener('input', this.handleSpeedChange);
    }
    
    // Back from options button
    const backButton = document.getElementById('backButton');
    if (backButton) {
      backButton.addEventListener('click', this.handleBackFromOptions);
    }
    
    // Play Again button (victory/gameover screen)
    const playAgainButton = document.getElementById('playAgainButton');
    if (playAgainButton) {
      playAgainButton.addEventListener('click', this.handlePlayAgain);
    }
    
    // Return to Menu button (victory/gameover screen)
    const returnToMenuButton = document.getElementById('returnToMenuButton');
    if (returnToMenuButton) {
      returnToMenuButton.addEventListener('click', this.handleReturnToMenu);
    }
  }

  /**
   * Handle "Start Game" button click.
   * Transitions from "menu" to "playing" phase, initializes game state and launches the ball.
   * 
   * @param {Event} event - The click event
   */
  handleStartGame(event) {
    event.preventDefault();
    
    console.log('Start game clicked');
    
    // Initialize bricks from factory
    const initialBricks = this.brickFactory.createInitialLayout();
    this.gameState.bricks = initialBricks;
    
    // Set initial game state for playing phase
    this.gameState.phase = 'playing';
    this.gameState.lives = 3;
    
    // Initialize ball at paddle position
    const canvasWidth = this.canvasElement.width;
    const canvasHeight = this.canvasElement.height;
    const paddleX = canvasWidth / 2;
    const paddleY = canvasHeight - 20;
    
    // Set paddle initial position
    this.gameState.paddle.x = paddleX;
    this.gameState.paddle.y = paddleY;
    this.gameState.paddle.vx = 0;
    
    // Set ball initial position and velocity
    this.gameState.ball.x = paddleX;
    this.gameState.ball.y = paddleY - 20;
    this.gameState.ball.vx = 150;
    this.gameState.ball.vy = -150;
    this.gameState.ball.radius = 5;
    
    // Preserve speed multiplier from options (if set)
    // speedMultiplier is already set in gameState, just keep it
    
    // Reset pause state
    this.gameState.isPaused = false;
    this.gameState.isWon = false;
    
    console.log(`Phase transition: menu → playing`);
    console.log(`Speed multiplier: ${this.gameState.speedMultiplier}`);
  }

  /**
   * Handle "Play Again" button click.
   * Resets game state and returns to "playing" phase.
   * Preserves the speed multiplier set in Options.
   * 
   * @param {Event} event - The click event
   */
  handlePlayAgain(event) {
    event.preventDefault();
    
    console.log('Play again clicked');
    
    // Initialize fresh bricks
    const initialBricks = this.brickFactory.createInitialLayout();
    this.gameState.bricks = initialBricks;
    
    // Reset game state for playing phase
    this.gameState.phase = 'playing';
    this.gameState.lives = 3;
    
    // Reset ball and paddle positions
    const canvasWidth = this.canvasElement.width;
    const canvasHeight = this.canvasElement.height;
    const paddleX = canvasWidth / 2;
    const paddleY = canvasHeight - 20;
    
    this.gameState.paddle.x = paddleX;
    this.gameState.paddle.y = paddleY;
    this.gameState.paddle.vx = 0;
    
    this.gameState.ball.x = paddleX;
    this.gameState.ball.y = paddleY - 20;
    this.gameState.ball.vx = 150;
    this.gameState.ball.vy = -150;
    this.gameState.ball.radius = 5;
    
    // Keep speed multiplier from Options
    // gameState.speedMultiplier is preserved
    
    this.gameState.isPaused = false;
    this.gameState.isWon = false;
    
    console.log(`Phase transition: victory/gameover → playing`);
    console.log(`Speed multiplier preserved: ${this.gameState.speedMultiplier}`);
  }

  /**
   * Handle "Return to Menu" button click.
   * Transitions from victory/gameover back to "menu" phase.
   * Resets all game state.
   * 
   * @param {Event} event - The click event
   */
  handleReturnToMenu(event) {
    event.preventDefault();
    
    console.log('Return to menu clicked');
    
    // Reset to menu phase
    this.gameState.phase = 'menu';
    this.gameState.lives = 3;
    
    // Clear game state (optional, for clean slate)
    this.gameState.bricks = [];
    this.gameState.ball = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 5
    };
    this.gameState.paddle.vx = 0;
    
    // Reset internal menu state
    this.showOptions = false;
    
    // Speed multiplier is preserved for next session
    this.gameState.isPaused = false;
    this.gameState.isWon = false;
    
    console.log(`Phase transition: victory/gameover → menu`);
  }

  /**
   * Handle "Options" button click.
   * Shows the options screen with the speed slider.
   * Internal state flag: this.showOptions = true
   * 
   * @param {Event} event - The click event
   */
  handleOptionsClicked(event) {
    event.preventDefault();
    
    console.log('Options clicked');
    
    // Toggle options screen visibility
    this.showOptions = true;
    
    console.log('Options screen shown');
  }

  /**
   * Handle speed slider input change.
   * Updates the speed multiplier in real-time as the slider moves.
   * Speed range: 0.5x (very slow) to 2.0x (very fast)
   * 
   * @param {Event} event - The input event from the slider
   */
  handleSpeedChange(event) {
    const sliderValue = parseFloat(event.target.value);
    
    console.log(`Slider input: ${sliderValue}`);
    
    // Update speed multiplier via gameState (applies clamping)
    this.gameState.setSpeedMultiplier(sliderValue);
    
    // Store the speed value locally for UI updates
    this.speedValue = this.gameState.speedMultiplier;
    
    // Get speed label for display
    const speedLabel = this.getSpeedLabel(this.speedValue);
    
    console.log(`Speed multiplier updated: ${this.speedValue} (${speedLabel})`);
    
    // Update speed label in UI (if label element exists)
    const speedLabelElement = document.getElementById('speedLabel');
    if (speedLabelElement) {
      speedLabelElement.textContent = speedLabel;
    }
  }

  /**
   * Handle "Back" button click from options screen.
   * Returns to main menu and hides the options screen.
   * 
   * @param {Event} event - The click event
   */
  handleBackFromOptions(event) {
    event.preventDefault();
    
    console.log('Back from options clicked');
    
    // Hide options screen
    this.showOptions = false;
    
    console.log('Returned to main menu');
  }

  /**
   * Get human-readable speed label for a given multiplier value.
   * 
   * @param {number} value - Speed multiplier value (0.5 - 2.0)
   * @returns {string} Human-readable speed label
   */
  getSpeedLabel(value) {
    // Use a small epsilon for floating point comparison
    const epsilon = 0.01;
    
    if (value <= 0.5 + epsilon) {
      return 'Très lent (0.5x)';
    } else if (value <= 0.75 + epsilon) {
      return 'Lent (0.75x)';
    } else if (value <= 1.0 + epsilon) {
      return 'Moyen (1.0x)';
    } else if (value <= 1.5 + epsilon) {
      return 'Rapide (1.5x)';
    } else {
      return 'Très rapide (2.0x)';
    }
  }

  /**
   * Render the menu UI based on current game phase and internal state.
   * Called by the renderer each frame to update menu visibility and content.
   * 
   * @returns {void}
   */
  render() {
    if (!this.menuElement) {
      return; // Menu element not found in DOM
    }
    
    if (this.gameState.phase === 'menu') {
      this.menuElement.style.display = 'flex';
      
      // Render main menu or options screen based on showOptions flag
      if (this.showOptions) {
        this.renderOptionsScreen();
      } else {
        this.renderMainMenu();
      }
    } else {
      // Hide menu during other phases (playing, victory, gameover)
      this.menuElement.style.display = 'none';
    }
    
    // Attach event listeners after rendering
    this.attachEventListeners();
  }

  /**
   * Render the main menu screen.
   * Shows "Start" and "Options" buttons.
   */
  renderMainMenu() {
    if (!this.menuElement) return;
    
    this.menuElement.innerHTML = `
      <div class="menu-content">
        <h1>Breakout</h1>
        <p class="menu-subtitle">Cassez tous les briques !</p>
        <button id="startButton" class="btn btn-primary">Démarrer</button>
        <button id="instructionsButton" class="btn btn-secondary">Options</button>
      </div>
    `;
  }

  /**
   * Render the options screen with speed slider.
   * Shows speed slider, label, and "Back" button.
   */
  renderOptionsScreen() {
    if (!this.menuElement) return;
    
    const speedLabel = this.getSpeedLabel(this.gameState.speedMultiplier);
    
    this.menuElement.innerHTML = `
      <div class="menu-content">
        <h1>Options</h1>
        <div class="options-container">
          <label for="speedSlider">Vitesse de la balle:</label>
          <input 
            type="range" 
            id="speedSlider" 
            min="0.5" 
            max="2.0" 
            step="0.1" 
            value="${this.gameState.speedMultiplier}"
            class="speed-slider"
          >
          <p id="speedLabel" class="speed-label">${speedLabel}</p>
        </div>
        <button id="backButton" class="btn btn-secondary">Retour</button>
      </div>
    `;
  }

  /**
   * Render victory screen.
   * Called from renderer when phase transitions to "victory".
   */
  renderVictoryScreen() {
    if (!this.menuElement) return;
    
    this.menuElement.style.display = 'flex';
    this.menuElement.innerHTML = `
      <div class="menu-content victory-screen">
        <h1>🎉 Victoire!</h1>
        <p class="victory-message">Vous avez détruit tous les briques!</p>
        <p class="stats">Vies restantes: ${this.gameState.lives}</p>
        <button id="playAgainButton" class="btn btn-primary">Rejouer</button>
        <button id="returnToMenuButton" class="btn btn-secondary">Retour au menu</button>
      </div>
    `;
    
    this.attachEventListeners();
  }

  /**
   * Render game-over screen.
   * Called from renderer when phase transitions to "gameover".
   */
  renderGameOverScreen() {
    if (!this.menuElement) return;
    
    this.menuElement.style.display = 'flex';
    this.menuElement.innerHTML = `
      <div class="menu-content gameover-screen">
        <h1>Jeu Terminé</h1>
        <p class="gameover-message">Vous avez perdu toutes vos vies.</p>
        <p class="stats">Vies: 0</p>
        <button id="playAgainButton" class="btn btn-primary">Rejouer</button>
        <button id="returnToMenuButton" class="btn btn-secondary">Retour au menu</button>
      </div>
    `;
    
    this.attachEventListeners();
  }
}

// Export for use in other modules
export default MenuController;
