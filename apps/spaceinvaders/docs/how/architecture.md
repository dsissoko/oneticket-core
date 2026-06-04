# Space Invaders — Technical Architecture

## 1. Architecture Principles

- **60 FPS Performance:** All rendering and state updates optimized for consistent 16ms frame budget on modern browsers
- **Entity-Driven Design:** Game entities (player, enemies, projectiles, shields) are independent objects with clear lifecycle and collision responsibilities
- **Separation of Concerns:** Game loop, rendering, physics/collision, and input handling are decoupled into independent systems
- **Platform Agnostic Input:** Single input layer abstracts keyboard/mouse (desktop) and touch (mobile) to unified control model
- **Stateless Rendering:** Canvas renders frame state without side effects; all state changes handled in update phase
- **Responsive Design:** Game canvas scales to viewport; UI elements adapt to mobile and desktop layouts

## 2. System Overview

Space Invaders is a 2D arcade game implemented as a React component using HTML5 Canvas for rendering. The application follows a classic game loop pattern:

1. **Input Phase:** Poll keyboard/mouse (desktop) or touch events (mobile)
2. **Update Phase:** Apply input to entities; update positions; resolve collisions; manage game state
3. **Render Phase:** Draw all game entities, UI, and effects to canvas at 60 FPS

The system encompasses two major subsystems:
- **Frontend (React + Canvas):** Game UI, input handling, rendering, and game loop orchestration
- **Game Engine:** Physics simulation, collision detection, entity management, and state transitions

## 3. Architectural Style

**Client-side, Canvas-based single-page application** with:
- Monolithic game loop running on main thread
- Immediate-mode rendering (full frame redrawn each cycle)
- Event-driven input handling
- Functional state updates with immutability patterns

**Tech Stack:**
- **Framework:** React 18+ with TypeScript
- **Rendering:** HTML5 Canvas API (2D context)
- **Bundler:** Vite
- **Language:** TypeScript 5.x
- **State Management:** React hooks (useState, useEffect, useRef)
- **Styling:** CSS Modules or Tailwind (for UI overlay)

## 4. Main Technical Boundaries

### 4.1 Game Canvas Boundary
- **Responsibility:** Render game state (enemies, player, projectiles, shields, effects)
- **Canvas Dimensions:** Adaptive to viewport (aspect ratio 4:3 recommended; scales with window resize)
- **Coordinate System:** Top-left origin (0, 0); X increases right, Y increases down
- **Pixel Perfect:** 1 canvas pixel = 1 game unit for precision collision detection

### 4.2 Input Handler Boundary
- **Responsibility:** Translate keyboard/mouse/touch events into unified action model
- **Desktop Input:** Keyboard (Left/Right arrows, Spacebar), mouse optional (future)
- **Mobile Input:** Touch swipe (left/right movement), on-screen fire button
- **Output:** Discrete actions (MOVE_LEFT, MOVE_RIGHT, FIRE) polled once per frame

### 4.3 Game State Boundary
- **Responsibility:** Central state object tracking all entities, round progression, player metrics
- **Immutability:** Each frame produces new state object; no mutate-in-place
- **Scope:** Wave number, lives, score, entity lists (enemies, projectiles, shields, etc.), game phase

### 4.4 Physics & Collision Boundary
- **Responsibility:** Position updates, velocity application, Axis-Aligned Bounding Box (AABB) collision detection
- **Collision Pairs:** Projectile–Enemy, Projectile–Shield, Enemy Fire–Player, Formation–Boundary, Formation–PlayerRow
- **Resolution:** Immediate (collision destroys entities or modifies state in same frame)

### 4.5 Entity System Boundary
- **Responsibility:** Define entity archetypes; manage lifecycle (spawn, update, destroy)
- **Entity Types:**
  - **Player Cannon:** Single instance; position, velocity, invincibility timer, active projectile
  - **Enemy Formation:** Grid of 55 enemies; synchronized movement, firing logic
  - **Projectiles:** Player and enemy projectiles; separate arrays for independent updates
  - **Shields (Bunkers):** 4 instances; segment grid per bunker; destruction tracking
  - **Mystery Ships:** Spawned at random intervals; single entity per appearance
- **Update Contract:** Each entity receives game state, returns updated self with new position/state

## 5. Key Components

### 5.1 Game Loop Component (`SpaceInvaders.tsx` / `useGameLoop`)

**Responsibility:** Orchestrate frame updates, manage React state, apply delta-time updates

**Interface:**
```typescript
interface GameLoopProps {
  width: number;
  height: number;
  onGameStateChange?: (state: GameState) => void;
}

interface GameState {
  wave: number;
  lives: number;
  score: number;
  phase: 'title' | 'playing' | 'gameOver' | 'waveComplete';
  player: Player;
  enemies: Enemy[];
  playerProjectiles: Projectile[];
  enemyProjectiles: Projectile[];
  shields: Shield[];
  mysteryShip: MysteryShip | null;
  elapsedTime: number;
}
```

**Key Methods:**
- `updateFrame()` — Apply delta-time to all entities; resolve collisions; update score
- `handleInput()` — Poll input layer; apply player movement and firing
- `renderFrame()` — Draw canvas from current game state
- `transitionPhase()` — Handle state transitions (gameOver → title, waveComplete → playing, etc.)

**Dependencies:** Input Handler, Physics Engine, Entity System, Renderer

---

### 5.2 Input Handler (`useInputHandler`)

**Responsibility:** Normalize desktop and mobile input into unified action model

**Interface:**
```typescript
interface InputState {
  moveLeft: boolean;
  moveRight: boolean;
  fire: boolean;
}

interface InputHandler {
  getInput(): InputState;
  destroy(): void; // cleanup event listeners
}
```

**Desktop Implementation:**
- KeyboardEvent listeners on `keydown` and `keyup`
- Left Arrow = `moveLeft`; Right Arrow = `moveRight`; Spacebar = `fire`

**Mobile Implementation:**
- TouchEvent listeners on canvas
- Swipe detection (left swipe = `moveLeft`, right swipe = `moveRight`)
- On-screen button tap = `fire`

**Key Logic:**
- State held for duration of key/touch; consumed once per frame

---

### 5.3 Physics & Collision Engine (`usePhysics`)

**Responsibility:** Update entity positions; detect and resolve collisions

**Interface:**
```typescript
interface PhysicsEngine {
  updatePositions(
    state: GameState,
    deltaTime: number
  ): GameState;
  
  resolveCollisions(state: GameState): CollisionResult[];
}

interface Collision {
  type: 'projectile-enemy' | 'projectile-shield' | 'enemy-fire-player' | 'formation-boundary' | 'formation-player-row';
  entities: Entity[];
  resolve(): GameState;
}
```

**Movement Logic:**
- Player: Apply velocity to position; clamp to screen bounds
- Enemies: Formation sweeps horizontally; step down on boundary; remove destroyed enemies
- Projectiles: Apply velocity; remove if out of bounds
- Mystery Ship: Move horizontally; remove if off-screen

**Collision Detection (AABB):**
- Bounding boxes computed for all entities with visual size
- Broadphase: Only test entities that could be adjacent
- Narrowphase: AABB vs AABB intersection
- Resolution: Immediate destruction or degradation

---

### 5.4 Entity System (`entities/`)

**Folder Structure:**
```
entities/
├── Player.ts         # Cannon position, velocity, lives, invincibility
├── Enemy.ts          # Individual enemy; part of formation grid
├── Formation.ts      # Grid manager; synchronized movement; firing
├── Projectile.ts     # Player and enemy projectiles
├── Shield.ts         # Bunker with segment grid
├── MysteryShip.ts    # Bonus entity
└── types.ts          # Shared entity interfaces
```

**Player** (`Player.ts`)
```typescript
interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number;
  invincibilityTimer: number; // 0 = none, >0 = active
  hasActiveProjectile: boolean;
  lives: number;
}
```

**Enemy Formation** (`Formation.ts`)
```typescript
interface Formation {
  enemies: Enemy[][]; // 5 rows × 11 columns
  x: number; // left edge of formation
  y: number; // top edge
  direction: 1 | -1; // 1 = right, -1 = left
  speed: number; // pixels per frame
  fireInterval: number; // milliseconds between fire events
  timeSinceLastFire: number;
  speedMultiplier: number; // scales with wave
  fireRateMultiplier: number;
}
```

**Enemy** (`Enemy.ts`)
```typescript
interface Enemy {
  gridX: number; // column (0–10)
  gridY: number; // row (0–4)
  type: 'top' | 'middle' | 'bottom'; // determines points: 30, 20, 10
  alive: boolean;
  x: number; // world position (computed from grid + formation offset)
  y: number;
  width: number;
  height: number;
}
```

**Projectile** (`Projectile.ts`)
```typescript
interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  owner: 'player' | 'enemy'; // determines collision rules
  active: boolean;
}
```

**Shield** (`Shield.ts`)
```typescript
interface Shield {
  x: number; // left edge of bunker
  y: number;
  segments: SegmentGrid; // 4×4 grid of segments
}

interface Segment {
  gridX: number;
  gridY: number;
  destroyed: boolean;
}
```

**Mystery Ship** (`MysteryShip.ts`)
```typescript
interface MysteryShip {
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  points: 50 | 100 | 150 | 300;
  active: boolean;
}
```

---

### 5.5 Renderer Component (`useRenderer`)

**Responsibility:** Draw game state to canvas; update HUD

**Interface:**
```typescript
interface Renderer {
  render(
    ctx: CanvasRenderingContext2D,
    state: GameState
  ): void;
}
```

**Rendering Layers (back to front):**
1. **Background:** Black canvas clear
2. **Enemies:** Draw formation grid (3 visual types)
3. **Shields:** Draw bunker segments with degradation visual
4. **Player Cannon:** Draw cannon; add blinking if invincible
5. **Projectiles:** Draw player and enemy projectiles
6. **Mystery Ship:** Draw bonus entity if active
7. **HUD Overlay:** Score, lives, wave count (Canvas text or HTML)
8. **Phase Overlays:** Title screen, game over screen, wave complete pause

**Visual Styles:**
- Enemy types: ASCII-art or simple geometric shapes
- Cannon: Triangle or trapezoid
- Projectiles: Small rectangle or line
- Shields: Degradable block grid (opacity fade on damage)
- Colors: Classic arcade palette (green, magenta, white on black)

---

### 5.6 Game States (`types/GamePhase.ts`)

**State Machine:**
```
[TITLE] 
   ↓ (player clicks Start)
[PLAYING] ← (new wave) ← [WAVE_COMPLETE]
   ↓ (loss condition)
[GAME_OVER]
   ↓ (player clicks Restart)
[TITLE]
```

**Title Phase:**
- Display "Space Invaders" logo
- Show "Start" button
- Input: Click/Tap Start → Initialize wave 1, transition to PLAYING

**Playing Phase:**
- Active game loop: update, collide, render
- Input: Arrow keys / swipe (move), Spacebar / button (fire)
- Output: Victory (all enemies destroyed) → WAVE_COMPLETE; Loss (lives = 0 or formation reached) → GAME_OVER

**Wave Complete Phase:**
- 1–2 second pause (visual feedback)
- Increment wave counter
- Increase formation speed by 15%
- Decrease fire interval
- Reset lives to 3
- Respawn enemies
- Transition to PLAYING

**Game Over Phase:**
- Display final score
- Show "Restart" button
- Input: Click/Tap Restart → Reset all state, transition to TITLE

---

## 6. Key Interfaces

### 6.1 Collision Response Interface
```typescript
interface CollisionEvent {
  projectile: Projectile;
  target: Enemy | ShieldSegment | MysteryShip | Player;
  resolve: (state: GameState) => GameState;
}
```

### 6.2 Wave Configuration Interface
```typescript
interface WaveConfig {
  waveNumber: number;
  speedMultiplier: number; // 1.0 + (0.15 × (waveNumber - 1))
  fireRateMultiplier: number; // 1.0 / (1.0 + 0.1 × waveNumber)
  lives: number; // always 3
}
```

### 6.3 Score Calculation Interface
```typescript
interface ScoreEvent {
  type: 'enemy-destroyed' | 'mystery-ship-destroyed';
  points: number;
  timestamp: number;
}
```

---

## 7. Data Architecture

### 7.1 Game State Object

```typescript
interface GameState {
  // Round Progression
  wave: number;
  lives: number;
  score: number;
  
  // Entities
  player: Player;
  formation: Formation;
  shields: Shield[];
  playerProjectiles: Projectile[];
  enemyProjectiles: Projectile[];
  mysteryShip: MysteryShip | null;
  
  // Timers
  elapsedTime: number; // seconds since wave start
  frameCount: number;
  waveStartTime: number;
  
  // Phase
  phase: GamePhase;
  gameOverReason?: 'lives-exhausted' | 'formation-reached';
}
```

### 7.2 Persistent Data (Local Storage, Optional)

```typescript
interface GameSave {
  highScore: number;
  highScoreWave: number;
  lastSessionScore: number;
  playCount: number;
}
```

---

## 8. Security Architecture

**Threat Model:**
- **Client-Side Only:** No backend services; no authentication required
- **Data Exposure:** High score stored in browser local storage; user can inspect/modify (acceptable for arcade game)
- **Input Validation:** Input normalized and bounds-checked; malformed input ignored
- **DoS Resistance:** Game loop rate-limited to 60 FPS; input polling limited to frame rate

**Mitigations:**
- No XSS risk (no external data rendered as HTML)
- No CSRF risk (no backend APIs)
- High score tampering is acceptable and expected (arcade tradition)

---

## 9. Deployment Strategy

**Target Platforms:**
- **Desktop:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile:** iOS Safari, Chrome, Android (latest 2 versions)

**Build & Deploy:**
1. **Local Development:** `npm run dev` → Vite dev server on `localhost:5173`
2. **Production Build:** `npm run build` → Static HTML+CSS+JS in `dist/`
3. **Hosting:** Static hosting (Netlify, Vercel, GitHub Pages, or CDN)
4. **Performance:** Minified JS <100 KB; initial load <1 second on 4G

**Browser Compatibility:**
- HTML5 Canvas support (>99% modern browsers)
- requestAnimationFrame for frame sync
- localStorage for optional high score persistence
- Touch API for mobile input

---

## 10. Observability Strategy

**Performance Metrics:**
- **Frame Rate:** Target 60 FPS; monitor via `performance.now()` delta tracking
- **Memory:** Entity count, projectile pool size (watch for leaks)
- **Input Latency:** Measure time from key press to player movement (target <50 ms)

**Debugging:**
- Canvas overlay: Display FPS counter, entity count, collision boxes (dev mode)
- Console logging: State transitions, collision events, scoring (dev mode)
- Error Boundary: Catch rendering crashes; display fallback message

**No external analytics:** This is an arcade game; no user tracking required.

---

## 11. Related C4 Views

- [System Context](../c4/system-context.md)
- [Containers](../c4/containers.md)
- [Components](../c4/components.md)
- [Deployment](../c4/deployment.md)

---

## 12. Related Implementation Slices

- [Slice 1 — Foundation Game Loop](slice-1-foundation-game-loop/slice.md)
- [Slice 2 — Player Input & Cannon](slice-2-player-input-cannon/slice.md)
- [Slice 3 — Enemy Formation Grid with Movement and Rendering](slice-3-enemy-formation/slice.md)
- [Slice 4 — Collision Detection and Scoring System](slice-4-collision-scoring/slice.md)
- [Slice 5 — Shields Degradation](slice-5-shields-degradation/slice.md)
- [Slice 6 — Enemy AI Fire](slice-6-enemy-ai-fire/slice.md)
- [Slice 7 — Mystery Ships Bonuses](slice-7-mystery-ships-bonuses/slice.md)
- [Slice 8 — Game States and Wave Progression](slice-8-game-states-progression/slice.md)

---

## 13. Technical Constraints

### 13.1 Performance Constraints
- **Frame Budget:** 16 ms @ 60 FPS; collision detection must complete within budget
- **Entity Count:** Max ~150 entities (55 enemies + 3 projectiles + shields + mystery ship); no pooling required
- **Canvas Size:** Adaptive to viewport; recommend max 1280×960 for mobile

### 13.2 Platform Constraints
- **Touch Events:** 60–100 ms latency on mobile; swipe detection must tolerate this
- **Keyboard Polling:** Arrow keys must not repeat-fire; poll once per frame
- **Local Storage:** 5 MB limit per domain (high score data <1 KB)

### 13.3 Browser Constraints
- **Canvas Pixel Ratio:** High-DPI screens (2x, 3x); scale canvas context for sharpness
- **No WebGL:** Use 2D Canvas API only (simpler, more compatible)
- **No Web Workers:** Game loop runs on main thread (acceptable for this workload)

---

## 14. Open Questions

1. **Pause Feature:** Should the game pause on Escape key or pause button? (Currently: No pause)
2. **High Score Persistence:** Persist to localStorage or session-only? (Decision: localStorage, optional)
3. **Visual Polish:** Particle effects on enemy destruction? Screen shake on hits? (Decision: MVP minimal; no effects)
4. **Difficulty Settings:** Fixed progression or selectable difficulty? (Decision: Fixed progression only)
5. **Sound/Music:** Out of scope for MVP (visual feedback only)
6. **Mobile Responsiveness:** Full-screen mode option? (Decision: Responsive canvas, no fullscreen API required)
