# Slice 1 — Game Setup

## Goal

Initialize the Breakout game with a fully configured play area, including HTML5 canvas setup, brick wall creation (5 rows), paddle positioning, ball initialization, and initial canvas rendering. This slice provides the visual foundation for all subsequent gameplay mechanics.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Game Setup and Initialization](../../what/epics/epic-0-mvp/user-stories/us-001-game-setup.md)

## Impacted Components

From `architecture.md`:
- **Game Engine** — Initialization and state setup
- **Physics Engine** — Ball initial state and position
- **Rendering** — Canvas setup and initial draw
- **Game State Manager** — Initial state transitions (MENU state)

## Interfaces

### Input
None — pure initialization (no user input required for this slice)

### Output (Rendered)
1. Canvas element with configured dimensions
2. Brick grid (5 rows × N columns)
3. Paddle positioned at bottom center
4. Ball positioned at canvas center
5. All elements drawn with distinct colors and clear visibility

### Data State After Slice
```javascript
{
  state: 'MENU',
  lives: 3,
  ballSpeed: 300, // pixels/second (default)
  bricks: [ /* Array of 5 rows × N columns of brick objects */ ],
  ball: { 
    x: canvasWidth/2, 
    y: canvasHeight/2, 
    vx: 0, 
    vy: 0, 
    radius: 5 
  },
  paddle: { 
    x: (canvasWidth - paddleWidth) / 2, // centered
    y: canvasHeight - 20, 
    width: 100, 
    height: 10 
  }
}
```

## Data Changes

### New Data Structures
1. **Canvas Configuration**
   - Width and height (from product spec — arcade proportions)
   - Context (2D context for drawing)

2. **Brick Grid**
   - 5 rows of brick objects
   - Each brick has: x, y, width, height, active (boolean)
   - Regular spacing and alignment

3. **Ball Initial State**
   - Position: center of canvas
   - Velocity: zero (until gameplay starts)
   - Direction: downward angle (predefined when game starts)

4. **Paddle Initial State**
   - Position: bottom center, with margins
   - Dimensions: width and height per architecture spec
   - Movement state: neutral (no input yet)

5. **Game State Machine**
   - Current state: MENU
   - Lives: 3
   - Ball speed multiplier: 1.0 (default)

### No Migrations Required
This is initialization-only; no database or persistent storage changes.

## Sequence Flow

### 1. Page Load
- Browser loads `index.html` with canvas element markup
- JavaScript initializes and runs

### 2. Canvas Setup
- Retrieve or create canvas DOM element
- Set canvas width and height (per architecture config)
- Get 2D rendering context
- Configure canvas styling (background, borders)

### 3. Game State Initialization
- Create game state object
- Set state to `MENU`
- Initialize lives to 3
- Initialize ball speed to default (300 px/s)

### 4. Brick Grid Generation
- Define brick layout: 5 rows
- Calculate brick dimensions (width, height, spacing)
- For each row (0–4):
  - For each column (0–N):
    - Create brick object at (x, y)
    - Add to bricks array
    - Mark as active (not destroyed)

### 5. Paddle Initialization
- Calculate paddle position: center horizontally, near bottom vertically
- Store paddle object: { x, y, width, height }
- Paddle state: neutral (no movement yet)

### 6. Ball Initialization
- Calculate ball position: center of canvas
- Store ball object: { x, y, vx: 0, vy: 0, radius }
- Ball is stationary until gameplay begins

### 7. Initial Canvas Rendering
- Clear canvas
- Render background
- Draw all bricks in their grid positions
- Draw paddle at bottom center
- Draw ball at center
- Update canvas with all game objects in initial state

### 8. State Persistence
- Store initialized game state in memory (global game object or state manager)
- Ready for menu input or gameplay transitions

## Observability Impact

### Logging
Add console logging during initialization (for development):
```javascript
console.log('Canvas initialized:', { width: canvasWidth, height: canvasHeight });
console.log('Brick grid created:', brickCount, 'bricks in 5 rows');
console.log('Paddle initialized at:', { x: paddleX, y: paddleY });
console.log('Ball initialized at:', { x: ballX, y: ballY });
console.log('Game state:', { state: 'MENU', lives: 3 });
```

### Metrics (if applicable)
- Frame time for initial render (should be <16ms for 60 FPS)
- Memory usage after initialization

### No Errors Expected
- If canvas or context is unavailable, log error and gracefully degrade
- If brick layout calculation fails, use fallback dimensions

## Acceptance Criteria (from US-001)

✅ Canvas renders with correct dimensions (per product spec)
✅ Brick grid initializes with exactly 5 rows
✅ Paddle initializes at bottom center
✅ Ball initializes at center with correct velocity vector (zero until gameplay)
✅ Initial lives counter is set to 3
✅ Game state machine properly transitions to Menu on startup
✅ All game objects render without visual overlap or misalignment
✅ Browser console shows no errors or warnings
✅ Manual testing confirms smooth initialization on page load

## Technical Notes

### Canvas Dimensions
From architecture and product spec, use standard arcade proportions (e.g., 800×600 or 1024×768). Exact size should be decided during implementation based on responsive design requirements and product decisions.

### Brick Spacing
- Even distribution across canvas width
- Consistent vertical spacing
- No overlap with paddle area

### Ball Velocity Vector
- Ball starts with zero velocity (vx: 0, vy: 0)
- Direction will be set when gameplay transitions from MENU → PLAYING

### State Machine Initial Transition
- Game always starts in MENU state
- Main menu is rendered (separate slice covers menu UI)

## Dependencies and Ordering

**This slice must be completed first** because:
1. All subsequent gameplay mechanics depend on initialized game objects (ball, paddle, bricks)
2. Canvas must be set up before any rendering
3. Game state must exist before transitions can occur

**Depends on:**
- Product spec (dimensions, rules)
- Architecture (components, data structures)

**Enables:**
- [Slice 2 — Paddle and Keyboard Input](../slice-2-paddle-input/slice.md)
- [Slice 3 — Ball Physics and Wall Collision](../slice-3-ball-physics/slice.md)
- [Slice 4 — Brick Grid and Ball-Brick Collision](../slice-4-brick-collision/slice.md)
- [Slice 5 — Game State Machine and Menus](../slice-5-game-states/slice.md)
