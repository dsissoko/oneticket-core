<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

# Slice 3 — Game States & Lives

## Goal

Implement the complete game state lifecycle, lives management (starting with 3, losing 1 on ball bottom), and state transitions (menu → playing → gameOver/victory), plus speed adjustment menu and controls.

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related User Stories

[US-003 — Implement Lives System and Game Over Detection](us-003-lives-system.md)

[US-004 — Add Paddle Speed Control Slider](us-004-paddle-speed-slider.md)

## Impacted Components

- **GameCanvas Component** (`app/components/GameCanvas.tsx`) — Game state machine and lifecycle
- **Menu UI Layer** — Start menu, pause/resume menu, game-over screen, victory screen
- **Game State Hook** — Phase tracking, lives counter, speed multiplier persistence
- **Input System** — Slider input binding for speed adjustment

## Interfaces

### Input Interfaces
- **Slider Control** — Range 0.5x to 2.0x speed multiplier on speed menu
- **Start Button** — Transitions from menu → playing
- **Restart Button** — Transitions from gameOver/victory → menu
- **Quit Button** — Menu option to exit game (framework-dependent)

### Game State Transitions
```
menu ──[Start]──> playing
      ├─[Settings]─> menu (speed menu overlay)
      └────────────> menu (quit)

playing ─[All Lives Lost]──> gameOver
    └──[All Bricks Gone]──> victory
    └──[Speed Slider]────> playing (updated speed only)

gameOver ──[Restart]──> menu
victory ──[Restart]──> menu
```

### Rendering Output
- **Lives Counter** — Displayed on canvas (top-left or top-center)
- **Speed Display** — Current speed multiplier indicator (top-right)
- **Menu Overlays** — Semi-transparent panels with text labels and buttons
- **Game-Over Screen** — Message + restart button
- **Victory Screen** — Congratulations message + restart button

## Data Changes

### GameState Object Extension

```typescript
interface GameState {
  // Existing fields
  ball: { x: number; y: number; radius: number; vx: number; vy: number };
  paddle: { x: number; y: number; width: number; height: number };
  bricks: Array<{ x: number; y: number; width: number; height: number; alive: boolean }>;
  
  // Lives & Phase Management
  phase: 'menu' | 'playing' | 'gameOver' | 'victory';
  lives: number; // Starts at 3, decrements to 0
  speedMultiplier: number; // Range 0.5 to 2.0, controls ball velocity scaling
}
```

### State Update Rules
1. **Initialization** — `lives = 3`, `phase = 'menu'`, `speedMultiplier = 1.0`
2. **Ball at Bottom** — If `ball.y + ball.radius >= canvas.height`: `lives--`, reset ball position
3. **Lives Check** — If `lives === 0`: `phase = 'gameOver'`
4. **Bricks Check** — If all bricks `alive === false`: `phase = 'victory'`
5. **Speed Adjustment** — Slider input updates `speedMultiplier` in real-time; affects `ball.vx` and `ball.vy` each frame

## Sequence Flow

### Initialization Phase
```
User Opens Game
  → phase = 'menu'
  → lives = 3
  → speedMultiplier = 1.0
  → Render menu overlay with start button + speed slider
```

### Playing Phase
```
User Clicks Start
  → phase = 'playing'
  → Render canvas with lives counter and speed indicator
  → Each frame: update physics with speedMultiplier applied
```

### Ball Lost Scenario
```
Ball reaches bottom (ball.y + radius >= canvas.height)
  → lives--
  → Reset ball to paddle position
  → If lives > 0: continue playing
  → If lives === 0: phase = 'gameOver', render game-over screen
```

### Victory Scenario
```
All bricks destroyed (no alive bricks remain)
  → phase = 'victory'
  → Render victory screen with restart button
```

### Restart Flow
```
User Clicks Restart
  → phase = 'menu'
  → Reset lives = 3
  → Reset bricks array (all alive = true)
  → Reset ball position
  → Return to menu overlay
```

### Speed Adjustment During Play
```
User Adjusts Slider (while playing)
  → speedMultiplier updates immediately
  → Next frame: ball.vx *= speedMultiplier, ball.vy *= speedMultiplier
  → Visual feedback: speed indicator updates on canvas
```

## Observability Impact

### Console Logging
- Log phase transitions: `console.log('Phase: menu → playing')`
- Log lives changes: `console.log('Lives: 3 → 2')`
- Log speed updates: `console.log('Speed Multiplier: 1.0x → 1.5x')`

### On-Canvas Display
- **Lives Counter** — Rendered as text (top-left): `Lives: 3`
- **Speed Indicator** — Rendered as text (top-right): `Speed: 1.5x`
- **Pause State Indicator** — If applicable, show "PAUSED" overlay

### Edge Cases to Monitor
- Double ball-loss detection (same frame)
- Speed multiplier clamping (must stay 0.5 ≤ x ≤ 2.0)
- Restart without clearing canvas (potential artifact ghosting)
- Menu overlay z-index conflicts with game canvas