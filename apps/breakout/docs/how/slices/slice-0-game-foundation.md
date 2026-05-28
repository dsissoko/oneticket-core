# Slice 0 — Game Foundation

## Overview

This slice establishes the foundational game infrastructure: HTML5 canvas setup, game state management, game loop orchestration, and basic rendering pipeline. This is the prerequisite for all subsequent slices and enables the display of the game board with bricks, ball, and paddle.

## Related User Stories

- **US-001** — Game Setup and Display: Player sees the game screen with brick wall, ball, and paddle

## Technical Components to Implement

### 1. GameState Module (`js/gameState.js`)
**Purpose:** Single source of truth for all game data.

**Responsibilities:**
- Initialize and manage complete game state (lives, bricks, ball, paddle, phase)
- Provide methods to reset game state
- Track game phase transitions (menu → playing → victory → gameover)

**Key Methods:**
- `constructor()` — Initialize default state
- `reset()` — Reset all game values to initial state
- `setPhase(phase)` — Update game phase
- `decrementLives()` — Reduce lives by 1
- `removeBrick(id)` — Remove brick from array
- `setSpeedMultiplier(factor)` — Update speed (0.5-2.0)

**Output:**
```javascript
{
  phase: "menu",
  lives: 3,
  bricks: [...],
  ball: { x: 0, y: 0, vx: 0, vy: 0, radius: 5 },
  paddle: { x: 0, y: 0, width: 80, height: 10, vx: 0 },
  speedMultiplier: 1.0,
  isPaused: false
}
```

### 2. GameLoop Module (`js/gameLoop.js`)
**Purpose:** Orchestrates frame-by-frame game execution.

**Responsibilities:**
- Use requestAnimationFrame for 60 FPS consistency
- Call input handler, physics, collision, renderer in sequence
- Manage game phase transitions
- Check win/loss conditions

**Key Methods:**
- `constructor(gameState, renderer, inputHandler, physics, collisionDetector, menuController)`
- `start()` — Begin the game loop
- `stop()` — Stop the game loop
- `run(timestamp)` — Main loop callback (handles delta time)

### 3. Renderer Module (`js/renderer.js`)
**Purpose:** Renders all game objects and UI on canvas and DOM.

**Responsibilities:**
- Clear and redraw canvas each frame
- Draw bricks, ball, paddle with appropriate colors/styling
- Render UI elements (lives counter, speed indicator)
- Handle phase-specific rendering (menu, game, victory, gameover)

**Key Methods:**
- `constructor(canvas, gameState)`
- `draw(gameState)` — Main render method
- `drawBricks(bricks)` — Render all bricks
- `drawBall(ball)` — Render ball as circle
- `drawPaddle(paddle)` — Render paddle as rectangle
- `drawLivesCounter(lives)` — Render lives UI
- `clear()` — Clear canvas

### 4. BrickFactory Module (`js/brickFactory.js`)
**Purpose:** Creates and manages brick layout.

**Responsibilities:**
- Generate initial brick grid (5 rows, evenly spaced)
- Provide consistent brick object structure

**Key Methods:**
- `static createInitialLayout(canvasWidth, canvasHeight)` — Return array of brick objects
- Brick object: `{ id, x, y, width, height, color, isDestroyed }`

### 5. Input Handler Module (`js/inputHandler.js`)
**Purpose:** Captures keyboard and mouse events.

**Responsibilities:**
- Listen to keyboard events (arrow keys)
- Listen to mouse events (clicks for menu)
- Update game state based on input

**Key Methods:**
- `constructor(gameState)`
- `registerListeners()` — Attach DOM event listeners
- `onKeyDown(event)` — Handle key press
- `onKeyUp(event)` — Handle key release
- `update()` — Process pending input changes

### 6. Physics Module (`js/physics.js`)
**Purpose:** Updates ball and paddle positions based on delta time.

**Responsibilities:**
- Update ball position based on velocity and delta time
- Update paddle position based on velocity and delta time
- Clamp paddle to screen bounds
- Apply speed multiplier to ball velocity

**Key Methods:**
- `constructor(gameState)`
- `update(deltaTime)` — Update positions and velocities
- `applySpeedMultiplier(multiplier)` — Scale ball velocity

### 7. CollisionDetector Module (`js/collisionDetector.js`)
**Purpose:** Detects and resolves collisions.

**Responsibilities:**
- Detect ball collisions with walls, ceiling, paddle, bricks, floor
- Resolve collisions with appropriate velocity reversals
- Prevent tunneling (one collision per frame)

**Key Methods:**
- `constructor(gameState)`
- `detectAndResolve(gameState)` — Main collision check method
- Helper methods for specific collision types

### 8. MenuController Module (`js/menuController.js`)
**Purpose:** Manages menu screens and navigation.

**Responsibilities:**
- Display main menu, options, victory, and gameover screens
- Handle button clicks and navigation
- Manage speed slider interaction

**Key Methods:**
- `constructor(gameState, gameLoop)`
- `renderMainMenu()` — Display main menu
- `handleStartGame()` — Transition to playing phase
- `handleReturnToMenu()` — Return to main menu

## Dependencies & Technical Sequence

```
1. gameState.js          (no dependencies)
   ↓
2. brickFactory.js       (depends on gameState initialization)
   ↓
3. renderer.js           (depends on canvas element, gameState)
4. inputHandler.js       (depends on DOM, gameState)
5. physics.js            (depends on gameState)
6. collisionDetector.js  (depends on gameState)
7. menuController.js     (depends on gameState)
   ↓
8. gameLoop.js           (depends on all above modules)
```

## Target Files

```
apps/breakout/
├── index.html          (canvas element, script tags)
├── js/
│   ├── gameState.js
│   ├── brickFactory.js
│   ├── renderer.js
│   ├── inputHandler.js
│   ├── physics.js
│   ├── collisionDetector.js
│   ├── menuController.js
│   └── gameLoop.js
└── css/
    └── styles.css      (canvas styling)
```

## HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Breakout Game</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div id="game-container">
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div id="ui-overlay">
      <div id="lives-counter">Vies: 3</div>
      <div id="menu-container"></div>
    </div>
  </div>

  <script src="js/gameState.js"></script>
  <script src="js/brickFactory.js"></script>
  <script src="js/renderer.js"></script>
  <script src="js/inputHandler.js"></script>
  <script src="js/physics.js"></script>
  <script src="js/collisionDetector.js"></script>
  <script src="js/menuController.js"></script>
  <script src="js/gameLoop.js"></script>
  <script>
    // Initialize and start game
    const canvas = document.getElementById('gameCanvas');
    const gameState = new GameState();
    gameState.bricks = BrickFactory.createInitialLayout(canvas.width, canvas.height);
    
    const renderer = new Renderer(canvas, gameState);
    const inputHandler = new InputHandler(gameState);
    const physics = new Physics(gameState);
    const collisionDetector = new CollisionDetector(gameState);
    const menuController = new MenuController(gameState);
    
    const gameLoop = new GameLoop(gameState, renderer, inputHandler, physics, collisionDetector, menuController);
    inputHandler.registerListeners();
    gameLoop.start();
  </script>
</body>
</html>
```

## Acceptance Criteria

- **Criterion 1** — Canvas displays with 5 rows of bricks, uniform dimensions and even spacing
- **Criterion 2** — Ball is visible and rendered at center or near paddle at game start
- **Criterion 3** — Paddle is visible and positioned at bottom of screen, centered horizontally
- **Criterion 4** — Lives counter clearly displayed with text "Vies: 3" or similar, matches initial game state
- **Criterion 5** — Game loop runs at 60 FPS using requestAnimationFrame
- **Criterion 6** — Game state initializes correctly with all required properties
- **Criterion 7** — No console errors on page load

## Testing Strategy

### Unit Tests
- GameState initialization and reset
- BrickFactory creates correct number of bricks with proper spacing
- Renderer canvas context methods called correctly

### Integration Tests
- GameLoop successfully coordinates all modules
- State changes propagate correctly through render pipeline
- No memory leaks during extended play

### Manual Testing
- Verify canvas displays on page load
- Inspect elements visually (bricks, ball, paddle, lives counter)
- Open developer console to confirm no errors
- Visual verification: layout matches design specs

## Implementation Notes

1. **Canvas Sizing:** Default to 800x600 or responsive based on container
2. **Brick Layout:** 5 rows × 10 columns with consistent spacing
3. **Initial Ball Position:** Center-top of paddle or center of canvas
4. **Initial Paddle Position:** Center-bottom with 20-pixel margin
5. **Frame Delta Time:** Calculate from requestAnimationFrame timestamps (milliseconds → seconds)
6. **Color Scheme:** Use contrasting colors (dark background, bright bricks/paddle/ball)

## Related Slices

- **Slice 1** — Ball Physics and Collision (depends on this foundation)
- **Slice 2** — Paddle Control (depends on input handler established here)
- **Slice 3** — Lives System (depends on game state and UI foundation)
- **Slice 4** — Victory and Menu (depends on menu controller established here)
- **Slice 5** — Speed Control (depends on physics and speed multiplier)

---

**Status:** Ready for implementation  
**Priority:** Critical (blocking all other slices)  
**Estimated Effort:** 3-4 days
