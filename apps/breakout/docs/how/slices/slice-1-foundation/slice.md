<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

# Slice 1 — Foundation (Canvas & Game Loop)

## Goal

Establish the core technical foundation of the Breakout game by implementing a 60 FPS game loop with Canvas 2D rendering and initializing all foundational game objects (paddle, ball, brick grid).

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related User Stories

[US-001 — Initialize Canvas and Game Loop](us-001-initialize-canvas.md)

## Impacted Components

- **GameCanvas Component** (`app/components/GameCanvas.tsx`) — Main container for canvas element and frame loop
- **Game State** (internal useRef) — Initial state structure for paddle, ball, bricks, lives
- **Canvas 2D Context** — Rendering context for all visual output

## Interfaces

### Input
- Canvas viewport dimensions (full page width/height)
- Initialization parameters (paddle width, ball radius, brick grid dimensions)

### Output
- Rendered canvas with initial game objects (paddle at bottom center, ball at paddle position, brick grid at top)
- Frame loop running at 60 FPS via `requestAnimationFrame`

## Data Changes

**Initial Game State Structure:**
```typescript
interface GameState {
  phase: 'menu' | 'playing'
  ball: { x: number, y: number, radius: number, vx: number, vy: number }
  paddle: { x: number, y: number, width: number, height: number }
  bricks: Array<{ x: number, y: number, width: number, height: number, alive: boolean }>
  lives: number
  speedMultiplier: number
}
```

## Sequence Flow

1. Component mount: Initialize canvas ref and get 2D context
2. Create initial game state:
   - Paddle: positioned at bottom center (y = canvas.height - paddleHeight - margin)
   - Ball: positioned at paddle center, stationary (vx = 0, vy = 0)
   - Bricks: grid layout at top of canvas (5 rows, equally spaced columns)
   - Lives: set to 3
   - Speed multiplier: set to 1.0
3. Start `requestAnimationFrame` loop:
   - Calculate deltaTime since last frame
   - Update physics (ball position += velocity * deltaTime)
   - Clear canvas with background color
   - Render bricks, paddle, ball in order
   - Store current timestamp for next frame's deltaTime calculation
4. Continue loop until component unmounts or game phase changes

## Observability Impact

- Log frame count and deltaTime to console (development only)
- Display lives counter and speed multiplier on canvas (top-left corner)
- Console warnings if canvas context is unavailable
- Monitor initial render for canvas sizing correctness