# Slice 1 — Foundation: Game Loop, Canvas Setup, UI Framework

## Goal

Establish the foundational infrastructure for the Space Invaders game: canvas initialization, React setup, game loop with delta-time, HUD component rendering, and state machine scaffolding. This slice provides the technical backbone that all other gameplay slices depend on.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-001 — Game Setup](us-001-game-setup.md)
[US-007 — Game States & Wave Progression](us-007-game-states-wave-progression.md)

## Related Slices

- [Slice 2 — Enemy Formation & Rendering](slice-2-enemies/slice.md)
- [Slice 3 — Player Control & Firing](slice-3-player/slice.md)
- [Slice 4 — Destructible Shields](slice-4-shields/slice.md)
- [Slice 5 — Collision Detection & Resolution](slice-5-collision/slice.md)
- [Slice 6 — Enemy Fire System](slice-6-enemy-fire/slice.md)
- [Slice 7 — Mystery Ship & Bonus Encounters](slice-7-bonus/slice.md)
- [Slice 8 — Wave Progression & Difficulty Scaling](slice-8-waves/slice.md)

## Impacted Components

### Core Components
- **GameLoopManager**: Orchestrates the game loop using requestAnimationFrame with delta-time calculations
- **RenderingSystem**: Clears canvas and manages rendering pipeline
- **InputSystem**: Scaffolding for keyboard and touch input capture
- **StateMachine**: Manages game states (Start, Playing, Victory, GameOver) and transitions
- **Game UI Component (React)**: Start screen, HUD display (score, lives, wave)

### Data Structures
- **GameLoopState** (useRef): Holds game entities and state references without triggering React re-renders
- **GameContextState** (React State): Tracks score, lives, wave, gameState for UI updates
- **PlayerInputState**: Flags for left, right, fire actions

## Interfaces

### GameLoopManager
```typescript
class GameLoopManager {
  start(): void
  stop(): void
  update(deltaTime: number): void
  render(): void
}
```

### InputSystem (Scaffolding)
```typescript
class InputSystem {
  onKeyDown(event: KeyboardEvent): void
  onKeyUp(event: KeyboardEvent): void
  onTouchStart(event: TouchEvent): void
  onTouchEnd(event: TouchEvent): void
  getInputState(): PlayerInputState
}
```

### StateMachine
```typescript
type GameState = 'Start' | 'Playing' | 'Victory' | 'GameOver'

class StateMachine {
  currentState: GameState
  transitionTo(newState: GameState): void
  handleStateExit(): void
  handleStateEnter(): void
}
```

### RenderingSystem
```typescript
class RenderingSystem {
  clear(): void
  drawFormation(formation: Formation): void
  drawPlayer(player: Player): void
  drawBullets(bullets: Bullet[]): void
  drawShields(shields: Shield[]): void
}
```

## Data Changes

### React State (UI)
```typescript
interface GameContextState {
  gameState: GameState  // 'Start' | 'Playing' | 'Victory' | 'GameOver'
  score: number         // Initialized to 0
  lives: number         // Initialized to 3
  waveNumber: number    // Initialized to 1
  onScoreChange: (newScore: number) => void
  onLivesChange: (newLives: number) => void
  onGameStateChange: (newState: GameState) => void
}
```

### Game Loop References (useRef)
```typescript
interface GameLoopState {
  formation: Formation | null
  player: Player | null
  bullets: Bullet[]
  shields: Shield[]
  mysteryShip: MysteryShip | null
  inputState: PlayerInputState
  score: number
  lives: number
  waveNumber: number
  gameState: GameState
  deltaTime: number
  lastFrameTime: number
}
```

## Sequence Flow

### Initialization (on component mount)
1. Canvas element is created and appended to DOM
2. React state initialized: gameState = 'Start', score = 0, lives = 3, wave = 1
3. GameLoopManager created with reference to canvas
4. RenderingSystem initialized with canvas 2D context
5. InputSystem attached to window (keyboard and touch listeners)
6. StateMachine initialized to 'Start' state
7. requestAnimationFrame loop starts

### Start Screen Display
1. gameState = 'Start'
2. React renders start screen with "Space Invaders" title and "Start Game" button
3. HUD displays: Score: 0, Lives: 3
4. Game loop runs but does not update entities (paused state)
5. Input system listens for button click or spacebar

### Transition: Start → Playing
1. Player clicks "Start Game" button
2. onStartGame() called, updates React state: gameState = 'Playing'
3. StateMachine transitions to 'Playing'
4. Formation initialized at top-center (x: canvas.width / 2, y: 50)
5. Player initialized at bottom-center (x: canvas.width / 2, y: canvas.height - 50)
6. Game loop resumes full entity updates
7. Canvas renders formation and player at 60 FPS target

### Game Loop Frame (Playing State)
```
requestAnimationFrame
  ├─ Calculate deltaTime (current time - lastFrameTime)
  ├─ Update
  │   ├─ Input system reads keyboard/touch state
  │   ├─ Player updates position based on input
  │   ├─ Formation updates position (stub for later)
  │   └─ Score/lives synced to React state (debounced)
  ├─ Render
  │   ├─ RenderingSystem.clear()
  │   ├─ Draw formation
  │   ├─ Draw player
  │   ├─ Draw HUD text (score, lives, wave)
  │   └─ Canvas displays frame
  └─ State evaluation (stub for collision/victory logic)
```

### State Machine Transitions (Scaffolding)
```
Start
  ↓ (on start button click)
Playing
  ↓ (on all enemies destroyed — not implemented in this slice)
Victory
  ↓ (on transition timer — not implemented in this slice)
Playing (wave 2)
  ↓ (on lives = 0 or formation reaches player — not implemented)
GameOver
  ↓ (on restart button click)
Start
```

## Deliverables

### Code Files
1. **src/components/Game.tsx** (or similar)
   - Main React component
   - useState for gameState, score, lives, wave
   - useRef for gameLoopState
   - useEffect to manage game loop lifecycle

2. **src/game/GameLoopManager.ts**
   - Orchestrates requestAnimationFrame
   - Calls update() and render() each frame
   - Calculates delta-time (ms since last frame)

3. **src/game/RenderingSystem.ts**
   - clear(): empties canvas
   - drawFormation(), drawPlayer(), drawBullets(), drawShields() (stubs)
   - Text rendering for HUD (score, lives, wave)

4. **src/game/InputSystem.ts**
   - onKeyDown/onKeyUp handlers
   - onTouchStart/onTouchEnd handlers (scaffolding)
   - getInputState() returns { left, right, fire }

5. **src/game/StateMachine.ts**
   - Enum/type for GameState
   - transitionTo() method
   - currentState property

6. **src/game/Entity.ts** (minimal)
   - Formation class (stub: x, y, enemies array)
   - Player class (x, y, width, height, update method)
   - Bullet class (x, y, velocity)
   - Shield class (stub)

7. **src/components/HUD.tsx**
   - Displays score, lives, wave during Playing state
   - Positioned as overlay on canvas

8. **src/components/StartScreen.tsx**
   - Title "Space Invaders"
   - "Start Game" button
   - Calls onStartGame() on click

9. **src/components/GameOverScreen.tsx** (scaffolding)
   - Displays final score
   - "Restart" button

### Canvas Setup
- Canvas element: 800×600 pixels (responsive via CSS)
- 2D rendering context (ctx)
- Embedded in React component

### Game Loop Behavior
- Targets 60 FPS (requestAnimationFrame native frequency)
- Delta-time calculated each frame (in milliseconds)
- All movements frame-independent (multiplied by deltaTime)

## Success Criteria

✅ **Canvas renders** — canvas element initializes and is visible on page  
✅ **Game loop runs** — requestAnimationFrame fires at ~60 FPS (verify with dev tools)  
✅ **Start button transitions to playing** — clicking "Start Game" updates gameState and starts entity rendering  
✅ **HUD displays correctly** — Score: 0, Lives: 3, Wave: 1 visible during playing  
✅ **State transitions work** — Start → Playing transition verified; Player and formation render at correct initial positions  
✅ **Input system responsive** — Keyboard input (arrow keys, spacebar) updates playerInputState without errors  
✅ **No visual glitches** — Canvas renders smoothly, no flickering or rendering artifacts  
✅ **Performance baseline** — Maintains 60 FPS with empty scene (no enemies firing)

## Observability Impact

### Console Logging (Development)
- State transitions: `console.log('State: Start → Playing')`
- Frame time: `console.log(`FPS: ${(1000 / deltaTime).toFixed(1)}`)`
- Entity counts: `console.log(`Entities: ${formation.enemies.length} enemies, ${bullets.length} bullets`)`

### React DevTools
- Watch gameState, score, lives, wave in React tree
- Verify no excessive re-renders (should only update on state changes)

### Canvas Debug Overlay (Optional)
- FPS counter in top-left corner (development mode only)
- Entity position debug drawing (optional)

## Testing Strategy

### Unit Tests
- StateMachine.transitionTo() validates state transitions
- InputSystem.getInputState() returns correct flags
- RenderingSystem.clear() clears canvas without errors

### Integration Tests
- Start screen renders with button
- Clicking button triggers transition to Playing
- Canvas renders at 60 FPS (measure delta-time)
- HUD values reflect React state

### Manual Testing
- Load game in browser, verify start screen
- Click start button, verify transition and entity rendering
- Press arrow keys, verify no console errors
- Check performance: DevTools → Performance tab, FPS locked at 60
