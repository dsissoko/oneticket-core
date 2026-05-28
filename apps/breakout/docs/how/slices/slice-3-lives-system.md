# Slice 3 — Lives System and Game Over Screen

## Overview

This slice implements the lives management system and game-over screen. Players start with 3 lives, lose a life when the ball exits the bottom of the screen, and see a game-over screen when lives reach 0. The ball respawns above the paddle for each new attempt. Game-over screen offers "Replay" and "Return to Menu" options.

## Related User Stories

- **US-004** — Lives and Game Over: Player loses life when ball reaches bottom; game-over screen appears after 3 lives lost

## Technical Components to Implement

### 1. Enhanced GameState Module (`js/gameState.js` - extension)

**Purpose:** Track and manage lives state; expose methods for life management.

**Responsibilities:**
- Initialize lives to 3 at game start
- Provide `decrementLives()` method
- Provide `isGameOver()` check
- Provide `resetLives()` method
- Track game phase transitions

**Key Methods:**
```javascript
class GameState {
  constructor() {
    this.phase = 'menu';
    this.lives = 3;
    this.bricks = [];
    this.ball = { x: 0, y: 0, vx: 0, vy: 0, radius: 5 };
    this.paddle = { x: 0, y: 0, width: 80, height: 10, vx: 0 };
    this.speedMultiplier = 1.0;
    this.isPaused = false;
  }
  
  decrementLives() {
    if (this.lives > 0) {
      this.lives--;
    }
  }
  
  isGameOver() {
    return this.lives === 0;
  }
  
  resetLives() {
    this.lives = 3;
  }
  
  reset() {
    // Full game reset
    this.lives = 3;
    this.phase = 'menu';
    this.bricks = [];
    this.ball = { x: 0, y: 0, vx: 0, vy: 0, radius: 5 };
    this.paddle = { x: 400, y: 570, width: 80, height: 10, vx: 0 };
    this.speedMultiplier = 1.0;
    this.isPaused = false;
  }
  
  setPhase(newPhase) {
    this.phase = newPhase;
  }
}
```

### 2. Enhanced Collision Detector Module (`js/collisionDetector.js` - extension)

**Purpose:** Detect floor collision specifically; return clear ball-lost event.

**Responsibilities:**
- Check if ball has fallen below play area (y > canvasHeight)
- Return `ball-lost` event type for game loop to handle
- Reset ball position is NOT collider's responsibility (game loop handles)

**Key Integration:**
```javascript
class CollisionDetector {
  detectAndResolve(gameState) {
    const { ball } = gameState;
    const CANVAS_HEIGHT = 600;
    
    // Priority 1: Floor collision (ball lost)
    if (ball.y > CANVAS_HEIGHT + ball.radius) {
      return { type: 'ball-lost', data: {} };
    }
    
    // ... rest of collision checks ...
  }
  
  checkFloorCollision(ball) {
    const CANVAS_HEIGHT = 600;
    return ball.y > CANVAS_HEIGHT + ball.radius;
  }
}
```

### 3. Enhanced GameLoop Module (`js/gameLoop.js` - extension)

**Purpose:** Handle ball-lost event; manage life decrement and ball respawn.

**Responsibilities:**
- Listen for ball-lost collision event
- Decrement lives in game state
- Check if game is over (lives === 0)
- Reset ball position for next attempt
- Transition to gameover phase if needed
- Continue playing if lives remain

**Key Methods:**
```javascript
class GameLoop {
  run(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    
    this.inputHandler.update();
    this.physics.update(deltaTime);
    
    // Collision detection
    const collision = this.collisionDetector.detectAndResolve(this.gameState);
    
    if (collision.type === 'ball-lost') {
      this.handleBallLost();
    } else if (collision.type === 'brick-destroyed') {
      this.checkWinCondition();
    }
    
    this.renderer.draw(this.gameState);
    
    if (this.gameState.phase === 'playing') {
      requestAnimationFrame((t) => this.run(t));
    }
  }
  
  handleBallLost() {
    this.gameState.decrementLives();
    
    if (this.gameState.isGameOver()) {
      // Transition to game-over screen
      this.gameState.setPhase('gameover');
      this.menuController.renderGameOver();
    } else {
      // Respawn ball for next attempt
      this.resetBallPosition();
      // Game continues in 'playing' phase
    }
  }
  
  resetBallPosition() {
    const { ball, paddle } = this.gameState;
    ball.x = paddle.x;
    ball.y = paddle.y - 30;
    this.physics.initializeBallVelocity();
  }
  
  checkWinCondition() {
    if (this.gameState.bricks.length === 0) {
      this.gameState.setPhase('victory');
      this.menuController.renderVictory();
    }
  }
}
```

### 4. Enhanced Renderer Module (`js/renderer.js` - extension)

**Purpose:** Display lives counter continuously; update when lives change.

**Responsibilities:**
- Render lives counter in UI (e.g., "Lives: 3")
- Update counter every frame to reflect current state
- Display game-over screen when phase is 'gameover'

**Key Methods:**
```javascript
class Renderer {
  draw(gameState) {
    // Clear and render canvas objects
    this.clear();
    this.drawBricks(gameState.bricks);
    this.drawBall(gameState.ball);
    this.drawPaddle(gameState.paddle);
    
    // Render lives counter
    this.drawLivesCounter(gameState.lives);
    
    // Phase-specific UI
    if (gameState.phase === 'gameover') {
      this.renderGameOverScreen(gameState);
    } else if (gameState.phase === 'victory') {
      this.renderVictoryScreen(gameState);
    }
  }
  
  drawLivesCounter(lives) {
    const livesElement = document.getElementById('lives-counter');
    if (livesElement) {
      livesElement.textContent = `Vies: ${lives}`;
    }
  }
  
  renderGameOverScreen(gameState) {
    const container = document.getElementById('menu-container');
    container.innerHTML = `
      <div class="game-over-screen">
        <h1>Game Over</h1>
        <p>Vous avez épuisé vos 3 vies.</p>
        <button id="replay-btn" class="btn">Rejouer</button>
        <button id="menu-btn" class="btn">Retour au Menu</button>
      </div>
    `;
    
    // Attach event listeners
    document.getElementById('replay-btn').addEventListener('click', () => {
      this.onReplayClick?.();
    });
    document.getElementById('menu-btn').addEventListener('click', () => {
      this.onMenuClick?.();
    });
  }
}
```

### 5. Enhanced MenuController Module (`js/menuController.js` - extension)

**Purpose:** Render game-over screen and handle navigation buttons.

**Responsibilities:**
- Render game-over screen with appropriate message
- Handle "Replay" button click → reset game and return to playing
- Handle "Return to Menu" button click → return to main menu
- Manage event listener attachment/cleanup

**Key Methods:**
```javascript
class MenuController {
  constructor(gameState, gameLoop) {
    this.gameState = gameState;
    this.gameLoop = gameLoop;
  }
  
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
    
    document.getElementById('replay-btn').addEventListener('click', () => {
      this.handleReplay();
    });
    document.getElementById('menu-btn').addEventListener('click', () => {
      this.handleReturnToMenu();
    });
  }
  
  handleReplay() {
    // Reset game state
    this.gameState.reset();
    
    // Reinitialize game board
    const canvas = document.getElementById('gameCanvas');
    this.gameState.bricks = BrickFactory.createInitialLayout(canvas.width, canvas.height);
    this.gameState.phase = 'playing';
    
    // Clear menu container
    document.getElementById('menu-container').innerHTML = '';
    
    // Restart game loop
    this.gameLoop.start();
  }
  
  handleReturnToMenu() {
    // Reset game state
    this.gameState.reset();
    this.gameState.setPhase('menu');
    
    // Show main menu
    this.renderMainMenu();
  }
  
  renderMainMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = `
      <div class="main-menu">
        <h1>Breakout</h1>
        <button id="start-btn" class="btn btn-primary">Démarrer</button>
        <button id="options-btn" class="btn btn-secondary">Options</button>
        <button id="quit-btn" class="btn btn-secondary">Quitter</button>
      </div>
    `;
    
    // Attach listeners (covered in Slice 4)
  }
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
    ├── Depends: GameState, CollisionDetector, GameLoop, Renderer, MenuController
    ├── Enhances: gameState.js, collisionDetector.js, gameLoop.js, renderer.js, menuController.js
    └── Integrates: Ball-lost event handling and life management
```

## Target Files

```
apps/breakout/
├── js/
│   ├── gameState.js              (enhanced with life management methods)
│   ├── collisionDetector.js      (enhanced with floor collision detection)
│   ├── gameLoop.js               (enhanced with ball-lost event handling)
│   ├── renderer.js               (enhanced with lives counter and game-over screen)
│   └── menuController.js         (enhanced with game-over rendering and navigation)
├── css/
│   └── styles.css                (add game-over screen styles)
└── index.html                    (ensure menu-container div exists)
```

## Lives Management Flow

```
Game State: lives = 3

Frame Loop:
  → Collision Detector: checks floor
  → If ball below floor:
      → CollisionDetector returns { type: 'ball-lost' }
      → GameLoop.handleBallLost() called
      → gameState.decrementLives() → lives = 2
      → If lives > 0:
          → resetBallPosition() (ball respawns above paddle)
          → Continue playing
      → If lives === 0:
          → gameState.setPhase('gameover')
          → menuController.renderGameOver()
          → GameLoop.stop() / pause
```

## Acceptance Criteria

- **Criterion 1** — Player starts with 3 lives displayed
- **Criterion 2** — When ball reaches bottom, life count decreases (3→2, 2→1, 1→0)
- **Criterion 3** — Lives counter updates visually after each loss
- **Criterion 4** — After losing a life (not the last), ball respawns above paddle
- **Criterion 5** — Game continues playable after life loss (if lives > 0)
- **Criterion 6** — After losing 3rd life, game-over screen displays immediately
- **Criterion 7** — Game-over screen shows "Game Over" message clearly
- **Criterion 8** — Game-over screen has "Replay" button to start new game
- **Criterion 9** — Game-over screen has "Return to Menu" button to go to main menu
- **Criterion 10** — Clicking "Replay" resets game (bricks restored, lives reset to 3)

## Testing Strategy

### Unit Tests
- `gameState.decrementLives()` correctly reduces lives
- `gameState.isGameOver()` returns true when lives === 0
- Floor collision detection identifies ball below canvas
- Lives counter text renders correctly for different values

### Integration Tests
- Ball lost event triggers life decrement
- Game continues after first/second life loss
- Game transitions to gameover phase on 3rd life loss
- Game-over screen buttons trigger correct handlers
- Replay button resets game state and resumes
- Return to menu button transitions correctly

### Manual Testing
- Lose all 3 lives by letting ball fall
- Verify lives counter updates each time
- Verify game-over screen appears after 3rd loss
- Click "Replay" and verify new game starts with 3 lives
- Click "Return to Menu" and verify menu displays
- Play another game after replay to verify reset works

## Implementation Notes

1. **Life Count:** Initialize to 3, never go below 0
2. **Ball Respawn Position:** Just above paddle center, stationary until physics applies velocity
3. **Ball Respawn Velocity:** Re-initialize with `physics.initializeBallVelocity()`
4. **Phase Transitions:** menu → playing → gameover (or victory)
5. **Lives Counter Placement:** Top-left or top-right corner, always visible during gameplay
6. **Game-Over Screen:** Overlay on canvas, centered, with clear buttons

## CSS Styling (Minimal Example)

```css
#lives-counter {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px #000;
}

.game-over-screen {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  color: white;
  z-index: 100;
}

.game-over-screen h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.game-over-screen button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
```

## Related Slices

- **Slice 0** — Game Foundation (prerequisite)
- **Slice 1** — Ball Physics (floor collision detection)
- **Slice 2** — Paddle Control (used during playing phase)
- **Slice 4** — Victory and Menu (menu controller coordination)
- **Slice 5** — Speed Control (reset speed on new game)

---

**Status:** Ready for implementation  
**Priority:** High (core gameplay loop)  
**Estimated Effort:** 2-3 days
