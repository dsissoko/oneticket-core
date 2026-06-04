# Space Invaders MVP — Architecture

## 1. Architecture Principles

- **Performance First**: Target 60 FPS on desktop and mobile using efficient Canvas rendering and delta-time driven updates
- **Separation of Concerns**: Distinct systems for rendering, input, physics, and state management
- **Responsive Design**: Single codebase supports desktop (keyboard) and mobile (touch) without branching logic
- **Entity-Component Pattern**: Game entities (Formation, Player, Enemies, Bullets, Shields) have clear lifecycle and state
- **Game Loop Driven**: requestAnimationFrame provides the heartbeat; all updates are time-sliced using delta-time
- **Pooling for Performance**: Bullet objects are reused to minimize garbage collection during heavy fire phases
- **React Integration**: UI state (HUD, scores, lives, game state) lives in React; game loop state lives in refs for efficiency

## 2. System Overview

Space Invaders is a 2D arcade game implemented as a React component with an embedded Canvas-based game loop. The system has two execution contexts:

1. **React Context**: Manages UI state (score, lives, wave, game state) and re-renders HUD
2. **Game Loop Context**: requestAnimationFrame driver running ~60 FPS, handling entity updates, collision detection, and rendering

The two contexts communicate via React state and useRef hooks that are read/written by the game loop without triggering re-renders (except when state truly changes, e.g., score or lives update).

## 3. Architectural Style

**Event-Driven Hybrid Architecture**: 
- React component acts as the outer shell and state container
- Canvas rendering loop is the inner engine, running independently
- Input events (keyboard, touch) update internal state variables
- Game loop periodically flushes state changes back to React for UI updates (debounced to avoid excessive re-renders)

## 4. Main Technical Boundaries

| Boundary | Responsibility | Technology |
|----------|---|---|
| **Input Layer** | Capture keyboard and touch events, update movement/fire flags | addEventListener (keyboard), Touch events (mobile) |
| **Game Loop** | Delta-time calculations, entity updates, collision checks, score processing | requestAnimationFrame + Canvas 2D context |
| **Rendering System** | Draw entities (formation, player, bullets, shields, mystery ship) to Canvas | Canvas 2D fillRect, drawImage, etc. |
| **Physics & Collision** | AABB collision detection, response (entity removal, shield damage) | AABB algorithm, bitmask collision groups |
| **Entity Manager** | Lifecycle for Formation, Player, Enemies, Bullets, Shields, MysteryShip | JavaScript classes with state |
| **State Machine** | Manage game states (Start, Playing, Victory, GameOver) and transitions | Enum + switch/case |
| **UI/HUD Layer** | Display score, lives, wave, buttons; handle state transitions | React components + CSS |

## 5. Key Components

### 5.1 Game Loop Manager
**Purpose**: Drive the game at 60 FPS using requestAnimationFrame  
**Responsibilities**:
- Calculate delta-time between frames
- Call update() on all systems
- Call render() for Canvas drawing
- Detect state transitions and notify React

**Interface**:
```typescript
class GameLoopManager {
  start(): void
  stop(): void
  update(deltaTime: number): void
  render(): void
}
```

### 5.2 Rendering System
**Purpose**: Draw all game entities to the Canvas  
**Responsibilities**:
- Clear canvas each frame
- Draw formation (11×5 grid of enemies)
- Draw player cannon at bottom-center
- Draw player bullets (moving upward)
- Draw enemy bullets (moving downward)
- Draw shields with segment visibility
- Draw mystery ship if active

**Interface**:
```typescript
class RenderingSystem {
  clear(): void
  drawFormation(formation: Formation): void
  drawPlayer(player: Player): void
  drawBullets(bullets: Bullet[]): void
  drawShields(shields: Shield[]): void
  drawMysteryShip(ship: MysteryShip | null): void
}
```

### 5.3 Input System
**Purpose**: Capture player input and update control state  
**Responsibilities**:
- Listen for arrow key / left / right events
- Listen for spacebar / fire button events
- Detect touch/swipe on mobile
- Update `playerInputState` object (left, right, fire)
- Prevent default browser actions (e.g., spacebar scroll)

**Interface**:
```typescript
class InputSystem {
  onKeyDown(event: KeyboardEvent): void
  onKeyUp(event: KeyboardEvent): void
  onTouchStart(event: TouchEvent): void
  onTouchEnd(event: TouchEvent): void
  getInputState(): PlayerInputState
}
```

### 5.4 Physics & Collision System
**Purpose**: Detect and respond to collisions between all entity pairs  
**Responsibilities**:
- AABB collision detection for all pairs:
  - Player bullets ↔ Enemies
  - Player bullets ↔ Shield segments
  - Enemy bullets ↔ Player
  - Enemy bullets ↔ Shield segments
  - Formation ↔ Shields
  - Formation ↔ Player
- Collision response:
  - Remove destroyed entities
  - Award points for kills
  - Trigger state changes (GameOver, Victory)
  - Handle invincibility frames for player

**Interface**:
```typescript
class PhysicsSystem {
  checkCollisions(
    formation: Formation,
    player: Player,
    bullets: Bullet[],
    shields: Shield[]
  ): CollisionResults
  checkAABB(a: BoundingBox, b: BoundingBox): boolean
}
```

### 5.5 Entity Manager
**Purpose**: Manage lifecycle and state of all game entities  
**Responsibilities**:
- **Formation**: 11×5 grid of enemies, lateral movement, edge bouncing, vertical dropping
- **Player**: Position, movement constraints, single bullet in flight
- **PlayerBullet**: Position, velocity, lifetime, collision detection
- **EnemyBullet**: Position, velocity, pooled (reused), max 3 on screen
- **Shield**: 4 bunkers, 4×4 segments per shield, segment state tracking, health
- **MysteryShip**: Bonus target, periodic appearance, horizontal traversal

**Interface**:
```typescript
class Formation {
  update(deltaTime: number, waveNumber: number): void
  render(ctx: CanvasRenderingContext2D): void
  getBoundingBox(): BoundingBox
  getEnemies(): Enemy[]
}

class Player {
  update(deltaTime: number, inputState: PlayerInputState): void
  fire(): PlayerBullet | null
  move(direction: -1 | 0 | 1, deltaTime: number): void
}

class Shield {
  segments: Segment[]
  damageSegment(index: number): void
  isDestroyed(): boolean
  reset(): void
}
```

### 5.6 State Machine
**Purpose**: Manage game flow and state transitions  
**Responsibilities**:
- States: `Start`, `Playing`, `Victory`, `GameOver`
- Transitions:
  - Start → Playing (player clicks start button)
  - Playing → Victory (all enemies destroyed)
  - Victory → Playing (after delay, new wave)
  - Playing → GameOver (lives = 0 or formation reaches player)
  - GameOver → Start (display start screen, await restart)
- Track wave number, lives, score across state boundaries

**Interface**:
```typescript
type GameState = 'Start' | 'Playing' | 'Victory' | 'GameOver'

class StateMachine {
  currentState: GameState
  transitionTo(newState: GameState): void
  handleStateExit(): void
  handleStateEnter(): void
}
```

### 5.7 UI/HUD Layer (React)
**Purpose**: Display game status and handle state changes  
**Responsibilities**:
- Render start screen with title and start button
- Display HUD during playing: Score, Lives, Wave number
- Show victory screen with wave and score
- Show game over screen with final score and restart button
- Manage React state updates from game loop

**Interface**:
```typescript
interface GameUIProps {
  gameState: GameState
  score: number
  lives: number
  waveNumber: number
  onStartGame: () => void
}
```

## 6. Key Interfaces

### Game State Flow
```
Input Events (keyboard/touch)
    ↓
Input System (update playerInputState)
    ↓
Game Loop (requestAnimationFrame)
    ├─ Entity Manager: update(deltaTime)
    ├─ Physics System: checkCollisions()
    ├─ Rendering System: render()
    └─ State Machine: evaluate transitions
    ↓
React State Updates (when score/lives/state changes)
    ↓
HUD Re-render
```

### Entity Update Sequence (each frame)
1. Input system reads keyboard/touch and updates control state
2. Player updates position and fires if conditions met
3. Formation updates position, checks edge bounces, applies wave/enemy-count scaling
4. Enemy bullets update position; oldest removed if > 3
5. Mystery ship updates position if active
6. All collision checks run
7. Score and lives update React state if changed
8. Canvas renders all entities
9. State machine evaluates: continue Playing, transition to Victory, or GameOver

## 7. Data Architecture

### Core Entity State
```typescript
interface Enemy {
  x: number
  y: number
  width: number
  height: number
  alive: boolean
}

interface Player {
  x: number
  y: number
  width: number
  height: number
  invincible: boolean
  invincibilityTimer: number
  bulletInFlight: PlayerBullet | null
}

interface Bullet {
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  type: 'player' | 'enemy'
}

interface Shield {
  x: number
  y: number
  segments: Segment[]
}

interface Segment {
  x: number
  y: number
  alive: boolean
}

interface Formation {
  enemies: Enemy[]
  x: number
  y: number
  directionX: -1 | 1
  speed: number
  spawnTime: number
}
```

### Game Context State (React)
```typescript
interface GameContextState {
  gameState: GameState
  score: number
  lives: number
  waveNumber: number
  onScoreChange: (newScore: number) => void
  onLivesChange: (newLives: number) => void
  onGameStateChange: (newState: GameState) => void
}
```

### Game Loop References (useRef, not triggering re-renders)
```typescript
const gameLoopRef = useRef<GameLoopState>({
  formation: null,
  player: null,
  bullets: [],
  shields: [],
  mysteryShip: null,
  inputState: { left: false, right: false, fire: false },
  score: 0,
  lives: 3,
  waveNumber: 1,
  gameState: 'Start'
})
```

## 8. Security Architecture

- **Input Validation**: All keyboard/touch input is validated before state update (no arbitrary code execution)
- **Bounds Checking**: Player position always constrained to screen; formation position validated
- **No External APIs**: Game runs entirely client-side; no network calls (extensible for leaderboards later)
- **No User Data**: No personal information collected; game state is local only

## 9. Deployment Strategy

### Build & Packaging
- React + TypeScript + Vite for fast bundling
- Single `index.tsx` entry point serving `/apps/spaceinvaders/`
- Canvas element embedded in React component tree
- No external assets required (geometry drawn via Canvas 2D primitives)

### Performance Targets
- **Load Time**: < 2 seconds
- **Frame Rate**: Maintain 60 FPS during peak activity (55+ enemies, 3+ bullets on screen)
- **Mobile**: Responsive on iPhone 12+ and Android devices with touch support

### Browser Support
- Chrome, Firefox, Safari (desktop)
- Safari (iOS), Chrome (Android)
- ES2020+ (modern JavaScript)

## 10. Observability Strategy

### Metrics (optional, not MVP)
- Frame time and FPS counter (development mode)
- Collision detection count per frame (development mode)
- Entity count (enemies, bullets, shields) (development mode)

### Logging (development only)
- State transitions (Start → Playing → Victory → Playing)
- Collisions detected and responses applied
- Enemy count and formation speed changes per wave

### Error Handling
- Canvas context initialization failure → fallback message
- Missing DOM elements → console warning
- Invalid game state → reset to Start

## 11. Related C4 Views

- [System Context](../c4/system-context.md)
- [Containers](../c4/containers.md)
- [Components](../c4/components.md)
- [Deployment](../c4/deployment.md)

## 12. Related Implementation Slices

See [how/slices/](../slices/) for all implementation slices derived from this architecture.

Current slices covering user stories:
- Slice 1: Game Loop & Rendering Foundation (US-001, US-002)
- Slice 2: Player Control & Input System (US-003)
- Slice 3: Destructible Shields System (US-004)
- Slice 4: Enemy Fire & Bullet Pooling (US-005)
- Slice 5: Collision Detection & Scoring (US-006)
- Slice 6: Game State Machine & Wave Progression (US-007)

## 13. Technical Constraints

- **Single Canvas**: All game rendering to single 2D Canvas (no WebGL complexity)
- **No Frameworks for Game Loop**: Custom requestAnimationFrame loop (not Babylon.js, Three.js)
- **Memory Pooling**: Bullet objects pre-allocated and reused to reduce GC pauses
- **Delta-Time Only**: Frame-independent movement; no fixed timestep physics engine required
- **Touch Events**: Swipe detection via TouchEvent API (no external gesture libraries)
- **AABB Only**: Simple rectangle collision detection; no polygon or circle collisions needed

## 14. Open Questions

1. **Mystery Ship Timing**: Should mystery ship appear at fixed intervals (e.g., every 20 seconds) or random intervals within a range?
2. **Difficulty Scaling**: Should enemy bullet speed increase with waves, or only fire rate?
3. **Shield Positioning**: Should all 4 shields be static, or should they move with the player?
4. **Invincibility Flash**: Should the player sprite flash visually during the 2-second invincibility period?
5. **Formation Size Scaling**: Should enemy count increase or stay fixed at 55 across all waves?
6. **Audio**: Is sound expected in a future phase, or permanently out of scope?
