# Slice 1 — Foundation Game Loop

## Goal

Establish the core game loop infrastructure that renders at 60 FPS with frame-independent timing, input polling, and state updates. This is the foundational architecture upon which all gameplay mechanics depend. No gameplay entities are introduced in this slice — only the engine framework.

## Related Epics

[Epic 0 — MVP Complete Playable Space Invaders Game](epic-0-mvp/epic.md)

## Related User Stories

[US-001 — Game Start](epic-0-mvp/user-stories/us-001-game-start.md)

## Impacted Components

- **Game Loop Component** (`SpaceInvaders.tsx` / `useGameLoop`) — orchestrates frame updates, manages React state, applies delta-time updates
- **Input Handler** (`useInputHandler`) — normalizes keyboard/mouse input into unified action model
- **Renderer** (`useRenderer`) — draws game state to canvas (HUD and empty background initially)
- **Canvas Setup** — HTML5 Canvas with proper dimensions and context configuration
- **Game State Structure** — core GameState interface with entity containers and phase tracking

## Interfaces

### GameState

```typescript
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

### InputState

```typescript
interface InputState {
  moveLeft: boolean;
  moveRight: boolean;
  fire: boolean;
}
```

## Data Changes

- **Canvas Element:** Create HTML5 Canvas with adaptive dimensions (4:3 aspect ratio recommended)
- **Game State Tree:** Initialize empty entity arrays (enemies, projectiles, shields, etc.)
- **Frame Timing:** Track delta time between frames for frame-independent updates
- **Input Registry:** Set up keyboard event listeners for desktop and touch listeners for mobile

## Sequence Flow

1. **Initialization Phase**
   - Create Canvas element with proper 2D context
   - Set canvas logical dimensions (not CSS size)
   - Initialize empty GameState with title phase

2. **Frame Loop (requestAnimationFrame)**
   - Calculate delta time since last frame
   - Call `handleInput()` — poll keyboard/touch and update movement flags
   - Call `updateFrame(deltaTime)` — apply delta time to all entities (empty initially)
   - Call `renderFrame()` — clear canvas and draw current game state

3. **Input Polling**
   - Keyboard (desktop): Capture keydown/keyup for Left Arrow, Right Arrow, Spacebar
   - Touch (mobile): Detect swipe gestures and on-screen button taps
   - Output: Unified InputState object consumed once per frame

4. **State Update**
   - Apply input to player movement (not active in this slice, prepared for future)
   - Update entity positions using delta time (empty initially)
   - Resolve collisions (empty initially)
   - Check phase transitions (title → playing on Start button click)

5. **Rendering**
   - Clear canvas (black background)
   - Draw HUD (score, lives, wave count — all zeroed initially)
   - Draw empty game world ready for entities
   - Display title screen or game-over screen based on phase

6. **Phase Transitions**
   - Title → Playing: On Start button click, initialize wave 1 and begin game loop
   - Playing → GameOver: When loss condition triggered (prepared for future)

## Observability Impact

### Metrics Tracked

- **Frame Rate:** Measure delta time between frames; target 60 FPS (16 ms per frame)
- **Input Latency:** Time from key press to movement update (target <50 ms)
- **Canvas Rendering:** Ensure no layout thrashing or synchronous long tasks

### Debug Outputs (Dev Mode)

- FPS counter displayed on canvas
- Entity count (initially 0)
- Frame delta time log (ensure consistent 16 ms intervals)
- Input event log (track which keys pressed each frame)

### Performance Expectations

- **Initial Load:** Canvas setup and empty state initialization <100 ms
- **Frame Budget:** Each frame must complete within 16 ms at 60 FPS
- **Memory Baseline:** ~1 MB for React + Canvas + game loop overhead
