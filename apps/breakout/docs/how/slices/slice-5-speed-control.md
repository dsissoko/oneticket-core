# Slice 5 — Speed Control and Difficulty Adjustment

## Overview

This slice implements the speed slider in the options menu, allowing players to adjust ball velocity between 0.5x (very slow) and 2.0x (very fast) the default speed. The selected speed applies immediately when a new game starts. Speed preference persists in memory during the menu session and resets to default (1.0x) when a new game session starts.

## Related User Stories

- **US-006** — Speed Control: Player adjusts ball speed via slider in options menu (0.5x to 2.0x); speed applies to new game and persists during menu session

## Technical Components to Implement

### 1. Enhanced GameState Module (`js/gameState.js` - extension)

**Purpose:** Track and manage speed multiplier state.

**Responsibilities:**
- Initialize speedMultiplier to 1.0 (default)
- Provide method to set speed multiplier
- Clamp speed multiplier to [0.5, 2.0] range
- Reset speed to default on game reset

**Key Methods:**
```javascript
class GameState {
  constructor() {
    // ... existing properties ...
    this.speedMultiplier = 1.0;
  }
  
  setSpeedMultiplier(value) {
    // Clamp to valid range
    this.speedMultiplier = Math.max(0.5, Math.min(2.0, value));
  }
  
  reset() {
    // ... existing reset logic ...
    this.speedMultiplier = 1.0; // Reset to default on new game
  }
}
```

### 2. Enhanced Physics Module (`js/physics.js` - extension)

**Purpose:** Apply speed multiplier to ball velocity.

**Responsibilities:**
- Initialize ball velocity with speed multiplier applied
- Apply speed multiplier factor to velocity components
- Ensure velocity stays consistent with multiplier during gameplay

**Key Methods:**
```javascript
class Physics {
  constructor(gameState) {
    this.gameState = gameState;
    this.baseSpeed = 200; // pixels per second (unmodified)
  }
  
  initializeBallVelocity() {
    const angle = Math.PI / 4; // 45 degrees
    const baseSpeed = this.baseSpeed;
    const speedMultiplier = this.gameState.speedMultiplier;
    const effectiveSpeed = baseSpeed * speedMultiplier;
    
    this.gameState.ball.vx = effectiveSpeed * Math.cos(angle);
    this.gameState.ball.vy = -effectiveSpeed * Math.sin(angle);
  }
  
  applySpeedMultiplier(multiplier) {
    // Apply multiplier to existing velocity
    const current = Math.sqrt(
      this.gameState.ball.vx ** 2 + 
      this.gameState.ball.vy ** 2
    );
    
    if (current > 0) {
      const scale = multiplier / this.gameState.speedMultiplier;
      this.gameState.ball.vx *= scale;
      this.gameState.ball.vy *= scale;
    }
    
    this.gameState.setSpeedMultiplier(multiplier);
  }
}
```

### 3. Enhanced MenuController Module (`js/menuController.js` - extension)

**Purpose:** Render options menu with speed slider; handle slider interaction.

**Responsibilities:**
- Render options screen with speed slider
- Attach event listener to slider
- Update speed multiplier in game state
- Display current speed value (e.g., "1.5x")
- Provide "Back" button to return to main menu

**Key Methods:**
```javascript
class MenuController {
  renderOptions() {
    const container = document.getElementById('menu-container');
    const currentSpeed = this.gameState.speedMultiplier.toFixed(1);
    
    container.innerHTML = `
      <div class="options-menu">
        <h1>Options</h1>
        
        <div class="option-section">
          <h3>Vitesse de la Balle</h3>
          <div class="speed-control">
            <span class="speed-label">Très Lent</span>
            
            <input 
              type="range" 
              id="speed-slider" 
              min="0.5" 
              max="2.0" 
              step="0.1" 
              value="${currentSpeed}"
              class="speed-slider"
            >
            
            <span class="speed-label">Très Rapide</span>
          </div>
          
          <div class="speed-display">
            <span id="speed-value" class="speed-value">${currentSpeed}x</span>
            <span id="speed-description" class="speed-description">Normal</span>
          </div>
        </div>
        
        <button id="back-btn" class="btn btn-secondary">Retour</button>
      </div>
    `;
    
    this.attachOptionsListeners();
  }
  
  attachOptionsListeners() {
    const slider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const speedDescription = document.getElementById('speed-description');
    
    // Slider change event
    slider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      
      // Update game state
      this.gameState.setSpeedMultiplier(value);
      
      // Update display
      speedValue.textContent = value.toFixed(1) + 'x';
      
      // Update description based on speed
      if (value < 0.75) {
        speedDescription.textContent = 'Très Lent';
      } else if (value < 1.0) {
        speedDescription.textContent = 'Lent';
      } else if (value === 1.0) {
        speedDescription.textContent = 'Normal';
      } else if (value < 1.5) {
        speedDescription.textContent = 'Rapide';
      } else {
        speedDescription.textContent = 'Très Rapide';
      }
    });
    
    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
      this.renderMainMenu();
    });
  }
}
```

### 4. Enhanced GameLoop Module (`js/gameLoop.js` - integration)

**Purpose:** Ensure speed multiplier is applied when ball velocity is initialized.

**Integration Point:**
```javascript
class GameLoop {
  resetBallPosition() {
    const { ball, paddle } = this.gameState;
    ball.x = paddle.x;
    ball.y = paddle.y - 30;
    
    // Initialize velocity with current speed multiplier
    this.physics.initializeBallVelocity();
  }
  
  handleStartGame() {
    // GameLoop calls this when starting a new game
    // Speed multiplier from gameState is already set
    // Ball will be initialized with correct speed in resetBallPosition
  }
}
```

### 5. CSS Styling Enhancement

**Purpose:** Style options menu and speed slider.

**Target File:** `apps/breakout/css/styles.css` (enhancement)

```css
/* Options Menu */
.options-menu {
  min-width: 400px;
}

.option-section {
  margin: 30px 0;
  text-align: center;
}

.option-section h3 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #00d9ff;
}

.speed-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
}

.speed-label {
  font-size: 12px;
  color: #aaa;
  min-width: 70px;
}

.speed-slider {
  width: 250px;
  height: 8px;
  border-radius: 5px;
  background: linear-gradient(to right, #444 0%, #666 50%, #444 100%);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

/* WebKit (Chrome, Safari) */
.speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00d9ff;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
  transition: all 0.2s ease;
}

.speed-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.8);
}

/* Firefox */
.speed-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00d9ff;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
  transition: all 0.2s ease;
}

.speed-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.8);
}

.speed-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin: 20px 0;
}

.speed-value {
  font-size: 28px;
  font-weight: bold;
  color: #00d9ff;
}

.speed-description {
  font-size: 14px;
  color: #aaa;
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
    ↓
Slice 5 (Speed Control)
    ├── Depends: All previous slices
    ├── Enhances: gameState.js, physics.js, menuController.js, gameLoop.js, styles.css
    └── Integrates: Speed multiplier into game physics
```

## Target Files

```
apps/breakout/
├── js/
│   ├── gameState.js           (enhanced with speedMultiplier getter/setter)
│   ├── physics.js             (enhanced with applySpeedMultiplier method)
│   ├── menuController.js      (enhanced with options menu and slider)
│   └── gameLoop.js            (ensures speed applied on ball init)
└── css/
    └── styles.css             (add speed slider and options menu styles)
```

## Speed Control Flow

```
Game Startup:
  gameState.speedMultiplier = 1.0 (default)

Main Menu:
  "Options" → renderOptions()
    ├─ Display slider at current value (1.0x)
    ├─ Player moves slider to desired value (e.g., 1.5x)
    ├─ Slider 'input' event → gameState.setSpeedMultiplier(1.5)
    ├─ Display updates to "1.5x"
    └─ Value persists in memory

Player Starts Game:
  "Démarrer" → handleStartGame()
    ├─ Initialize bricks with full layout
    ├─ Reset ball position above paddle
    ├─ physics.initializeBallVelocity() called
    ├─ Ball velocity = baseSpeed × speedMultiplier (200 × 1.5 = 300 px/s)
    └─ Game begins with adjusted speed

Ball Lost / New Attempt:
  resetBallPosition()
    ├─ Ball respawned above paddle
    └─ initializeBallVelocity() applies current speedMultiplier

New Game Session:
  gameState.reset()
    ├─ speedMultiplier reset to 1.0 (default)
    ├─ Player can adjust in options before starting
    └─ Speed persists only during single menu session
```

## Acceptance Criteria

- **Criterion 1** — Speed slider accessible from Options menu
- **Criterion 2** — Slider range is 0.5x to 2.0x with 0.1 increment steps
- **Criterion 3** — Current speed value displayed as text (e.g., "1.5x")
- **Criterion 4** — Speed description shown (Very Slow, Slow, Normal, Fast, Very Fast)
- **Criterion 5** — Slider responds to user interaction with visual feedback
- **Criterion 6** — Speed applied to new game when started from menu
- **Criterion 7** — Ball moves at correct speed during gameplay (1x, 0.5x, 2x etc.)
- **Criterion 8** — Speed value persists during menu navigation (not lost)
- **Criterion 9** — Speed resets to 1.0x on new session (after game-over or victory)
- **Criterion 10** — No lag when adjusting slider

## Testing Strategy

### Unit Tests
- `setSpeedMultiplier()` clamps values to [0.5, 2.0]
- `applySpeedMultiplier()` correctly scales velocity
- `initializeBallVelocity()` produces correct magnitude with multiplier
- Speed value is correctly displayed as text

### Integration Tests
- Slider interaction updates game state
- Speed value display updates in real-time
- Ball moves at correct speed for different multipliers
- Speed persists across menu navigation
- Speed resets on new game session

### Manual Testing
- Open Options menu; verify slider displays
- Adjust slider to different values; watch display update
- Start game with different speeds; visually verify ball speed difference
- Complete game; verify speed resets on new session
- Test at minimum (0.5x) and maximum (2.0x) speeds
- Verify smooth slider movement (no jitter)

## Implementation Notes

1. **Base Speed:** Default 200 pixels/second (definable constant)
2. **Multiplier Range:** [0.5, 2.0] with 0.1 step (client-side validation)
3. **Display Format:** Always show 1 decimal place (e.g., "1.0x", "1.5x")
4. **Speed Application:** Applied at ball initialization time (not during flight)
5. **Persistence:** Stored in gameState.speedMultiplier only; no localStorage in V1
6. **Slider Styling:** Use custom styling for cross-browser compatibility

## Configuration Constants

```javascript
const MIN_SPEED = 0.5;
const MAX_SPEED = 2.0;
const DEFAULT_SPEED = 1.0;
const BASE_BALL_SPEED = 200; // pixels/second
const SPEED_STEP = 0.1;
```

## Future Enhancement: localStorage Persistence

For future versions, enable cross-session persistence:

```javascript
// In MenuController
saveSpeedPreference() {
  localStorage.setItem('breakout-speed', this.gameState.speedMultiplier);
}

loadSpeedPreference() {
  const saved = localStorage.getItem('breakout-speed');
  if (saved) {
    this.gameState.setSpeedMultiplier(parseFloat(saved));
  }
}
```

## Related Slices

- **Slice 0** — Game Foundation (prerequisite)
- **Slice 1** — Ball Physics (velocity calculation)
- **Slice 2** — Paddle Control (game interaction)
- **Slice 3** — Lives System (game reset)
- **Slice 4** — Victory & Menu (options menu access)

---

**Status:** Ready for implementation  
**Priority:** Medium (gameplay enhancement, not critical for MVP)  
**Estimated Effort:** 1-2 days
