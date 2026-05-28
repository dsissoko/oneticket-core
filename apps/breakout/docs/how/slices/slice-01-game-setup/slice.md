# Slice 1 — Game Setup & Display

## Goal

Establish the foundational game rendering infrastructure: canvas element, game state initialization, brick layout creation, and continuous 60 FPS rendering loop. After this slice, the player can see a static game board with bricks, ball, and paddle.

## Related Epics

- [Epic 0 — MVP Breakout](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Initialisation et affichage du jeu](../../../what/epics/epic-0-mvp/user-stories/us-001-game-setup.md)

## Impacted Components

1. **Renderer** (`renderer.js`)
   - Canvas setup and 2D context acquisition
   - Clear, draw bricks, draw ball, draw paddle
   - Render DOM UI (lives counter)

2. **Game State** (`gameState.js`)
   - Initial state structure
   - Lives initialization (3)
   - Speed multiplier default (1.0x)

3. **Brick Factory** (`brickFactory.js`)
   - Generate initial 5-row brick layout
   - Assign unique IDs, positions, colors

4. **Game Loop** (`gameLoop.js`)
   - Setup `requestAnimationFrame` scheduler
   - Initial frame at 60 FPS (or display refresh rate)

5. **Index HTML** (`index.html`)
   - Create `<canvas>` element with ID and dimensions
   - Link CSS and JavaScript files
   - Embed menu HTML (minimal main menu structure)

## Interfaces

### Renderer → Canvas
```javascript
renderer.draw(gameState)
// Inputs: gameState { ball, paddle, bricks, lives, phase }
// Output: Draws to canvas context
```

### Brick Factory → Game State
```javascript
const bricks = brickFactory.createInitialLayout()
// Returns: Array of { id, x, y, width, height, color }
```

### Game Loop → All Subsystems
```javascript
gameLoop.run()
// Initializes input handler, physics, renderer
// Calls renderer.draw(gameState) every frame
```

## Data Changes

**Initial Game State:**
```javascript
{
  phase: "menu",
  lives: 3,
  bricks: [ /* 50 bricks in 5 rows × 10 columns */ ],
  ball: { x: paddleX, y: paddleY - 20, vx: 0, vy: 0, radius: 5 },
  paddle: { x: canvasWidth / 2, y: canvasHeight - 20, width: 60, height: 10, vx: 0 },
  speedMultiplier: 1.0,
  isPaused: false,
}
```

**Brick Layout:**
- 5 rows, 10 bricks per row (total 50 bricks)
- Row 1 (top): Y = 30, Color = Red
- Row 2: Y = 50, Color = Orange
- Row 3: Y = 70, Color = Yellow
- Row 4: Y = 90, Color = Green
- Row 5: Y = 110, Color = Blue
- Uniform spacing horizontally across canvas width

## Sequence Flow

```
1. Load index.html
2. Create <canvas> element (800×600 or similar)
3. Instantiate GameState with initial values
4. Instantiate BrickFactory → create 50 bricks
5. Populate gameState.bricks
6. Instantiate Renderer with canvas context
7. Instantiate GameLoop
8. gameLoop.run() starts requestAnimationFrame
9. Each frame:
   a. renderer.draw(gameState)
   b. Canvas shows: bricks, ball, paddle, lives counter
10. Menu screen displays on top (static, not yet interactive)
```

## Observability Impact

**Console Logging (debug only):**
- Log canvas dimensions: "Canvas initialized: 800×600"
- Log brick count: "Bricks created: 50"
- Log frame rate: "FPS: 60" (sample every 1s)

**Visual Feedback:**
- Bricks visible in 5 rows with distinct colors
- Ball visible at paddle center (white circle)
- Paddle visible at bottom center (gray/blue rectangle)
- Lives counter visible: "Lives: 3"
- Main menu visible with "Start" button

## Notes

- Menu is displayed but not yet interactive; click handling added in Slice 5
- Ball position is fixed (no movement yet; physics added in Slice 2)
- Paddle position is fixed (no input yet; control added in Slice 3)
- Game phase remains "menu" until "Start" button clicked (Slice 5)

---

**Status:** Ready for implementation. No blockers.
