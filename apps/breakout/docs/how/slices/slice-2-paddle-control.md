# Slice 2 — Paddle Control

## Overview

This slice implements keyboard-based paddle control using arrow keys. The paddle responds immediately to key press and release events, maintains velocity during held keys, respects screen boundaries, and provides smooth, lag-free movement for interactive gameplay.

## Related User Stories

- **US-003** — Paddle Control with Arrow Keys: Player controls paddle left/right with arrow keys, paddle stops at screen edges

## Technical Components to Implement

### 1. Enhanced Input Handler Module (`js/inputHandler.js` - extension)

**Purpose:** Captures keyboard input and translates to paddle velocity changes.

**Responsibilities:**
- Listen to `keydown` and `keyup` events
- Track key state (which keys are currently pressed)
- Update paddle velocity based on key state
- Prevent default browser behavior for arrow keys
- Apply velocity to game state during update calls

**Key Properties:**
```javascript
class InputHandler {
  constructor(gameState) {
    this.gameState = gameState;
    this.keysPressed = {
      ArrowLeft: false,
      ArrowRight: false
    };
    this.paddleSpeed = 300; // pixels per second
  }
}
```

**Key Methods:**
```javascript
class InputHandler {
  registerListeners() {
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
  }
  
  onKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.keysPressed.ArrowLeft = true;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.keysPressed.ArrowRight = true;
    }
  }
  
  onKeyUp(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.keysPressed.ArrowLeft = false;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.keysPressed.ArrowRight = false;
    }
  }
  
  update() {
    // Called each frame to sync key state to paddle velocity
    const { paddle } = this.gameState;
    
    if (this.keysPressed.ArrowLeft && this.keysPressed.ArrowRight) {
      // Both pressed: stop
      paddle.vx = 0;
    } else if (this.keysPressed.ArrowLeft) {
      // Left only: move left
      paddle.vx = -this.paddleSpeed;
    } else if (this.keysPressed.ArrowRight) {
      // Right only: move right
      paddle.vx = this.paddleSpeed;
    } else {
      // Neither pressed: stop
      paddle.vx = 0;
    }
  }
  
  isKeyPressed(key) {
    return this.keysPressed[key] || false;
  }
}
```

### 2. Enhanced Physics Module (`js/physics.js` - extension)

**Purpose:** Apply paddle velocity to position updates; enforce boundary constraints.

**Responsibilities:**
- Update paddle position based on velocity: `x += vx * dt`
- Clamp paddle X to screen boundaries [paddleWidth/2, canvasWidth - paddleWidth/2]
- Maintain paddle Y position (fixed at bottom)

**Key Methods:**
```javascript
class Physics {
  update(deltaTime) {
    const { paddle, ball } = this.gameState;
    
    // Update ball position
    ball.x += ball.vx * deltaTime;
    ball.y += ball.vy * deltaTime;
    
    // Update paddle position based on velocity
    paddle.x += paddle.vx * deltaTime;
    
    // Clamp paddle to bounds
    this.clampPaddleToBounds();
  }
  
  clampPaddleToBounds() {
    const { paddle } = this.gameState;
    const canvasWidth = 800;
    const minX = paddle.width / 2;
    const maxX = canvasWidth - paddle.width / 2;
    
    paddle.x = Math.max(minX, Math.min(paddle.x, maxX));
  }
}
```

### 3. Game Loop Integration (`js/gameLoop.js` - enhancement)

**Purpose:** Call input handler update during each frame.

**Responsibilities:**
- Call `inputHandler.update()` before physics update to sync key state
- Ensure input processing happens before rendering

**Integration Point:**
```javascript
run(timestamp) {
  if (!this.lastTimestamp) this.lastTimestamp = timestamp;
  const deltaTime = (timestamp - this.lastTimestamp) / 1000;
  this.lastTimestamp = timestamp;
  
  // NEW: Process keyboard input at frame start
  this.inputHandler.update(); // Updates paddle.vx based on key state
  
  // Then apply physics
  this.physics.update(deltaTime); // Updates paddle.x based on paddle.vx
  
  // Collision detection
  const collision = this.collisionDetector.detectAndResolve(this.gameState);
  
  // Rendering
  this.renderer.draw(this.gameState);
  
  if (this.gameState.phase === 'playing') {
    requestAnimationFrame((t) => this.run(t));
  }
}
```

## Dependencies & Technical Sequence

```
Slice 0 (Game Foundation)
    ↓
Slice 2 (Paddle Control)
    ├── Depends: GameState, InputHandler, Physics, GameLoop
    ├── Enhances: inputHandler.js, physics.js, gameLoop.js
    └── Integrates: Keyboard events into paddle movement
```

## Target Files

```
apps/breakout/
├── js/
│   ├── inputHandler.js (enhanced with key tracking and paddle velocity update)
│   ├── physics.js       (enhanced with paddle position and boundary clamping)
│   └── gameLoop.js      (enhanced to call inputHandler.update())
```

## Paddle Movement Logic

```
Frame Loop:
  1. InputHandler.update() — Read key state and set paddle.vx
     - Left Arrow pressed → paddle.vx = -300
     - Right Arrow pressed → paddle.vx = +300
     - Neither or both → paddle.vx = 0
  
  2. Physics.update(deltaTime) — Apply velocity to position
     - paddle.x += paddle.vx * deltaTime
     - Clamp to bounds: [paddleWidth/2, canvasWidth - paddleWidth/2]
  
  3. Collision detection and rendering proceed normally
```

## Acceptance Criteria

- **Criterion 1** — Left arrow key moves paddle left
- **Criterion 2** — Right arrow key moves paddle right
- **Criterion 3** — Paddle stops at screen boundaries
- **Criterion 4** — Control is responsive (input lag minimal)
- **Criterion 5** — Paddle never leaves play area
- **Criterion 6** — Pressing both keys simultaneously stops paddle movement
- **Criterion 7** — Releasing key stops paddle immediately

## Testing Strategy

### Unit Tests
- InputHandler correctly sets keysPressed on keydown/keyup
- InputHandler.update() correctly maps key state to paddle.vx
- Physics.clampPaddleToBounds() prevents paddle from leaving bounds
- Boundary calculations are correct for different canvas widths

### Integration Tests
- Keyboard events flow through InputHandler to Physics to Renderer
- Paddle position updates visually match key presses
- Boundary clamping works at both edges
- Simultaneous left+right keys produce zero velocity

### Manual Testing
- Press left arrow; observe paddle moves left smoothly
- Press right arrow; observe paddle moves right smoothly
- Hold arrow at screen edge; observe paddle stops at boundary
- Test both keys simultaneously; observe paddle stops
- Verify no input lag (paddle responds within one frame)
- Catch ball with paddle at various paddle positions

## Implementation Notes

1. **Paddle Speed:** Default 300 pixels/second (adjustable constant)
2. **Key Tracking:** Use boolean object to track active keys
3. **Event Prevention:** Call `preventDefault()` on arrow keys to prevent scrolling
4. **Frame-Driven Updates:** Update velocity each frame based on current key state (not event-driven)
5. **Boundary Safety:** Clamp after velocity is applied (defensive programming)
6. **Canvas Width:** Use 800 as default; make configurable for different layouts

## Configuration Constants

```javascript
const PADDLE_SPEED = 300;        // pixels/second
const CANVAS_WIDTH = 800;        // pixels
const PADDLE_WIDTH = 80;         // pixels
const PADDLE_HEIGHT = 10;        // pixels
const PADDLE_MARGIN_BOTTOM = 20; // pixels from canvas bottom
```

## Related Slices

- **Slice 0** — Game Foundation (prerequisite)
- **Slice 1** — Ball Physics (paddle collides with ball)
- **Slice 3** — Lives System (paddle catches ball to prevent life loss)
- **Slice 4** — Victory Menu (paddle used during playing phase)

---

**Status:** Ready for implementation  
**Priority:** High (core gameplay interaction)  
**Estimated Effort:** 1-2 days
