# Slice 4 — Victory Screen and Main Menu Navigation

## Overview

This slice implements the main menu (start, options, quit buttons), victory screen (displayed when all bricks destroyed), and navigation between menu, game, victory, and game-over screens. Menu interactions are mouse/pointer-based. This slice ties together phase transitions and provides the complete navigation system.

## Related User Stories

- **US-005** — Victory and Menu: Player sees victory screen when all bricks destroyed; menu provides start, options, and quit; replay available after victory/gameover

## Technical Components to Implement

### 1. Enhanced MenuController Module (`js/menuController.js` - major extension)

**Purpose:** Manages all menu screens and phase transitions.

**Responsibilities:**
- Render main menu with Start, Options, Quit buttons
- Render victory screen with Replay and Return to Menu buttons
- Render game-over screen (from Slice 3) with buttons
- Handle mouse clicks on all menu buttons
- Manage event listener attachment/cleanup
- Coordinate phase transitions with GameLoop

**Key Properties:**
```javascript
class MenuController {
  constructor(gameState, gameLoop) {
    this.gameState = gameState;
    this.gameLoop = gameLoop;
    this.currentPhase = 'menu';
    this.optionsOpen = false;
  }
}
```

**Key Methods:**
```javascript
class MenuController {
  // Main Menu
  renderMainMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = `
      <div class="main-menu">
        <h1 class="game-title">Breakout</h1>
        <button id="start-btn" class="btn btn-primary">Démarrer</button>
        <button id="options-btn" class="btn btn-secondary">Options</button>
        <button id="quit-btn" class="btn btn-secondary">Quitter</button>
      </div>
    `;
    
    this.attachMainMenuListeners();
  }
  
  attachMainMenuListeners() {
    document.getElementById('start-btn').addEventListener('click', () => {
      this.handleStartGame();
    });
    document.getElementById('options-btn').addEventListener('click', () => {
      this.handleOpenOptions();
    });
    document.getElementById('quit-btn').addEventListener('click', () => {
      this.handleQuit();
    });
  }
  
  handleStartGame() {
    // Initialize game board
    const canvas = document.getElementById('gameCanvas');
    this.gameState.bricks = BrickFactory.createInitialLayout(canvas.width, canvas.height);
    this.gameState.lives = 3;
    this.gameState.phase = 'playing';
    
    // Clear menu
    document.getElementById('menu-container').innerHTML = '';
    
    // Start game loop
    this.gameLoop.start();
  }
  
  // Victory Screen
  renderVictory() {
    const container = document.getElementById('menu-container');
    container.innerHTML = `
      <div class="victory-screen">
        <h1>Victoire!</h1>
        <p>Vous avez détruit toutes les briques!</p>
        <button id="replay-btn" class="btn btn-primary">Rejouer</button>
        <button id="menu-btn" class="btn btn-secondary">Retour au Menu</button>
      </div>
    `;
    
    this.attachVictoryListeners();
  }
  
  attachVictoryListeners() {
    document.getElementById('replay-btn').addEventListener('click', () => {
      this.handleReplay();
    });
    document.getElementById('menu-btn').addEventListener('click', () => {
      this.handleReturnToMenu();
    });
  }
  
  // Game Over Screen (from Slice 3)
  renderGameOver() {
    const container = document.getElementById('menu-container');
    container.innerHTML = `
      <div class="game-over-screen">
        <h1>Game Over</h1>
        <p>Vous avez épuisé vos 3 vies.</p>
        <button id="replay-btn" class="btn btn-primary">Rejouer</button>
        <button id="menu-btn" class="btn btn-secondary">Retour au Menu</button>
      </div>
    `;
    
    this.attachGameOverListeners();
  }
  
  attachGameOverListeners() {
    document.getElementById('replay-btn').addEventListener('click', () => {
      this.handleReplay();
    });
    document.getElementById('menu-btn').addEventListener('click', () => {
      this.handleReturnToMenu();
    });
  }
  
  // Navigation Handlers
  handleReplay() {
    const canvas = document.getElementById('gameCanvas');
    this.gameState.reset();
    this.gameState.bricks = BrickFactory.createInitialLayout(canvas.width, canvas.height);
    this.gameState.phase = 'playing';
    document.getElementById('menu-container').innerHTML = '';
    this.gameLoop.start();
  }
  
  handleReturnToMenu() {
    this.gameState.reset();
    this.gameState.phase = 'menu';
    document.getElementById('menu-container').innerHTML = '';
    this.renderMainMenu();
  }
  
  handleQuit() {
    // Close application (if embedded in a window)
    // or navigate away / redirect
    window.close();
    // Alternative: window.location.href = '/';
  }
  
  handleOpenOptions() {
    this.optionsOpen = true;
    this.renderOptions();
  }
  
  renderOptions() {
    // Placeholder for options (enhanced in Slice 5)
    const container = document.getElementById('menu-container');
    container.innerHTML = `
      <div class="options-menu">
        <h1>Options</h1>
        <div class="option-item">
          <label for="speed-slider">Vitesse de la balle:</label>
          <input type="range" id="speed-slider" min="0.5" max="2" step="0.1" value="1.0">
          <span id="speed-value">1.0x</span>
        </div>
        <button id="back-btn" class="btn btn-secondary">Retour</button>
      </div>
    `;
    
    this.attachOptionsListeners();
  }
  
  attachOptionsListeners() {
    document.getElementById('back-btn').addEventListener('click', () => {
      this.optionsOpen = false;
      this.renderMainMenu();
    });
    
    // Speed slider handling (enhanced in Slice 5)
    const slider = document.getElementById('speed-slider');
    if (slider) {
      slider.addEventListener('change', (e) => {
        const value = parseFloat(e.target.value);
        this.gameState.speedMultiplier = value;
        document.getElementById('speed-value').textContent = value.toFixed(1) + 'x';
      });
    }
  }
}
```

### 2. Enhanced GameLoop Module (`js/gameLoop.js` - extension)

**Purpose:** Manage phase transitions and coordinate with menu controller.

**Responsibilities:**
- Check win condition (all bricks destroyed)
- Transition to victory phase when condition met
- Call menu controller to render appropriate screen
- Stop game loop when phase is not 'playing'

**Integration Point:**
```javascript
class GameLoop {
  run(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    
    // Only run game loop if playing
    if (this.gameState.phase !== 'playing') {
      return;
    }
    
    this.inputHandler.update();
    this.physics.update(deltaTime);
    
    const collision = this.collisionDetector.detectAndResolve(this.gameState);
    
    if (collision.type === 'ball-lost') {
      this.handleBallLost();
    } else if (collision.type === 'brick-destroyed') {
      this.checkWinCondition();
    }
    
    this.renderer.draw(this.gameState);
    
    // Continue loop only if still playing
    if (this.gameState.phase === 'playing') {
      requestAnimationFrame((t) => this.run(t));
    }
  }
  
  checkWinCondition() {
    if (this.gameState.bricks.length === 0) {
      this.gameState.setPhase('victory');
      this.menuController.renderVictory();
    }
  }
  
  start() {
    this.gameState.setPhase('playing');
    requestAnimationFrame((t) => this.run(t));
  }
  
  stop() {
    this.gameState.setPhase('menu');
  }
}
```

### 3. HTML Structure Enhancement

**Purpose:** Ensure DOM elements exist for menu and overlay.

**Target File:** `apps/breakout/index.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Breakout Game</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div id="game-container">
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    
    <div id="ui-overlay">
      <div id="lives-counter">Vies: 3</div>
      <div id="menu-container">
        <!-- Menu content rendered here by MenuController -->
      </div>
    </div>
  </div>

  <!-- Game modules (in order) -->
  <script src="js/gameState.js"></script>
  <script src="js/brickFactory.js"></script>
  <script src="js/renderer.js"></script>
  <script src="js/inputHandler.js"></script>
  <script src="js/physics.js"></script>
  <script src="js/collisionDetector.js"></script>
  <script src="js/menuController.js"></script>
  <script src="js/gameLoop.js"></script>
  
  <!-- Game initialization -->
  <script>
    // Initialize game objects
    const canvas = document.getElementById('gameCanvas');
    const gameState = new GameState();
    const renderer = new Renderer(canvas, gameState);
    const inputHandler = new InputHandler(gameState);
    const physics = new Physics(gameState);
    const collisionDetector = new CollisionDetector(gameState);
    const menuController = new MenuController(gameState, null); // gameLoop set after
    const gameLoop = new GameLoop(gameState, renderer, inputHandler, physics, collisionDetector, menuController);
    
    // Set gameLoop reference in menuController
    menuController.gameLoop = gameLoop;
    
    // Register input listeners
    inputHandler.registerListeners();
    
    // Show main menu at startup
    gameState.phase = 'menu';
    menuController.renderMainMenu();
  </script>
</body>
</html>
```

### 4. CSS Styling

**Purpose:** Style menu screens and overlays.

**Target File:** `apps/breakout/css/styles.css` (enhancement)

```css
/* Game Container */
#game-container {
  position: relative;
  width: 800px;
  height: 600px;
  margin: 50px auto;
  background: #1a1a1a;
  border: 2px solid #444;
}

#gameCanvas {
  display: block;
  background: #0a0a0a;
}

/* UI Overlay */
#ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

#lives-counter {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  text-shadow: 1px 1px 2px #000;
  pointer-events: none;
  z-index: 10;
}

#menu-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

/* Menu Styles */
.main-menu,
.options-menu,
.victory-screen,
.game-over-screen {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.95);
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  color: white;
  z-index: 100;
  border: 2px solid #444;
}

.game-title {
  font-size: 48px;
  margin-bottom: 30px;
  color: #00d9ff;
}

.main-menu h1,
.victory-screen h1,
.game-over-screen h1,
.options-menu h1 {
  font-size: 36px;
  margin-bottom: 20px;
}

.main-menu p,
.victory-screen p,
.game-over-screen p {
  font-size: 18px;
  margin-bottom: 30px;
  color: #ccc;
}

/* Buttons */
.btn {
  display: block;
  width: 200px;
  padding: 12px 24px;
  margin: 10px auto;
  font-size: 16px;
  border: 2px solid #666;
  border-radius: 5px;
  background: #333;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  background: #555;
  border-color: #888;
  transform: scale(1.05);
}

.btn-primary {
  background: #00d9ff;
  color: black;
  border-color: #00d9ff;
}

.btn-primary:hover {
  background: #00f0ff;
  border-color: #00f0ff;
}

.btn-secondary {
  background: #666;
  color: white;
}

.btn-secondary:hover {
  background: #777;
}

/* Options Menu */
.option-item {
  margin: 20px 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.option-item label {
  font-size: 16px;
  margin-bottom: 10px;
}

.option-item input[type="range"] {
  width: 200px;
  height: 6px;
  cursor: pointer;
}

#speed-value {
  font-size: 16px;
  margin-top: 10px;
  color: #00d9ff;
}
```

## Dependencies & Technical Sequence

```
Slice 0 (Game Foundation)
    ↓
Slice 1 (Ball Physics)
    ↓
Slice 2 (Paddle Control)
    ↓
Slice 3 (Lives System)
    ↓
Slice 4 (Victory & Menu)
    ├── Depends: All previous slices
    ├── Enhances: menuController.js, gameLoop.js, index.html, styles.css
    └── Integrates: Menu navigation with game phase transitions
```

## Target Files

```
apps/breakout/
├── index.html                 (enhance with menu-container)
├── js/
│   ├── menuController.js      (enhanced with all menu screens)
│   └── gameLoop.js            (enhanced with phase-aware loop)
└── css/
    └── styles.css             (add menu and overlay styles)
```

## Menu Navigation Flow

```
Game Startup
    ↓
renderMainMenu()
    ├─→ "Démarrer" → handleStartGame() → phase = 'playing' → gameLoop.start()
    ├─→ "Options" → renderOptions() (Slice 5 enhancement)
    └─→ "Quitter" → handleQuit()

During Gameplay
    ├─→ Ball lost (but lives > 0) → respawn and continue
    └─→ All bricks destroyed → renderVictory()

Victory Screen
    ├─→ "Rejouer" → handleReplay() → reset game → phase = 'playing'
    └─→ "Retour au Menu" → handleReturnToMenu() → renderMainMenu()

Game Over Screen (Slice 3)
    ├─→ "Rejouer" → handleReplay() → reset game → phase = 'playing'
    └─→ "Retour au Menu" → handleReturnToMenu() → renderMainMenu()
```

## Acceptance Criteria

- **Criterion 1** — Main menu displays at game startup
- **Criterion 2** — Main menu has "Démarrer", "Options", "Quitter" buttons
- **Criterion 3** — Buttons respond to mouse hover (visual feedback)
- **Criterion 4** — "Démarrer" starts new game with fresh bricks and 3 lives
- **Criterion 5** — "Options" opens options screen (Slice 5 enhancement)
- **Criterion 6** — "Quitter" closes application
- **Criterion 7** — Victory screen displays when all bricks destroyed
- **Criterion 8** — Victory screen shows clear message
- **Criterion 9** — Victory "Rejouer" starts new game
- **Criterion 10** — Victory "Retour au Menu" returns to main menu
- **Criterion 11** — Game-over screen (from Slice 3) has same navigation options
- **Criterion 12** — All transitions between screens are smooth and responsive
- **Criterion 13** — No input lag on button clicks

## Testing Strategy

### Unit Tests
- MenuController correctly renders each screen
- Phase transitions trigger correct screen rendering
- Button click handlers call appropriate methods
- GameLoop respects phase transitions

### Integration Tests
- Menu displays at startup
- Clicking "Start" initializes game and starts loop
- Win condition triggers victory screen
- Win condition resets after replay
- Quit button closes application

### Manual Testing
- Navigate all menus thoroughly
- Click each button; verify correct behavior
- Play multiple games and verify transitions
- Check visual appearance (alignment, spacing, colors)
- Verify no console errors during navigation
- Test on different screen sizes (if applicable)

## Implementation Notes

1. **Event Listener Cleanup:** Remove listeners before rendering new menu to prevent duplicate handlers
2. **Phase Guard:** GameLoop only runs when phase === 'playing'
3. **Menu Container:** Clear before rendering new content to prevent overlay stacking
4. **Pointer Events:** Set `pointer-events: none` on lives-counter and non-interactive elements
5. **Button Feedback:** Use hover effects (color change, scale) for user interaction feedback

## Related Slices

- **Slice 0** — Game Foundation (prerequisite)
- **Slice 1** — Ball Physics (win condition detection)
- **Slice 2** — Paddle Control (used during playing phase)
- **Slice 3** — Lives System (game-over screen coordination)
- **Slice 5** — Speed Control (options menu integration)

---

**Status:** Ready for implementation  
**Priority:** High (core navigation system)  
**Estimated Effort:** 2-3 days
