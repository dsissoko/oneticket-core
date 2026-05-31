# Architecture — Breakout Game

## 1. Architecture Principles

- **Single Responsibility** — Separate concerns: game state management, collision detection, rendering, and user input
- **Frame-Based Loop** — Use `requestAnimationFrame` for 60 FPS consistency with deltaTime for frame-independent physics
- **Immutable State Updates** — Game state changes are applied each frame without mutations
- **Canvas-First Rendering** — All visual output through HTML5 Canvas 2D context

## 2. System Overview

Breakout is a web-based arcade game built on AppShell (React + Vite + TypeScript). The core gameplay runs within a `GameCanvas` component that manages a frame loop, collision detection (AABB), and game state. Players control a paddle with mouse/touch input to bounce a ball and destroy bricks.

## 3. Architectural Style

**Client-Side Game Engine** with React component wrapper. The game loop runs independently within canvas using `useRef` and `requestAnimationFrame`. React state is lightweight and only updates at frame boundaries. The architecture prioritizes frame-rate consistency and decouples input handling from physics simulation.

## 4. Main Technical Boundaries

### Frontend (React + Vite + TypeScript)
- **GameCanvas Component** — Container for the game loop and canvas element
- **Game State Hook** — Manages ball, paddle, bricks, lives, velocity, game phase (menu/playing/gameOver/victory)
- **Input System** — Mouse movement maps to paddle position; slider input maps to ball speed multiplier
- **Menu Layer** — Start menu (before play), pause/speed menu (overlay during play), game-over/victory screens

### Canvas Rendering Layer
- **2D Context** — All graphics drawn via `canvas.getContext('2d')`
- **Game Objects** — Ball (circle), Paddle (rectangle), Bricks (grid of rectangles)
- **Collision Detection** — AABB (Axis-Aligned Bounding Box) for ball vs. walls, paddle, and bricks

### Game Loop
- **requestAnimationFrame** — Drives frame rendering at browser refresh rate (~60 FPS)
- **deltaTime** — Tracks elapsed milliseconds per frame for frame-independent movement
- **Physics Update** — Ball position updated with velocity * deltaTime; paddle follows mouse position
- **Collision Resolution** — AABB checks each frame; velocity reversed on contact; bricks marked for removal

## 5. Key Components

### GameCanvas Component
**Location:** `app/components/GameCanvas.tsx`

A React functional component that manages the canvas element and game lifecycle. Uses `useRef` to maintain canvas reference and internal game state (not React state to avoid re-renders). Mounts a `requestAnimationFrame` loop on component mount.

**Responsibilities:**
- Render canvas element and receive canvas ref
- Initialize game state (paddle at bottom center, ball at paddle position, brick grid at top, lives = 3)
- Run frame loop: update physics, detect collisions, render graphics, check win/loss conditions
- Handle mouse input for paddle movement
- Render menu overlays (start, speed, game-over, victory screens)

### Game State Object
**Location:** Internal to GameCanvas (useRef state)

```typescript
interface GameState {
  phase: 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory'
  ball: { x: number, y: number, radius: number, vx: number, vy: number }
  paddle: { x: number, y: number, width: number, height: number }
  bricks: Array<{ x: number, y: number, width: number, height: number, alive: boolean }>
  lives: number
  speedMultiplier: number // 0.5 to 2.0
  score?: number
}
```

### Collision Detection Module
**Location:** `app/utils/collision.ts`

Pure functions for AABB collision detection:
- `checkAABB(rect1, rect2)` — Returns true if two axis-aligned rectangles overlap
- `checkCircleAABB(circle, rect)` — Returns true if circle (ball) overlaps rectangle (paddle/brick/wall)
- `resolveBallCollision(ball, obstacle)` — Returns which velocity component to reverse (vx, vy, or both)

## 6. Key Interfaces

### Input Interface
- **Mouse Movement** → Paddle horizontal position (constrained to canvas width)
- **Slider Adjustment** → Speed multiplier applied to ball velocity each frame
- **Menu Buttons** → Start game, resume game, restart, adjust speed

### Rendering Pipeline
- Canvas cleared each frame with background color
- Game objects drawn in order: bricks, paddle, ball
- UI overlays: lives counter, speed display, menu screens

### Game State Transitions
```
menu → [start button] → playing
playing → [all lives lost] → gameOver
playing → [all bricks destroyed] → victory
gameOver/victory → [restart button] → menu
```

## 7. Data Architecture

**No persistent data storage** — Game state lives entirely in memory during a play session. No database, localStorage, or server communication required for MVP.

**State Updates Per Frame:**
1. Apply input (mouse position, slider value)
2. Update physics (ball position += velocity * deltaTime)
3. Detect collisions (AABB checks against all obstacles)
4. Resolve collisions (reverse velocity, mark bricks for removal)
5. Check win/loss conditions
6. Render canvas
7. Repeat

## 8. Security Architecture

Not applicable for MVP — client-side game with no server communication or authentication required.

## 9. Deployment Strategy

Standard React + Vite deployment:
- `npm run build` generates optimized bundle
- Output served via static hosting (Vercel, GitHub Pages, etc.)
- No runtime dependencies beyond React and Vite
- Single HTML entry point with embedded canvas element

## 10. Observability Strategy

For debugging during development:
- Log frame count and delta time in console
- Display lives and speed multiplier on canvas
- Console warnings for collision detection edge cases
- No production telemetry required for MVP

## 11. Related C4 Views

- [System Context](../c4/system-context.md)
- [Containers](../c4/containers.md)
- [Components](../c4/components.md)

## 12. Related Implementation Slices

See [how/slices/](../slices/) for all implementation slices derived from this architecture.

**Cross-references to User Stories:**
- [US-001 — Initialize Canvas and Game Loop](../../what/epics/epic-0-mvp/user-stories/us-001-initialize-canvas.md)
- [US-002 — Détection collision AABB et gameplay](../../what/epics/epic-0-mvp/user-stories/us-002-collision.md)
- [US-003 — Gestion des vies et fin de partie](../../what/epics/epic-0-mvp/user-stories/us-003-lives.md)
- [US-004 — Menu et slider vitesse de la balle](../../what/epics/epic-0-mvp/user-stories/us-004-speed.md)

## 13. Technical Constraints

- **Canvas Size** — Game area constrained to viewport dimensions; responsive scaling handled by CSS
- **Frame Rate** — Target 60 FPS; physics frame-independent via deltaTime
- **Collision Precision** — AABB detection limits precision; diagonal collision response not implemented
- **Browser Support** — Requires HTML5 Canvas 2D context; IE11 not supported
- **Performance** — Brick count limited by collision detection (typical max ~50 bricks per frame)

## 14. Open Questions

- Should ball velocity increase across levels or with each brick destroyed?
- Should paddle size change dynamically (wider for difficulty scaling)?
- Should pause/resume be implemented in MVP?
- Should score tracking and leaderboard be added post-MVP?
- What is the exact brick grid layout (5 rows, how many columns)?
- Should paddle speed be controlled via slider or fixed at adjusted speed per frame?
