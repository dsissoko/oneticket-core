# Slice 6 — Enemy Fire System

## Goal

Implement a complete enemy fire system with random bullet spawning, object pooling for bullet reuse, fire rate scaling based on wave progression, and integration with the collision manager. This slice delivers the core challenge mechanic where enemies shoot back at the player, requiring strategic use of shields and movement.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-005 — Enemy Fire System](us-005-enemy-fire-system.md)
[US-006 — Collision Detection & Scoring](us-006-collision-detection-scoring.md)

## Impacted Components

### Core Components
- **EnemyBullet Entity**: Represents a single bullet fired by an enemy
- **BulletPool**: Manages a pool of reusable EnemyBullet objects (max 3 simultaneous)
- **FireController**: Orchestrates random firing logic per enemy column
- **RenderingSystem**: Extended to draw enemy bullets to canvas
- **CollisionManager**: Receives enemy bullet collision signals

### Data Structures
- **EnemyBullet**: Position, velocity, collision box, active state
- **BulletPool**: Array of pre-allocated bullets, active/inactive markers
- **FireController**: Per-column fire timers, randomization state

## Interfaces

### EnemyBullet
```typescript
class EnemyBullet {
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  active: boolean
  
  update(deltaTime: number): void
  isOutOfBounds(canvasHeight: number): boolean
  getBoundingBox(): BoundingBox
}
```

### BulletPool
```typescript
class BulletPool {
  maxBullets: number
  bullets: EnemyBullet[]
  activeCount: number
  
  constructor(maxBullets: number, bulletSpeed: number)
  fire(x: number, y: number): EnemyBullet | null
  returnToPool(bullet: EnemyBullet): void
  update(deltaTime: number, canvasHeight: number): void
  getActiveBullets(): EnemyBullet[]
}
```

### FireController
```typescript
class FireController {
  fireInterval: number  // Base interval (ms) between fire events
  fireTimers: Map<number, number>  // Per-column fire countdown timers
  
  update(deltaTime: number, formation: Formation, bulletPool: BulletPool, waveNumber: number): void
  calculateFireInterval(waveNumber: number, enemyCount: number): number
  selectRandomEnemy(columnIndex: number, formation: Formation): Enemy | null
}
```

## Data Changes

### EnemyBullet State
```typescript
interface EnemyBullet {
  x: number              // Current horizontal position
  y: number              // Current vertical position
  vx: number             // Horizontal velocity (typically 0)
  vy: number             // Downward velocity (positive)
  width: number          // Bullet width (e.g., 4px)
  height: number         // Bullet height (e.g., 12px)
  active: boolean        // Pool active/inactive marker
}
```

### BulletPool State
```typescript
interface BulletPoolState {
  bullets: EnemyBullet[]          // All pooled bullets (max 3)
  activeCount: number             // Currently active bullets
  lastFiredIndex: number          // Index of last fired bullet (for FIFO removal)
}
```

### FireController State
```typescript
interface FireControllerState {
  fireInterval: number            // Time (ms) until next column fires
  fireTimers: Map<number, number> // Per-column countdown timers
  baseFireRate: number            // Base fire rate (adjusts with wave)
}
```

## Sequence Flow

### Initialization (on game start)
1. Formation is created with 55 enemies in 11 columns × 5 rows
2. BulletPool created with maxBullets = 3, pre-allocated with 3 EnemyBullet objects
3. FireController initialized:
   - fireInterval = 2000ms (base rate, adjusted per wave)
   - fireTimers Map initialized with 11 entries (one per column), randomized
4. Enemy bullets array in game loop state set to empty

### Per-Frame Update Loop
```
requestAnimationFrame
  ├─ Input processing (unchanged)
  ├─ Entity updates
  │   ├─ Formation update
  │   ├─ Player update
  │   ├─ FireController.update(deltaTime, formation, bulletPool, waveNumber)
  │   │   ├─ Decrement all column fire timers by deltaTime
  │   │   ├─ For each column with timer ≤ 0:
  │   │   │   ├─ Select random alive enemy from that column
  │   │   │   ├─ Fire bullet: bulletPool.fire(enemy.x, enemy.y)
  │   │   │   └─ Reset timer: randomize(fireInterval ± 20%)
  │   │   └─ Adjust fireInterval based on wave: interval *= 0.9^(waveNumber - 1)
  │   ├─ BulletPool.update(deltaTime, canvasHeight)
  │   │   ├─ For each active bullet:
  │   │   │   ├─ Update position: y += vy * deltaTime
  │   │   │   ├─ Check bounds: if y > canvasHeight, deactivate and return to pool
  │   │   │   └─ Generate collision event
  │   ├─ CollisionManager.checkCollisions() [from Slice 5]
  │   │   ├─ Check enemy bullets vs player
  │   │   ├─ Check enemy bullets vs shields
  │   │   └─ Update pool: deactivate hit bullets
  │   └─ Update score/lives if collision occurred
  ├─ Rendering
  │   ├─ RenderingSystem.drawBullets(bulletPool.getActiveBullets())
  │   └─ Canvas displays bullets downward from spawn points
  └─ State evaluation (continue Playing or transition)
```

### Fire Event Sequence
1. FireController detects column fire timer ≤ 0
2. Selects random alive enemy from formation column
3. Calls bulletPool.fire(enemy.x, enemy.y)
4. BulletPool checks if activeCount < maxBullets:
   - If yes: activate bullet at enemy position, increment activeCount
   - If no: deactivate oldest bullet, reuse its slot, spawn new bullet
5. Fire timer resets with random offset: interval ± 20%

### Bullet Lifecycle
```
Fire: bulletPool.fire(x, y)
  ↓ (bullet active, on-screen)
Update: bullet.update(deltaTime) → y += vy * deltaTime
  ↓
Collision Check: CollisionManager.checkCollisions()
  ├─ Hit player → bullet deactivated, pool.returnToPool()
  ├─ Hit shield → bullet deactivated, pool.returnToPool()
  └─ No collision → bullet continues
  ↓
Out of Bounds: isOutOfBounds() → pool.returnToPool()
  ↓
Pool Removal: bullet.active = false, wait for next fire
```

## Wave Scaling

### Fire Rate Progression
- **Wave 1**: fireInterval = 2000ms (base)
- **Wave 2**: fireInterval = 2000 × 0.9 = 1800ms
- **Wave 3**: fireInterval = 2000 × 0.81 ≈ 1620ms
- **Formula**: `interval = baseInterval × (0.9)^(waveNumber - 1)`

### Enemy Count Scaling (future: affects effective rate)
- **Start of wave**: 55 enemies firing from random positions
- **As enemies die**: Fire rate may increase to maintain challenge
- **Alternative**: Fire rate depends on remaining enemy count:
  - `interval = baseInterval × (remainingCount / 55)`

## Rendering

### Canvas Drawing
```typescript
RenderingSystem.drawEnemyBullets(bullets: EnemyBullet[]) {
  for (const bullet of bullets) {
    if (bullet.active) {
      ctx.fillStyle = '#FF4444'  // Red for enemy bullets
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
    }
  }
}
```

### Visual Characteristics
- Enemy bullets: 4px wide × 12px tall, red color (#FF4444)
- Spawned from enemy center: x = enemy.x + enemy.width/2 - bulletWidth/2
- Initial y position: enemy.y + enemy.height
- Downward movement: vy = 150 px/s (adjustable per wave)

## Collision Integration

### CollisionManager Interactions
Slice 6 provides enemy bullets to CollisionManager (from Slice 5):
```typescript
PhysicsSystem.checkCollisions() {
  // Enemy bullets vs player
  for (const bullet of activeBullets) {
    if (AABB(bullet, player)) {
      bullet.active = false
      bulletPool.returnToPool(bullet)
      player.takeDamage(1)
      break  // Max one hit per frame
    }
  }
  
  // Enemy bullets vs shields
  for (const bullet of activeBullets) {
    for (const shield of shields) {
      for (const segment of shield.segments) {
        if (AABB(bullet, segment)) {
          bullet.active = false
          bulletPool.returnToPool(bullet)
          segment.takeDamage()
          break
        }
      }
    }
  }
}
```

## Success Criteria

✅ **EnemyBullet entity created** — position, velocity, collision box properly initialized  
✅ **Bullet pool working** — max 3 bullets on screen, pool slots reused when bullets exit  
✅ **Fire logic implemented** — random timer per column, one random enemy fires per trigger event  
✅ **Fire rate scaling** — interval decreases as wave progresses (0.9^(wave-1) multiplier)  
✅ **Bullet movement smooth** — downward trajectory at ~150 px/s, frame-independent (deltaTime scaled)  
✅ **Canvas rendering** — enemy bullets visible as red rectangles, position updates each frame  
✅ **Bounds checking** — bullets exit screen and return to pool when y > canvasHeight  
✅ **Collision integration** — bullets passed to CollisionManager, deactivated on hit  
✅ **Performance baseline** — maintains 60 FPS with 3 enemy bullets active  
✅ **Pool efficiency** — no garbage collection spikes, bullets reused across frames  

## Deliverables

### Code Files
1. **src/game/EnemyBullet.ts**
   - EnemyBullet class: position, velocity, collision box, active state
   - update(deltaTime): void — updates y position
   - isOutOfBounds(canvasHeight): boolean
   - getBoundingBox(): BoundingBox

2. **src/game/BulletPool.ts**
   - BulletPool class: manages max 3 EnemyBullet objects
   - fire(x, y): EnemyBullet | null — spawn new bullet or reuse oldest
   - returnToPool(bullet): void — deactivate bullet
   - update(deltaTime, canvasHeight): void — update all active bullets
   - getActiveBullets(): EnemyBullet[]

3. **src/game/FireController.ts**
   - FireController class: random firing logic per column
   - update(deltaTime, formation, bulletPool, waveNumber): void
   - calculateFireInterval(waveNumber, enemyCount): number
   - selectRandomEnemy(columnIndex, formation): Enemy | null

4. **src/game/RenderingSystem.ts** (extended)
   - drawEnemyBullets(bullets: EnemyBullet[]): void

5. **src/game/PhysicsSystem.ts** (extended from Slice 5)
   - Collision detection for enemy bullets vs player
   - Collision detection for enemy bullets vs shield segments
   - Bullet deactivation on impact

6. **src/components/Game.tsx** (updated)
   - Initialize BulletPool and FireController on game start
   - Pass bulletPool to collision checks

### Integration Points
- BulletPool integrated into game loop state (GameLoopState.enemyBullets)
- FireController called each frame in entity update phase
- RenderingSystem.drawEnemyBullets() called in render phase
- PhysicsSystem receives active bullets for collision checks

## Testing Strategy

### Unit Tests
- BulletPool.fire() respects max 3 bullets
- BulletPool returns bullets to pool when reused
- FireController.calculateFireInterval() applies wave scaling correctly
- EnemyBullet.update() moves bullet downward at correct velocity
- EnemyBullet.isOutOfBounds() detects exit screen correctly

### Integration Tests
- Game loop updates bullets each frame without errors
- Bullets render visually on canvas
- Fire rate increases across waves (verify interval decreases)
- Collision detection deactivates bullets on hit
- Pool efficiency: no memory leaks over 100+ frames

### Manual Testing
- Launch game, observe enemies firing random bullets
- Count bullets on screen: verify max 3 at all times
- Observe fire rate increase after wave complete
- Check visual appearance: bullets render red, move downward smoothly
- Verify bullets exit screen and pool reuses slots
- Test collisions: bullets destroyed on shield impact, player takes damage

## Observability Impact

### Console Logging (Development)
- Fire event: `console.log(\`Column \${col} fires from enemy at (\${enemy.x}, \${enemy.y})\`)`
- Pool status: `console.log(\`Bullet pool: \${activeCount}/\${maxBullets} active\`)`
- Wave scaling: `console.log(\`Wave \${waveNumber}: fire interval = \${fireInterval}ms\`)`
- Collision: `console.log(\`Enemy bullet hit player/shield, pool returned bullet\`)`

### React DevTools
- Watch bulletPool state in game loop ref
- Verify fireController timers reset correctly
- Monitor active bullet count

### Canvas Debug Overlay (Optional)
- Draw bounding boxes around active bullets (dev mode)
- Display fire interval countdown timer (dev mode)
- Bullet spawn event flash (visual feedback)

## Related Slices

- **Slice 1**: Foundation — provides canvas, game loop, rendering pipeline
- **Slice 5**: Collision Detection & Scoring — receives enemy bullet collision events
- **Slice 7** (future): Enemy Fire Rate Tuning — adjusts fire interval per difficulty

## Notes

- Bullet pool is fixed at 3 — never allocates new bullets at runtime
- Fire timers are per-column to ensure distributed firing (not all bullets spawn simultaneously)
- Wave scaling uses exponential decay (0.9^(wave-1)) to balance difficulty progression
- Bullet speed (vy) is constant per wave but could be extended to scale with waves
- Column selection is random (no targeting logic in MVP) — future enhancement
