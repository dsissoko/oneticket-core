# Slice 2 — Enemy Formation & Rendering

## Goal

Implement a fully functional 11×5 enemy formation with realistic lateral movement, edge detection, bouncing behavior, dynamic speed scaling, and sprite-based rendering for three enemy types. This slice delivers the core enemy system required for classic Space Invaders gameplay.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-002 — Enemy Formation Movement](us-002-enemy-formation-movement.md)
[US-007 — Game States & Wave Progression](us-007-game-states-wave-progression.md)

## Related Slices

- [Slice 1 — Foundation](slice-1-foundation/slice.md)
- [Slice 5 — Collision Detection & Resolution](slice-5-collision/slice.md)
- [Slice 8 — Wave Progression & Difficulty Scaling](slice-8-waves/slice.md)

## Impacted Components

### Core Components

- **Enemy Entity Class**: Represents a single enemy with position, type, points value, and alive flag
- **Formation Manager**: Creates and manages 11×5 grid, handles lateral movement, edge detection, direction reversal, and vertical dropping
- **Enemy Rendering System**: Draws three enemy types (small, medium, large) with appropriate sprites and positioning
- **Speed Scaling Engine**: Calculates dynamic movement speed based on wave number and remaining enemy count
- **Game Loop Integration**: Formation.update() called each frame with delta-time and wave number for frame-independent movement

### Data Structures

- **Enemy**: x, y, type ('small'|'medium'|'large'), points, alive, width, height
- **Formation**: enemies[], x, y, directionX (-1|1), speed, speedMultiplier, lastMoveTime
- **EnemyType Lookup**: Map of enemy type → (width, height, points, renderFunction)

## Interfaces

### Enemy Class
```typescript
class Enemy {
  x: number
  y: number
  type: 'small' | 'medium' | 'large'
  points: number
  alive: boolean
  width: number
  height: number

  constructor(x: number, y: number, type: 'small' | 'medium' | 'large')
  getPoints(): number
  setBoundingBox(width: number, height: number): void
}
```

### Formation Class
```typescript
class Formation {
  enemies: Enemy[]
  x: number
  y: number
  directionX: -1 | 1
  speed: number
  spawnTime: number
  canvasWidth: number
  canvasHeight: number

  constructor(canvasWidth: number, canvasHeight: number)
  initialize(waveNumber: number): void
  update(deltaTime: number, waveNumber: number): void
  render(ctx: CanvasRenderingContext2D): void
  getBoundingBox(): { x: number; y: number; width: number; height: number }
  getAliveEnemies(): Enemy[]
  countAliveEnemies(): number
  drop(): void
  hasReachedBottom(): boolean
  resetForWave(waveNumber: number): void
}
```

### RenderingSystem Extensions
```typescript
class RenderingSystem {
  drawFormation(formation: Formation): void
  drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void
  drawEnemySprite(ctx: CanvasRenderingContext2D, enemy: Enemy, x: number, y: number): void
}
```

## Data Changes

### Enemy Type Configuration
```typescript
interface EnemyTypeConfig {
  width: number
  height: number
  points: number
  sprite: (ctx: CanvasRenderingContext2D, x: number, y: number) => void
}

const ENEMY_TYPES: Record<'small' | 'medium' | 'large', EnemyTypeConfig> = {
  small: { width: 24, height: 24, points: 40, sprite: drawSmallEnemy },
  medium: { width: 32, height: 32, points: 20, sprite: drawMediumEnemy },
  large: { width: 40, height: 40, points: 10, sprite: drawLargeEnemy }
}
```

### Formation Grid Layout
```typescript
// 11×5 grid: 5 rows, 11 enemies per row
// Rows 0-1: small enemies (5 points per row = 10 total small)
// Rows 2-3: medium enemies (5 points per row = 10 total medium)  
// Row 4: large enemies (1 row = 5 large)
// Total: 55 enemies

const GRID_LAYOUT = [
  // Row 0: small (points: 40)
  ...Array(11).fill('small'),
  // Row 1: small (points: 40)
  ...Array(11).fill('small'),
  // Row 2: medium (points: 20)
  ...Array(11).fill('medium'),
  // Row 3: medium (points: 20)
  ...Array(11).fill('medium'),
  // Row 4: large (points: 10)
  ...Array(11).fill('large')
]
```

### Speed Scaling Formula
```typescript
// Base speed: wave 1 = 100 pixels/sec
// Wave scaling: speed *= 1.1 per wave (10% increase per wave)
// Enemy count scaling: speed *= (aliveCount / 55)^0.8

function calculateFormationSpeed(waveNumber: number, aliveEnemyCount: number): number {
  const baseSpeed = 100 // pixels per second
  const waveMultiplier = Math.pow(1.1, waveNumber - 1)
  const countMultiplier = Math.pow(aliveEnemyCount / 55, 0.8)
  return baseSpeed * waveMultiplier * countMultiplier
}
```

### Formation Position Tracking
```typescript
interface FormationState {
  x: number  // formation origin (top-left)
  y: number  // formation origin (top-left)
  directionX: -1 | 1  // lateral movement direction
  speed: number  // pixels per second
  gridX: number[]  // x-position of each enemy relative to formation origin
  gridY: number[]  // y-position of each enemy relative to formation origin
  lastUpdateTime: number
}
```

## Sequence Flow

### Formation Initialization (Start of Wave)
1. Formation created with canvasWidth and canvasHeight
2. 55 enemies instantiated in 11×5 grid layout
   - Row 0-1: small enemies (type='small', points=40)
   - Row 2-3: medium enemies (type='medium', points=20)
   - Row 4: large enemies (type='large', points=10)
3. Formation positioned: x = canvasWidth / 2 - (11 * 28 / 2), y = 50
4. Direction set: directionX = 1 (moving right)
5. Speed calculated using waveNumber and all 55 enemies alive

### Update Cycle (Each Frame)
```
Game Loop Frame
  ├─ Receive deltaTime (ms since last frame) and waveNumber
  ├─ formation.update(deltaTime, waveNumber)
  │  ├─ Recalculate speed: calculateFormationSpeed(waveNumber, aliveCount)
  │  ├─ Move formation laterally: formation.x += speed * directionX * (deltaTime / 1000)
  │  ├─ Check left edge: if (formation.x < 0)
  │  │   └─ formation.drop(), directionX = 1
  │  ├─ Check right edge: if (formation.x + formationWidth > canvasWidth)
  │  │   └─ formation.drop(), directionX = -1
  │  ├─ Update each enemy position: enemy.x = formation.x + gridX[index], enemy.y = formation.y + gridY[index]
  │  └─ Return hasReachedBottom (if formation.y + formationHeight >= canvasHeight)
  ├─ rendering.drawFormation(formation)
  │  └─ For each alive enemy:
  │      └─ renderEnemy(ctx, enemy, enemy.x, enemy.y)
  └─ Check game state: if hasReachedBottom → GameOver
```

### Rendering Pipeline
```
drawFormation(formation)
  └─ For each enemy in formation.enemies:
      └─ If enemy.alive:
          └─ Determine enemy type (small/medium/large)
          └─ Draw sprite at (enemy.x, enemy.y) with type-specific dimensions
             ├─ Small enemy: 24×24 gray/blue rectangle with pattern
             ├─ Medium enemy: 32×32 larger rectangle with pattern
             └─ Large enemy: 40×40 largest rectangle with pattern
```

### Edge Detection & Bouncing
```
Update Formation Position:
  1. Move laterally by: speed * directionX * (deltaTime / 1000)
  2. Check left boundary:
     if (formation.x < edgeMargin) {
       formation.drop()          // Move down by one enemy height
       directionX = 1           // Reverse direction (move right)
     }
  3. Check right boundary:
     if (formation.x + formationWidth > canvasWidth - edgeMargin) {
       formation.drop()          // Move down by one enemy height
       directionX = -1          // Reverse direction (move left)
     }
```

### Speed Scaling During Wave
```
When update() is called:
  1. Count alive enemies: aliveCount = formation.getAliveEnemies().length
  2. Recalculate speed each frame:
     speed = baseSpeed * waveMultiplier * countMultiplier
  3. As enemies die (aliveCount decreases), speed increases smoothly
  4. When enemy count drops to 50% (27 dead, 28 alive):
     speed ≈ 1.4× original speed (proportional to enemy count scaling)
```

### Wave Reset Sequence
```
resetForWave(waveNumber):
  1. Create 55 new Enemy instances
  2. Reset formation position: x = canvasWidth / 2 - formationWidth/2, y = 50
  3. Reset direction: directionX = 1
  4. Recalculate speed based on new waveNumber and full enemy count (55)
  5. All enemies marked alive = true
```

## Deliverables

### Code Files

1. **src/game/entities/Enemy.ts**
   - Enemy class with position, type, points, alive flag
   - Bounding box calculation
   - Type-specific properties (width, height)

2. **src/game/entities/Formation.ts**
   - Formation class managing 11×5 grid
   - initialize(waveNumber): creates 55 enemies
   - update(deltaTime, waveNumber): lateral movement, edge detection, bouncing
   - render(ctx): draws all alive enemies
   - drop(): vertical movement when bouncing
   - Speed scaling: calculateFormationSpeed()
   - hasReachedBottom(): boundary check for game over condition
   - resetForWave(): reinitialize for next wave

3. **src/game/config/EnemyConfig.ts**
   - ENEMY_TYPES configuration with width, height, points
   - GRID_LAYOUT array defining initial row types
   - Enemy sprite rendering functions

4. **src/game/RenderingSystem.ts** (Extended)
   - drawFormation(formation): render all alive enemies
   - drawEnemy(ctx, enemy, x, y): render single enemy sprite
   - drawSmallEnemy(), drawMediumEnemy(), drawLargeEnemy(): sprite functions

5. **src/game/GameLoopManager.ts** (Extended)
   - formation.update(deltaTime, waveNumber) called each frame
   - Game over check: if formation.hasReachedBottom()

### Canvas Rendering

- Formation rendered at pixel-perfect positions using Canvas 2D fillRect
- Three sprite types visually distinct (size and color/pattern)
- Smooth movement via delta-time calculations
- Efficient rendering: only draw alive enemies (culled during loop)

## Success Criteria

✅ **Formation initializes** — 55 enemies in 11×5 grid visible at start of wave  
✅ **Lateral movement** — Formation moves smoothly left/right at consistent speed  
✅ **Edge bouncing** — Formation reverses direction and drops down one unit when hitting left/right boundary  
✅ **Speed scaling with wave** — Wave 2 moves ~10% faster than Wave 1 (visual confirmation)  
✅ **Speed scales with enemy count** — Visible speed increase as enemies are destroyed (verify mid-wave)  
✅ **Three sprite types visible** — Small, medium, large enemies distinguishable by size and color  
✅ **Reaching bottom = game over** — Formation reaching bottom of screen triggers game over state  
✅ **All enemies alive by default** — At wave start, 55/55 enemies visible and alive  
✅ **Frame-independent movement** — Movement consistent regardless of frame rate fluctuations  
✅ **No rendering artifacts** — Enemies render without flickering or overlap issues  
✅ **Collision-ready bounding boxes** — Each enemy has accurate bounding box for later collision detection

## Observability Impact

### Console Logging (Development)
- Wave start: `console.log('Wave ${waveNumber}: 55 enemies spawned')`
- Speed recalculation: `console.log(\`Formation speed: ${speed.toFixed(0)} px/sec (${aliveCount}/55 alive)\`)`
- Edge bounce: `console.log('Formation bounced at right edge, direction = left')`
- Reaching bottom: `console.log('Formation reached bottom — GameOver')`
- Alive enemy count: `console.log(\`Enemies alive: ${aliveCount}/55\`)`

### React DevTools
- Watch formation.countAliveEnemies() to verify enemy destruction
- Verify waveNumber increments correctly on victory

### Canvas Debug Overlay (Optional)
- Formation bounding box outline (debug mode)
- Direction arrow indicator
- Current speed display
- Enemy count display (X/55 alive)

## Testing Strategy

### Unit Tests
- Enemy constructor initializes x, y, type, points, alive correctly
- Formation.initialize(waveNumber) creates exactly 55 enemies in correct layout
- Formation speed calculation: verify waveMultiplier and countMultiplier applied correctly
- Edge detection: formation.x values at boundaries trigger direction reversal
- getAliveEnemies() returns only alive enemies; count decreases when enemy.alive = false

### Integration Tests
- Formation initializes and renders at wave 1
- Formation moves laterally each frame; position changes by speed × deltaTime
- Formation bounces at left edge (x = 0), direction reverses, y increases
- Formation bounces at right edge (x + width = canvasWidth), direction reverses, y increases
- Speed increases visibly between wave 1 and wave 2
- Speed increases visibly as enemies are destroyed mid-wave
- hasReachedBottom() returns true when y + height >= canvasHeight
- Game loop detects bottom boundary and triggers game over state

### Manual Testing
- Load game, start wave 1
- Observe 55 enemies in grid formation, moving smoothly
- Watch formation bounce at screen edges
- Verify direction reverses correctly (left/right)
- Verify formation drops with each bounce (y increases)
- Kill ~27 enemies (50%), observe speed increase
- Start wave 2, observe ~10% additional speed increase
- Let formation reach bottom, confirm game over screen appears
- Restart and verify formation resets to initial state
