# Slice 6 — Menus UI

## Goal

Implement a complete menu system for the Breakout game, including main menu UI (HTML/CSS) with Start, Settings, and Quit buttons; a settings menu with a ball speed slider (0-100%); victory and defeat screens; and state-driven show/hide logic that renders the appropriate menu based on game state. This slice bridges user input to game state transitions through clickable buttons and slider controls.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-006 — Menus and Settings](../../what/epics/epic-0-mvp/user-stories/us-006-menus-and-settings.md)

## Impacted Components

From `architecture.md`:
- **Menu UI** — Rendering menus (HTML/CSS), slider control, button visibility logic
- **Input Handler** — Mouse click event listeners on buttons and slider
- **Game State Manager** — State transitions triggered by menu interactions (MENU → PLAYING, MENU → SETTINGS, PLAYING → VICTORY/DEFEAT, etc.)
- **Game Engine** — Integration with state machine to show/hide menus based on current game state

## Interfaces

### Input
1. **Mouse Click Events** — on menu buttons:
   - "Start" button → triggers state transition from MENU to PLAYING (or MENU → SETTINGS → PLAYING per spec)
   - "Settings" button → triggers state transition from MENU to SETTINGS
   - "Play"/"Start Game" button in settings → triggers state transition from SETTINGS to PLAYING
   - "Quit" button (main menu or end-game) → closes game or returns to main menu
   - "Replay" button (victory/defeat screen) → resets game and transitions to PLAYING

2. **Slider Input** — ball speed slider:
   - Range: 0 to 100 (representing speed multiplier or percentage of base speed)
   - On drag/change: updates game state's `ballSpeed` property
   - Persists value across game replays within same session

### Output (Rendered)
1. **Main Menu** — HTML/CSS container with:
   - Game title or branding
   - Three buttons: "Start", "Settings", "Quit"
   - Visible only when `gameState === 'MENU'`

2. **Settings Menu** — HTML/CSS container with:
   - "Ball Speed" label
   - Horizontal slider control (input range or custom implementation)
   - Visual labels: "Very Slow" to "Very Fast"
   - Current speed value display (optional percentage or numeric indicator)
   - "Play" or "Start Game" button to begin gameplay
   - "Back" button to return to main menu
   - Visible only when `gameState === 'SETTINGS'`

3. **Victory Screen** — HTML/CSS container with:
   - "Victory!" or "You Won!" title
   - Optional stats (bricks destroyed, lives remaining)
   - "Replay" button to restart with current settings
   - "Quit" button to return to main menu
   - Visible only when `gameState === 'VICTORY'`

4. **Defeat/Game Over Screen** — HTML/CSS container with:
   - "Game Over!" or "Defeat!" title
   - Optional stats (lives lost, bricks destroyed)
   - "Replay" button to restart with current settings
   - "Quit" button to return to main menu
   - Visible only when `gameState === 'DEFEAT'`

### Data State After Slice
```javascript
{
  state: 'MENU' | 'SETTINGS' | 'PLAYING' | 'VICTORY' | 'DEFEAT',
  lives: 3,
  ballSpeed: 300, // pixels/second (updated by slider, e.g., range 150–600)
  ballSpeedSliderValue: 50, // 0-100 percentage for UI display
  bricks: [ /* Array of brick objects */ ],
  ball: { x, y, vx, vy, radius },
  paddle: { x, y, width, height },
  // Menu state (internal to menu module)
  menus: {
    mainMenu: { visible: boolean },
    settingsMenu: { visible: boolean },
    victoryScreen: { visible: boolean },
    defeatScreen: { visible: boolean }
  }
}
```

## Data Changes

### New DOM Elements (HTML)
1. **Main Menu Container** — `<div id="mainMenu" class="menu-container">`
   - "Start" button: `<button id="startBtn">Start</button>`
   - "Settings" button: `<button id="settingsBtn">Settings</button>`
   - "Quit" button: `<button id="quitBtn">Quit</button>`

2. **Settings Menu Container** — `<div id="settingsMenu" class="menu-container">`
   - Slider label: `<label>Ball Speed</label>`
   - Slider input: `<input type="range" id="speedSlider" min="0" max="100" value="50">`
   - Speed display: `<span id="speedDisplay">50%</span>` or numeric value
   - "Play" button: `<button id="playBtn">Play</button>`
   - "Back" button: `<button id="backBtn">Back</button>`

3. **Victory Screen Container** — `<div id="victoryScreen" class="menu-container">`
   - Title: `<h1>Victory!</h1>`
   - "Replay" button: `<button id="replayBtn">Replay</button>`
   - "Quit" button: `<button id="quitVictoryBtn">Quit</button>`

4. **Defeat Screen Container** — `<div id="defeatScreen" class="menu-container">`
   - Title: `<h1>Game Over!</h1>`
   - "Replay" button: `<button id="replayBtn">Replay</button>`
   - "Quit" button: `<button id="quitDefeatBtn">Quit</button>`

### CSS Styling
- **Menu Containers** — centered, overlay on canvas, semi-transparent background or modal style
- **Buttons** — clickable, hover states, active states, clear visual feedback
- **Slider** — horizontal input range control with visual range labels ("Very Slow" to "Very Fast")
- **Show/Hide Logic** — `display: none` / `display: block` or class toggles based on game state

### Game State Changes
- Add state property: `ballSpeedSliderValue` (0-100, used to compute `ballSpeed`)
- Add menu visibility tracking object (or computed from `gameState`)
- Speed setting persists across replays within session (stored in game state object)

### No Migrations Required
This is frontend UI only; no persistent storage changes required.

## Sequence Flow

### 1. Game Initialization
- Game loads in MENU state
- All menu and screen containers created in DOM (but initially hidden)
- Main menu container displayed with "Start", "Settings", "Quit" buttons

### 2. Player Clicks "Settings" (Main Menu)
- Event listener on "Settings" button fires
- Game state transitions to SETTINGS
- Main menu container hidden (`display: none`)
- Settings menu container shown (`display: block`)
- Slider displays current speed value (default 50%)
- Slider input listener ready to update `ballSpeed` value in real-time

### 3. Player Adjusts Speed Slider
- On slider input change:
  - Extract slider value (0-100)
  - Calculate ballSpeed: `ballSpeed = baseSpeed * (sliderValue / 100)` or similar formula
  - Update game state: `ballSpeedSliderValue = sliderValue` and `ballSpeed = calculated value`
  - Update speed display label on UI (e.g., show percentage or descriptive text)
  - No game state transition (remains SETTINGS)

### 4. Player Clicks "Play" (Settings Menu)
- Event listener on "Play" button fires
- Game state transitions to PLAYING
- Settings menu container hidden
- Canvas-based game rendering shown (handled by game engine)
- Gameplay begins with configured speed

### 5. Gameplay Loop (PLAYING State)
- Game engine updates ball, paddle, collisions
- When game ends (all bricks destroyed or lives = 0):
  - Set gameState to VICTORY or DEFEAT
  - Main render loop conditionally shows end-game screen

### 6. Victory Screen Display (Game Won)
- Game state transitions to VICTORY
- Canvas rendering paused or dimmed
- Victory screen container shown with "Victory!" title
- "Replay" and "Quit" buttons displayed

### 7. Player Clicks "Replay" (Victory Screen)
- Event listener on "Replay" button fires
- Game state transitions to PLAYING
- Victory screen hidden
- Game engine resets: ball, paddle, bricks reset to initial state
- Gameplay begins with previously configured speed (from slider)

### 8. Defeat Screen Display (Game Lost)
- Game state transitions to DEFEAT
- Canvas rendering paused or dimmed
- Defeat screen container shown with "Game Over!" title
- "Replay" and "Quit" buttons displayed

### 9. Player Clicks "Replay" (Defeat Screen)
- Event listener on "Replay" button fires
- Game state transitions to PLAYING
- Defeat screen hidden
- Game engine resets: ball, paddle, bricks reset, lives reset to 3
- Gameplay begins with previously configured speed

### 10. Player Clicks "Quit" (Any Menu or End-Game Screen)
- Event listener on "Quit" button fires
- Game state transitions to MENU
- Victory/Defeat/Settings screens hidden
- Main menu container shown
- Optional: game engine pauses or stops rendering

### 11. Return to Main Menu After Gameplay
- From PLAYING state, if player accesses menu (future feature), transition to MENU
- Main menu shown again

## Observability Impact

### Logging
Add console logging for menu interactions and state transitions (development only):
```javascript
console.log('Menu state change:', { from: previousState, to: newState });
console.log('Speed slider adjusted:', { sliderValue: value, ballSpeed: calculatedSpeed });
console.log('Button clicked:', { buttonId: 'startBtn' });
console.log('Menu rendered:', { visibleMenus: ['mainMenu'] });
```

### Metrics (if applicable)
- Menu render time (should be <5ms for DOM updates)
- Click event handler latency (should be <10ms)
- Slider input response time (should be immediate visual feedback, <16ms)

### No Errors Expected
- If buttons or slider elements are missing from DOM, log warning and gracefully skip initialization
- If slider input is invalid, clamp to valid range and log warning

### Visual Feedback
- Button hover/active states provide immediate user feedback
- Slider position reflects current speed selection
- State transitions visually clear (menu hidden, canvas shown, etc.)

## Acceptance Criteria (from US-006)

✅ Main menu displays on game load with three visible buttons: "Start", "Settings", "Quit"
✅ Settings button transitions from main menu to settings menu (show/hide logic works)
✅ Ball speed slider is visible in settings menu with range "Very Slow" to "Very Fast"
✅ Slider position updates reflect selected speed value visually (label or percentage)
✅ Start button on main menu begins gameplay (transition to PLAYING state)
✅ Quit button on main menu exits gracefully
✅ Speed slider value persists across game replays within same session
✅ Victory screen displays when all bricks are destroyed with "Replay" and "Quit" options
✅ Defeat screen displays when lives reach zero with "Replay" and "Quit" options
✅ Replay button resets game and begins new gameplay with configured speed
✅ Quit button from end-game screens returns to main menu
✅ Menu show/hide logic correctly responds to game state changes
✅ No JavaScript errors in browser console related to menu interactions
✅ All menu buttons are clickable via mouse input
✅ Menu transitions are smooth and immediate

## Technical Notes

### Menu Rendering Strategy
- Use HTML/CSS for all menu UI (no canvas-based text rendering)
- Position menu containers as overlays on top of canvas (z-index management)
- Use `display: none` / `display: block` or class toggle for visibility control
- Ensure canvas continues rendering in background (optional: dim canvas during menu)

### Slider Implementation
- Use native HTML5 `<input type="range">` for accessibility and simplicity
- Alternative: custom slider implementation with `<div>` and mouse tracking
- Update ballSpeed calculation based on slider range (0-100 maps to speed range, e.g., 150-600 px/s)
- Display current value as percentage or descriptive label ("Slow", "Normal", "Fast", etc.)

### Button Event Listeners
- Attach click event listeners via `addEventListener()` to each button element
- Use delegated event handling if buttons are dynamically created (consider future flexibility)
- Ensure click handler prevents default behavior and calls appropriate state transition

### State Transition Routing
- Encapsulate state transitions in a state manager or game object method
- Each state transition triggers menu visibility updates (conditionally show/hide containers)
- Consider using a helper function: `setGameState(newState)` that updates state and menu visibility atomically

### Speed Slider Formula
Example calculation:
```javascript
const minSpeed = 150; // pixels/second
const maxSpeed = 600; // pixels/second
const baseSpeed = 300;
const sliderValue = 50; // 0-100
const ballSpeed = minSpeed + (sliderValue / 100) * (maxSpeed - minSpeed);
```

## Dependencies and Ordering

**This slice must be completed after:**
- Slice 1 — Game Setup (canvas and game state initialized)
- Slice 5 — Game States and Life Management (game state machine defined, VICTORY and DEFEAT states available)

**Enables:**
- Full game loop integration (menus transition game flow)
- Complete user experience (players can start, configure, win, and lose)

**Related Slices:**
- [Slice 1 — Game Setup](../slice-1-game-setup/slice.md) — provides initialized canvas and game state
- [Slice 5 — Game States and Life Management](../slice-5-game-states/slice.md) — provides state transitions (VICTORY, DEFEAT)
- [Slice 2 — Ball Physics and Wall Collision](../slice-2-ball-physics/slice.md) — provides ball movement and physics
- [Slice 3 — Paddle, Brick Collisions & Life Management](../slice-3-collisions/slice.md) — provides collision detection and life loss logic
