# Slice 6 — Speed Control & Difficulty Settings

## Goal

Implement the speed slider in the menu's options screen, enabling players to adjust ball velocity dynamically from 0.5x (very slow) to 2.0x (very fast). Speed changes apply immediately during gameplay and persist while the menu is open.

## Related Epics

- [Epic 0 — MVP Breakout](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-006 — Contrôle de la vitesse de la balle](../../../what/epics/epic-0-mvp/user-stories/us-006-speed-control.md)

## Impacted Components

1. **Menu Controller** (`menuController.js`)
   - Render "Options" screen with speed slider HTML `<input type="range">`
   - Handle slider input events (oninput)
   - Display speed label: "Very Slow (0.5x)", "Slow (0.75x)", "Medium (1.0x)", "Fast (1.5x)", "Very Fast (2.0x)"
   - Update gameState.speedMultiplier in real-time
   - Back button to return to main menu

2. **Game State** (`gameState.js`)
   - Field `speedMultiplier` (default: 1.0, range: 0.5 - 2.0)
   - Method `setSpeedMultiplier(factor)` with clamping to [0.5, 2.0]

3. **Physics Engine** (`physics.js`)
   - Apply speed multiplier to ball velocity each frame:
     ```javascript
     ball.vx *= gameState.speedMultiplier
     ball.vy *= gameState.speedMultiplier
     ```
   - Changes take effect immediately on next frame

4. **Input Handler** (`inputHandler.js`)
   - Listen to slider input events during "menu" phase (when Options screen open)
   - Call `menuController.handleSpeedChange(value)`

5. **Renderer** (`renderer.js`)
   - Render Options screen with slider when `phase === "menu" && showOptions === true`
   - Display current speed label below slider
   - Render slider visually (HTML range input styled with CSS)

6. **Index HTML** (`index.html`)
   - Add Options screen HTML: `<input type="range" min="0.5" max="2.0" step="0.1" value="1.0" />`
   - Add speed label text element

## Interfaces

### Menu Controller → Speed Adjustment
```javascript
menuController.handleSpeedChange(value, gameState)
// Modifies: gameState.speedMultiplier = clamp(value, 0.5, 2.0)
// Returns: updated gameState

menuController.handleOptionsClicked(gameState)
// Modifies: showOptions = true (internal state)
// Renders: Options screen with slider

menuController.handleBackFromOptions(gameState)
// Modifies: showOptions = false
// Renders: Main menu screen
```

### Game State → Speed Multiplier Management
```javascript
gameState.setSpeedMultiplier(factor)
// Modifies: gameState.speedMultiplier = clamp(factor, 0.5, 2.0)
// Returns: gameState

gameState.getSpeedMultiplier()
// Returns: number (0.5 - 2.0)
```

### Physics → Speed Application
```javascript
physics.update(deltaTime, gameState)
// When updating ball position:
// ball.vx = baseVx * gameState.speedMultiplier
// ball.vy = baseVy * gameState.speedMultiplier
```

### Input Handler → Slider Interaction
```javascript
inputHandler.onSliderInput(event, gameState)
// Reads: event.target.value (0.5 - 2.0)
// Calls: menuController.handleSpeedChange(value, gameState)
```

## Data Changes

**Game State with Speed Multiplier:**
```javascript
{
  phase: "menu" | "playing" | "victory" | "gameover",
  speedMultiplier: 0.5 | 0.75 | 1.0 | 1.5 | 2.0 | <custom>,
  ball: { x, y, vx, vy, radius },
  // ... other fields
}
```

**Menu State (Internal):**
```javascript
{
  showOptions: false | true,  // Toggle between main menu and options
  speedValue: 1.0,            // Current slider value
}
```

**Speed Label Mapping:**
```javascript
{
  0.5: "Very Slow (0.5x)",
  0.75: "Slow (0.75x)",
  1.0: "Medium (1.0x)",
  1.5: "Fast (1.5x)",
  2.0: "Very Fast (2.0x)",
  // Interpolate for values between discrete steps
}
```

## Sequence Flow

```
Main Menu Phase:
1. Display: Main menu with "Start" and "Options" buttons
2. User clicks "Options"
   a. menuController.handleOptionsClicked()
   b. showOptions = true
   c. Renderer.draw() shows Options screen

Options Phase:
1. Display: Speed slider (HTML range input)
2. Display: Current speed label (e.g., "Medium (1.0x)")
3. Display: Back button
4. User adjusts slider:
   a. oninput event fires
   b. menuController.handleSpeedChange(sliderValue, gameState)
   c. gameState.setSpeedMultiplier(sliderValue)
   d. Speed label updates immediately (e.g., "Fast (1.5x)")
   e. Renderer.draw() refreshes (no screen change, only label update)
5. User clicks Back:
   a. menuController.handleBackFromOptions()
   b. showOptions = false
   c. Renderer.draw() shows Main menu

Playing Phase (Speed Applied):
1. User clicks "Start" from main menu
   a. gameState.phase = "playing"
   b. gameState.speedMultiplier = <value set in Options>
2. Game loop runs:
   a. Physics.update(deltaTime)
   b. For each frame:
      - ball.vx *= gameState.speedMultiplier
      - ball.vy *= gameState.speedMultiplier
   c. Ball moves at adjusted speed
3. User adjusts speed during pause (future feature):
   a. Press Escape to pause (if implemented)
   b. Speed slider available during pause
   c. Speed change applies when pause ends

Speed Persistence Within Session:
- Speed multiplier persists in gameState.speedMultiplier
- Remains set when user returns to menu or restarts game
- Resets to 1.0 on page reload (localStorage not in V1)

Speed Application:
- Multiplier scales both vx and vy equally
- Direction unchanged; only magnitude affected
- Change takes effect immediately on next physics frame
```

## Observability Impact

**Console Logging (debug only):**
- Log speed change: "Speed multiplier updated: 1.0 → 1.5"
- Log slider value: "Slider value: 1.5 (Very Fast)"
- Log ball velocity adjustment: "Ball speed: vx=150, vy=-150 × 1.5 = vx=225, vy=-225"

**Visual Feedback:**
- Speed slider visible in Options screen
- Slider position reflects current speed multiplier
- Speed label updates in real-time: "Medium (1.0x)" → "Very Fast (2.0x)"
- Ball moves noticeably faster/slower when game resumes after speed adjustment
- Smooth slider interaction (no lag)

## Notes

- Speed multiplier range: 0.5x (very slow) to 2.0x (very fast)
- Default speed: 1.0x (medium)
- Slider step size: 0.1 (10 discrete positions across range)
- Speed is applied uniformly to both vx and vy components
- Speed change during gameplay is immediate (next frame)
- Speed persists in session but resets to 1.0 on page reload (localStorage upgrade deferred to V2)
- Options button only appears on main menu (not during gameplay)
- Back button returns to main menu (no pause/resume feature in V1)

---

**Status:** Ready for implementation. Depends on Slices 1-5 completion.
