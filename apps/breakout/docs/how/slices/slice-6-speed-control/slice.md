# Slice 6 — Speed Adjustment and UI Controls

## Goal

Implement an interactive speed slider that allows players to adjust ball velocity magnitude from 0.5x to 3x both before game start and during active gameplay. Provide real-time visual feedback on the current speed setting.

## Related Epics

- [Epic 0 — MVP Breakout](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-007 — Speed Slider Control for Ball Velocity](../../what/epics/epic-0-mvp/user-stories/us-007-speed-control.md)
- [US-002 — Ball Physics and Collision Detection](../../what/epics/epic-0-mvp/user-stories/us-002-ball-physics.md)
- [US-006 — Game State Transitions](../../what/epics/epic-0-mvp/user-stories/us-006-game-states.md)

## Impacted Components

From [Architecture](../architecture.md):
- **Input Handler** — Capture slider input (mouse events)
- **Physics Engine** — Apply speed multiplier to ball velocity
- **Renderer** — Draw slider UI in Menu and Active states
- **Game State** — Store current speed setting

## Interfaces

### Speed Slider Input Handling
```javascript
class SpeedSlider {
  constructor(x, y, width, height, minValue = 0, maxValue = 100) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.value = 50; // Default: medium speed
    this.isDragging = false;
  }
  
  handleMouseDown(mouseX, mouseY) {
    const thumbX = this.x + (this.width * this.value / this.maxValue);
    const thumbHitbox = 10; // 10px radius
    
    if (Math.abs(mouseX - thumbX) < thumbHitbox && 
        Math.abs(mouseY - this.y) < this.height / 2 + thumbHitbox) {
      this.isDragging = true;
      return true;
    }
    return false;
  }
  
  handleMouseMove(mouseX) {
    if (!this.isDragging) return;
    
    // Calculate new value based on mouse position
    const relativeX = Math.max(0, Math.min(this.width, mouseX - this.x));
    this.value = Math.round((relativeX / this.width) * this.maxValue);
  }
  
  handleMouseUp() {
    this.isDragging = false;
  }
  
  getValue() {
    return this.value; // 0–100
  }
  
  getSpeedMultiplier() {
    // Convert slider value (0–100) to speed multiplier (0.5x–3x)
    return 0.5 + (this.value / 100) * 2.5;
  }
}
```

### Speed Multiplier Application
```javascript
function updateBallSpeed(ball, sliderValue) {
  if (!ball.vx && !ball.vy) return; // Ball at rest
  
  // Convert slider value to multiplier
  const speedMultiplier = 0.5 + (sliderValue / 100) * 2.5;
  
  // Get current velocity angle
  const currentMagnitude = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  if (currentMagnitude === 0) return;
  
  const angle = Math.atan2(ball.vy, ball.vx);
  
  // Calculate new magnitude
  const baseSpeed = 4; // pixels per frame
  const newMagnitude = baseSpeed * speedMultiplier;
  
  // Apply new magnitude with preserved angle
  ball.vx = newMagnitude * Math.cos(angle);
  ball.vy = newMagnitude * Math.sin(angle);
}
```

### Slider Rendering
```javascript
function drawSpeedSlider(ctx, slider, x, y, width) {
  // Draw label
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Ball Speed:', x, y - 10);
  
  // Draw speed range labels
  ctx.font = '12px Arial';
  ctx.fillStyle = '#cccccc';
  ctx.fillText('Slow', x, y + 25);
  ctx.fillText('Fast', x + width - 30, y + 25);
  
  // Draw slider track
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
  
  // Calculate thumb position
  const thumbX = x + (width * slider.value / slider.maxValue);
  
  // Draw thumb (slider handle)
  ctx.fillStyle = '#4444ff';
  ctx.beginPath();
  ctx.arc(thumbX, y, 8, 0, 2 * Math.PI);
  ctx.fill();
  
  // Draw speed percentage text
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  const multiplier = slider.getSpeedMultiplier();
  ctx.fillText(`${multiplier.toFixed(1)}x`, x + width / 2, y + 40);
}

function drawSliderInMenuState(ctx, gameState) {
  // Menu screen slider (larger, more prominent)
  drawSpeedSlider(ctx, gameState.speedSlider, 250, 300, 300);
}

function drawSliderInActiveState(ctx, gameState) {
  // Active game slider (smaller, corner overlay)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(10, gameState.canvasHeight - 60, 200, 50);
  drawSpeedSlider(ctx, gameState.speedSlider, 20, gameState.canvasHeight - 45, 180);
}
```

### Input Integration
```javascript
class InputHandler {
  constructor(canvas, gameState, stateMachine) {
    this.canvas = canvas;
    this.gameState = gameState;
    this.stateMachine = stateMachine;
    
    this.keyState = {
      leftPressed: false,
      rightPressed: false
    };
    
    this.setupListeners();
  }
  
  setupListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Mouse events for slider
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    
    // Click events for buttons
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
  }
  
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if slider thumb clicked
    if (this.gameState.speedSlider.handleMouseDown(mouseX, mouseY)) {
      e.preventDefault();
      return;
    }
  }
  
  handleMouseMove(e) {
    if (!this.gameState.speedSlider.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Update slider value
    this.gameState.speedSlider.handleMouseMove(mouseX);
    
    // Apply speed change immediately
    const newSliderValue = this.gameState.speedSlider.getValue();
    this.gameState.speed = this.gameState.speedSlider.getSpeedMultiplier();
    
    // If game is active, update ball speed
    if (this.stateMachine.getState() === 'Active') {
      updateBallSpeed(this.gameState.ball, newSliderValue);
    }
  }
  
  handleMouseUp(e) {
    this.gameState.speedSlider.handleMouseUp();
  }
  
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const state = this.stateMachine.getState();
    
    if (state === 'Menu') {
      // Check start button
      if (clickX > 250 && clickX < 550 &&
          clickY > 350 && clickY < 400) {
        this.stateMachine.transition('Active');
      }
    }
    
    if (state === 'Win') {
      // Check play again button
      if (clickX > 250 && clickX < 550 &&
          clickY > 350 && clickY < 400) {
        this.stateMachine.transition('Menu');
      }
    }
    
    if (state === 'Loss') {
      // Check try again button
      if (clickX > 250 && clickX < 550 &&
          clickY > 350 && clickY < 400) {
        this.stateMachine.transition('Menu');
      }
    }
  }
  
  handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      this.keyState.leftPressed = true;
      e.preventDefault();
    }
    if (e.key === 'ArrowRight') {
      this.keyState.rightPressed = true;
      e.preventDefault();
    }
    if (e.key === ' ') {
      // Toggle pause
      const state = this.stateMachine.getState();
      if (state === 'Active') {
        this.stateMachine.transition('Pause');
      } else if (state === 'Pause') {
        this.stateMachine.transition('Active');
      }
      e.preventDefault();
    }
  }
  
  handleKeyUp(e) {
    if (e.key === 'ArrowLeft') {
      this.keyState.leftPressed = false;
    }
    if (e.key === 'ArrowRight') {
      this.keyState.rightPressed = false;
    }
  }
  
  updatePaddleFromInput(paddle, bounds) {
    const paddleSpeed = 6; // pixels per frame
    
    if (this.keyState.leftPressed) {
      paddle.x = Math.max(0, paddle.x - paddleSpeed);
    }
    if (this.keyState.rightPressed) {
      paddle.x = Math.min(bounds.right - paddle.width, paddle.x + paddleSpeed);
    }
  }
}
```

## Data Changes

### Game State Additions
```javascript
{
  speed: number,              // Current speed multiplier (0.5 to 3.0)
  speedSlider: SpeedSlider    // Slider object with state
}

// SpeedSlider contains:
{
  value: number,              // 0–100
  minValue: 0,
  maxValue: 100,
  isDragging: boolean,
  x, y, width, height         // Position and dimensions
}
```

## Sequence Flow

### Menu State with Slider
```
1. Player sees menu screen with speed slider
2. Slider visual shows current value (default 50 = 1.5x)
3. Player moves mouse to slider and clicks
4. handleMouseDown() captures thumb
5. Player drags left (slow) or right (fast)
6. handleMouseMove() updates slider.value each frame
7. Text display shows multiplier: 0.5x, 1.0x, 1.5x, 2.0x, 2.5x, 3.0x
8. Player releases mouse
9. Player clicks "START GAME"
10. Game transitions to Active with slider setting stored
```

### Active State Speed Adjustment
```
1. Game runs in Active state, ball moving at current speed
2. Small slider visible in corner (optional)
3. Player adjusts slider during play
4. handleMouseMove() triggers updateBallSpeed()
5. Ball velocity magnitude changes immediately
6. Ball direction preserved (angle unchanged)
7. Subsequent bounces reflect new speed
8. Speed persists across life loss
```

### Speed Persistence
```
1. Player sets speed to 75% (2.25x) in menu
2. Game starts with ball at 2.25x speed
3. Ball falls, life lost → ball resets
4. Ball relaunches at same 2.25x speed (slider unchanged)
5. Player can adjust slider at any time
```

## Observability Impact

### Logging
- Log slider value change: `console.log('Speed slider:', value, '/', 100)`
- Log calculated multiplier: `console.log('Speed multiplier:', multiplier.toFixed(1), 'x')`
- Log ball velocity on speed change: `console.log('Ball velocity magnitude:', magnitude)`

### Metrics
- Current speed multiplier displayed on screen
- Speed adjustment frequency (diagnostics)

### Debugging
- Display slider value in corner
- Show speed multiplier (0.5x–3x)
- Log ball velocity before/after adjustment

## Testing Strategy

### Unit Tests
- `SpeedSlider.getValue()` returns correct value (0–100)
- `SpeedSlider.getSpeedMultiplier()` calculates correct multiplier (0.5–3.0)
- `updateBallSpeed()` preserves direction angle
- `updateBallSpeed()` changes magnitude correctly
- Slider drag position maps to value correctly
- Slider value clamped to [0, 100]

### Integration Tests
- Slider operates in Menu state
- Slider operates in Active state
- Speed change applied to ball immediately
- Ball angle preserved during speed change
- Speed persists across life loss
- Speed persists across frame resets

### Visual Tests
- Slider thumb visible and draggable
- Slider track visible with labels
- Speed multiplier text displays correctly
- Active game slider displays in corner
- No UI overlaps or visual glitches

## Acceptance Criteria Met

✅ Speed slider visible in Menu
✅ Slider ranges from Slow to Fast (0.5x to 3x)
✅ Default position at medium (50%, 1.5x)
✅ Player can adjust speed before game starts
✅ Speed takes effect on game launch
✅ Speed slider adjustable during active gameplay
✅ Ball velocity updates immediately
✅ Direction of motion preserved
✅ Speed persists across life loss
✅ Speed label shows current multiplier

## Next Slices

- [Slice 7 — Win/Loss Conditions and Final Integration](../slice-7-win-loss-conditions/slice.md) — Final integration with all components
