# US-001 — Game Setup and Initialization

## Story

As a player, I want the game to initialize with a properly configured play area, bricks, and paddle at startup, so that I can immediately begin playing without manual setup or configuration.

## Expected Behavior

### Initialization

- Canvas element is created with dimensions configured from product spec (standard arcade proportions)
- Game state is initialized to **Menu** state
- Brick grid is populated with 5 rows of destructible bricks
- Paddle is positioned at the bottom center of the play area
- Ball is positioned at the center, ready for gameplay
- Initial lives counter is set to 3
- Ball speed is set to default value (medium speed)

### Visual Rendering

- Canvas displays the entire play area with clear boundaries
- Bricks are rendered in a regular grid pattern (rows × columns)
- Paddle is rendered as a horizontal rectangle at the bottom
- Ball is rendered as a circle at the center
- Play area background is visible and distinct from game objects
- All game objects have distinct, visible colors

### State Management

- Game tracks the current state (Menu, Active, Victory, Defeat)
- Initial state is Menu
- Game state persists correctly during transitions
- Brick count and remaining lives are initialized and tracked

## Acceptance Criteria

**Scenario:** Game starts and initializes all required components
**Given:** The player loads the Breakout game in their browser
**and Given:** No previous game state exists
**When:** The page fully loads
**Then:** A canvas element is rendered with visible boundaries
**and Then:** The brick grid (5 rows) is displayed in the play area
**and Then:** The paddle is positioned at the bottom center
**and Then:** The ball is positioned at the center of the canvas
**and Then:** The life counter displays "3"
**and Then:** The game state is set to Menu (main menu is visible)

**Scenario:** Brick grid is correctly configured
**Given:** The game is initialized
**When:** The play area renders
**Then:** Exactly 5 rows of bricks are visible
**and Then:** Each brick is evenly spaced and properly aligned
**and Then:** No overlapping or misaligned bricks are present
**and Then:** The brick count is tracked and accessible to the game state

**Scenario:** Paddle is properly positioned
**Given:** The game is initialized
**When:** The play area renders
**Then:** The paddle is centered horizontally at the bottom of the canvas
**and Then:** The paddle has adequate margins from the canvas edges
**and Then:** The paddle dimensions allow for clear visibility and gameplay

**Scenario:** Ball is ready for gameplay
**Given:** The game is initialized
**When:** The play area renders
**Then:** The ball is positioned at the center of the canvas
**and Then:** The ball is stationary (no movement) until gameplay begins
**and Then:** The ball has a defined initial velocity direction (downward angle)

## Key Files Affected

- `apps/breakout/app/index.html` — Canvas markup and page structure
- `apps/breakout/app/js/game.js` — Main game initialization and state
- `apps/breakout/app/js/paddle.js` — Paddle initialization and positioning
- `apps/breakout/app/js/ball.js` — Ball initialization and state
- `apps/breakout/app/js/brick.js` — Brick grid generation and rendering
- `apps/breakout/app/css/style.css` — Canvas and game object styling

## Definition of Done

- [ ] Canvas renders with correct dimensions (per product spec)
- [ ] Brick grid initializes with exactly 5 rows
- [ ] Paddle initializes at bottom center
- [ ] Ball initializes at center with correct velocity vector
- [ ] Initial lives counter is set to 3
- [ ] Game state machine properly transitions to Menu on startup
- [ ] All game objects render without visual overlap or misalignment
- [ ] Browser console shows no errors or warnings
- [ ] Manual testing confirms smooth initialization on page load
