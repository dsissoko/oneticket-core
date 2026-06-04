# Slice 5 — Collision Detection & Resolution

## Goal

Implement comprehensive AABB (Axis-Aligned Bounding Box) collision detection for all entity pairs (player bullets vs enemies, player bullets vs mystery ship, enemy bullets vs player, bullets vs shields, formation vs shields, formation vs player) with accurate collision response including entity destruction, scoring, shield degradation, invincibility frames, and game-over triggers. This slice delivers the complete physics system that makes Space Invaders playable by enforcing collision rules and processing all game outcomes.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-006 — Collision Detection & Scoring](us-006-collision-detection-scoring.md)

## Impacted Components

### Core Components

- **PhysicsSystem**: Central collision detection and response engine
- **CollisionManager**: Iterates all entity pairs, dispatches detection and response
- **BoundingBox**: Geometric primitives for AABB calculations
- **CollisionResponse**: Structured data capturing collision outcome (entity destruction, score, damage)
- **ObjectPool (Bullets)**: Reuses bullet objects to minimize garbage collection during collisions
- **Entity Managers**: Formation, Player, Enemies, Shields updated with collision aftermath

### Data Structures

- **BoundingBox**: x, y, width, height for AABB representation
- **Collision**: type ('bullet-enemy', 'bullet-shield', 'bullet-player', 'formation-shield', 'formation-player', 'bullet-mystery'), entities involved, response
- **CollisionResult**: Scored points, entities to destroy, state changes to apply

## Interfaces

### BoundingBox & AABB Detection
```typescript
interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

class AABBDetector {
  static checkCollision(a: BoundingBox, b: BoundingBox): boolean
  static getOverlapRect(a: BoundingBox, b: BoundingBox): BoundingBox | null
}
```

### CollisionManager
```typescript
class CollisionManager {
  checkAllCollisions(
    formation: Formation,
    player: Player,
    bullets: Bullet[],
    shields: Shield[],
    mysteryShip: MysteryShip | null
  ): CollisionEvent[]
  
  checkPlayerBulletEnemyCollisions(bullets: PlayerBullet[], formation: Formation): CollisionEvent[]
  checkPlayerBulletShieldCollisions(bullets: PlayerBullet[], shields: Shield[]): CollisionEvent[]
  checkEnemyBulletPlayerCollisions(bullets: EnemyBullet[], player: Player): CollisionEvent[]
  checkFormationShieldCollisions(formation: Formation, shields: Shield[]): CollisionEvent[]
  checkFormationPlayerCollisions(formation: Formation, player: Player): CollisionEvent[]
  checkPlayerBulletMysteryShipCollisions(bullets: PlayerBullet[], mysteryShip: MysteryShip | null): CollisionEvent[]
}
```

### CollisionEvent & Response
```typescript
interface CollisionEvent {
  type: 'bullet-enemy' | 'bullet-mystery' | 'bullet-shield' | 'enemy-bullet-player' | 'formation-shield' | 'formation-player'
  entities: (Bullet | Enemy | Shield | Player | Formation | MysteryShip)[]
  response: CollisionResponse
}

interface CollisionResponse {
  pointsAwarded: number
  entitiesToDestroy: Entity[]
  playerDamage: boolean
  playerInvincibility: boolean
  gameOverTriggered: boolean
  shieldDamageData?: { shieldIndex: number; segmentGridX: number; segmentGridY: number }
}
```

### PhysicsSystem (Main Orchestrator)
```typescript
class PhysicsSystem {
  update(
    formation: Formation,
    player: Player,
    playerBullets: PlayerBullet[],
    enemyBullets: EnemyBullet[],
    shields: Shield[],
    mysteryShip: MysteryShip | null,
    onCollision: (event: CollisionEvent) => void
  ): void
  
  applyCollisionResponses(events: CollisionEvent[]): void
  calculateScore(event: CollisionEvent): number
}
```

### BulletPool (Object Reuse)
```typescript
class BulletPool {
  constructor(initialSize: number)
  acquire(x: number, y: number, vx: number, vy: number, type: 'player' | 'enemy'): Bullet
  release(bullet: Bullet): void
  getAllActive(): Bullet[]
  clear(): void
}
```

## Data Changes

### Collision Event Tracking
```typescript
interface CollisionEvent {
  id: string  // Unique identifier per frame
  type: 'bullet-enemy' | 'bullet-mystery' | 'bullet-shield' | 'enemy-bullet-player' | 'formation-shield' | 'formation-player'
  timestamp: number
  bulletId?: string
  enemyId?: string
  shieldIndex?: number
  segmentGridX?: number
  segmentGridY?: number
  pointsAwarded: number
  response: CollisionResponse
}
```

### Score Tracking
```typescript
interface ScoreData {
  currentScore: number
  pointsEarned: CollisionEvent[]  // Log of all scoring events
  lastCollisionTime: number
  
  awardPoints(points: number, reason: string): void
  onEnemyDestroyed(type: 'small' | 'medium' | 'large'): void
  onMysteryShipDestroyed(bonus: number): void
  onShieldSegmentDestroyed(): void
}
```

### Game Loop Collision State (useRef)
```typescript
interface GameLoopState {
  // ... existing fields ...
  collisionManager: CollisionManager
  physics: PhysicsSystem
  bulletPool: BulletPool
  collisionEvents: CollisionEvent[]  // Current frame events
  scoreTracker: ScoreData
}
```

## Sequence Flow

### Collision Detection Phase (Each Frame)

```
Game Loop Frame:
  ├─ Entity Update (all entities moved to new positions)
  │
  ├─ Collision Detection Phase:
  │   ├─ collisionManager.checkAllCollisions(formation, player, bullets, shields, mysteryShip)
  │   │   ├─ Player bullets vs Enemies:
  │   │   │   └─ For each playerBullet:
  │   │   │       └─ For each alive enemy:
  │   │   │           └─ AABB check → collision found
  │   │   │               ├─ Create CollisionEvent (type: 'bullet-enemy')
  │   │   │               ├─ Award points: 10 (small) | 20 (medium) | 40 (large)
  │   │   │               ├─ Mark enemy: alive = false
  │   │   │               └─ Mark bullet: active = false
  │   │
  │   ├─ Player bullets vs Mystery Ship:
  │   │   └─ If mysteryShip exists:
  │   │       └─ For each playerBullet:
  │   │           └─ AABB check vs mysteryShip.boundingBox
  │   │               ├─ Create CollisionEvent (type: 'bullet-mystery')
  │   │               ├─ Award bonus: 50–300 based on timing
  │   │               ├─ Mark ship: alive = false
  │   │               └─ Mark bullet: active = false
  │   │
  │   ├─ Player bullets vs Shields:
  │   │   └─ For each playerBullet:
  │   │       └─ For each shield:
  │   │           └─ For each segment in shield:
  │   │               └─ AABB check
  │   │                   ├─ Create CollisionEvent (type: 'bullet-shield')
  │   │                   ├─ Call segment.takeDamage()
  │   │                   ├─ Award points: 5 per segment
  │   │                   └─ Mark bullet: active = false
  │   │
  │   ├─ Enemy bullets vs Player:
  │   │   └─ For each enemyBullet:
  │   │       └─ AABB check vs player.boundingBox
  │   │           ├─ If NOT player.invincible:
  │   │           │   ├─ Create CollisionEvent (type: 'enemy-bullet-player')
  │   │           │   ├─ player.takeDamage()
  │   │           │   ├─ player.invincible = true
  │   │           │   ├─ player.invincibilityTimer = 2000 ms
  │   │           │   ├─ lives -= 1
  │   │           │   ├─ Mark bullet: active = false
  │   │           │   └─ Check: if lives === 0 → gameOverTriggered = true
  │   │           └─ Else (invincible):
  │   │               └─ Mark bullet: active = false (bullet still removed)
  │   │
  │   ├─ Enemy bullets vs Shields:
  │   │   └─ For each enemyBullet:
  │   │       └─ For each shield:
  │   │           └─ For each segment:
  │   │               └─ AABB check
  │   │                   ├─ Call segment.takeDamage()
  │   │                   └─ Mark bullet: active = false
  │   │
  │   ├─ Formation vs Shields:
  │   │   └─ For each shield:
  │   │       └─ AABB check vs formation.boundingBox
  │   │           ├─ Create CollisionEvent (type: 'formation-shield')
  │   │           ├─ Destroy all segments: shield.segments.forEach(s => s.alive = false)
  │   │           └─ No points awarded
  │   │
  │   ├─ Formation vs Player:
  │   │   └─ AABB check: formation.bottom >= player.top
  │   │       ├─ Create CollisionEvent (type: 'formation-player')
  │   │       ├─ gameOverTriggered = true
  │   │       └─ No collision response (game state handles it)
  │   │
  │   └─ Collect all CollisionEvents into array
  │
  ├─ Collision Response Phase:
  │   ├─ For each CollisionEvent:
  │   │   ├─ Apply response.pointsAwarded to score
  │   │   ├─ Destroy all response.entitiesToDestroy
  │   │   ├─ If response.playerDamage: decrement lives, trigger invincibility
  │   │   └─ If response.gameOverTriggered: set gameState = 'GameOver'
  │   │
  │   ├─ Object Pool Management:
  │   │   ├─ For each inactive bullet:
  │   │   │   └─ bulletPool.release(bullet)  // Return to pool
  │   │   │
  │   │   └─ For each new bullet needed:
  │   │       └─ bullet = bulletPool.acquire(...)  // Reuse from pool
  │   │
  │   └─ Propagate state changes to React:
  │       ├─ If score changed: onScoreChange(newScore)
  │       ├─ If lives changed: onLivesChange(newLives)
  │       └─ If gameState changed: onGameStateChange(newState)
  │
  ├─ Rendering Phase:
  │   └─ Canvas renders all updated entities
  │
  └─ State Evaluation:
      ├─ Check: if all enemies dead → gameState = 'Victory'
      ├─ Check: if lives === 0 → gameState = 'GameOver'
      └─ Continue Playing or transition state
```

### AABB Collision Detection Algorithm

```typescript
function checkCollision(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}
```

### Collision Response: Player Bullet + Enemy

```
1. Bullet and enemy bounding boxes overlap
2. Check if enemy is alive
3. If alive:
   ├─ Calculate points based on enemy type:
   │   ├─ 'small' enemy (top 2 rows) → 40 points
   │   ├─ 'medium' enemy (rows 2-3) → 20 points
   │   └─ 'large' enemy (bottom row) → 10 points
   ├─ Mark enemy as dead: enemy.alive = false
   ├─ Mark bullet as inactive: bullet.active = false
   ├─ Award points: score += points
   └─ Broadcast: onScoreChange(score)
```

### Collision Response: Player Bullet + Mystery Ship

```
1. Bullet and mystery ship bounding boxes overlap
2. Check if mystery ship is alive
3. If alive:
   ├─ Calculate bonus based on mystery ship position/timing:
   │   ├─ Timing-based: 50, 100, 150, 300 points (varies by stage)
   │   └─ Default: 100 points (if no timing data)
   ├─ Mark ship as destroyed: mysteryShip.alive = false
   ├─ Mark bullet as inactive: bullet.active = false
   ├─ Award bonus: score += bonus
   └─ Broadcast: onScoreChange(score)
```

### Collision Response: Enemy Bullet + Player

```
1. Enemy bullet and player bounding boxes overlap
2. Check if player is currently invincible
3. If NOT invincible:
   ├─ Trigger damage:
   │   ├─ player.invincible = true
   │   ├─ player.invincibilityTimer = 2000 ms (2 seconds)
   │   ├─ lives -= 1
   │   └─ Mark bullet as inactive
   ├─ Check game over: if lives === 0
   │   └─ gameState = 'GameOver'
   └─ Broadcast: onLivesChange(lives)
4. If invincible:
   └─ Just mark bullet inactive (no damage)
```

### Collision Response: Bullet + Shield

```
Player or Enemy Bullet + Shield Segment:
1. Bullet and segment bounding boxes overlap
2. For player bullets:
   ├─ Call segment.takeDamage()
   ├─ If segment fully destroyed: score += 5
   └─ Mark bullet as inactive
3. For enemy bullets:
   ├─ Call segment.takeDamage()
   └─ Mark bullet as inactive (no score awarded)
```

### Collision Response: Formation + Shield

```
1. Formation bounding box overlaps with any shield
2. For affected shield:
   ├─ Destroy all segments: segments.forEach(s => s.alive = false)
   ├─ shield.opacity = 0
   └─ No points awarded
3. Formation continues moving downward
```

### Collision Response: Formation + Player

```
1. Formation's bottom edge (y + height) crosses player's top edge (y)
2. Trigger game over:
   ├─ gameState = 'GameOver'
   ├─ All movement stops
   └─ HUD displays final score and restart button
```

### Object Pool Management (Bullet Reuse)

```
Initialization:
  ├─ bulletPool = new BulletPool(maxPoolSize: 20)
  └─ Pre-allocate 20 Bullet objects

Per Frame:
  1. Identify all inactive bullets (marked during collision response)
  2. Call bulletPool.release(bullet) for each
     └─ Stores bullet back in pool for reuse
  
  3. When new bullet needed (player fire or enemy fire):
     ├─ Check pool availability: if pool.hasAvailable()
     │   └─ bullet = pool.acquire(x, y, vx, vy, type)
     └─ Else: allocate new Bullet (rare, fallback)
  
  4. Reused bullet cleared:
     ├─ Reset position (x, y)
     ├─ Reset velocity (vx, vy)
     ├─ Reset lifetime
     └─ Set active = true
```

## Deliverables

### Code Files

1. **src/game/physics/AABBDetector.ts**
   - Static utility class for AABB collision detection
   - checkCollision(a: BoundingBox, b: BoundingBox): boolean
   - getOverlapRect(a: BoundingBox, b: BoundingBox): BoundingBox | null
   - Multiple tests: point-in-box, ray-cast (optional for future)

2. **src/game/physics/CollisionManager.ts**
   - CollisionManager class orchestrating all collision checks
   - checkAllCollisions(formation, player, bullets, shields, mysteryShip): CollisionEvent[]
   - Separate methods for each collision pair type (bullet-enemy, etc.)
   - Returns array of CollisionEvent objects

3. **src/game/physics/PhysicsSystem.ts**
   - PhysicsSystem as main interface for collision + response
   - update(): runs collision detection and response each frame
   - applyCollisionResponses(): processes all events
   - calculateScore(event): determines points awarded
   - Integration with entity managers (destruction, state changes)

4. **src/game/systems/BulletPool.ts**
   - BulletPool class for reusable bullet object allocation
   - acquire(x, y, vx, vy, type): returns Bullet from pool or new instance
   - release(bullet): returns bullet to pool
   - getAllActive(): returns all active bullets currently in use
   - Memory-efficient: avoids GC pauses during heavy fire

5. **src/game/entities/Bullet.ts** (Updated)
   - Add: active flag (true = in use, false = ready for pool)
   - Add: getBoundingBox() method for collision queries
   - Reset methods for pooling

6. **src/game/GameLoopManager.ts** (Extended)
   - Initialize PhysicsSystem and CollisionManager at game start
   - Call physicsSystem.update() each frame before rendering
   - Handle collision response callbacks (score, lives, state changes)
   - Trigger game-over or victory transitions based on collision results

7. **src/components/Game.tsx** (Updated)
   - Add collisionManager, physicsSystem, bulletPool to gameLoopRef
   - Initialize systems on 'Playing' state entry
   - Subscribe to collision events for score/lives updates

### Collision Integration Points

- **Formation.update()**: Already provides accurate bounding box for collision checks
- **Player.update()**: Already provides bounding box; receives damage callback from collision
- **Enemy**: Provides individual bounding boxes for bullet detection
- **Shield.Segment**: Provides bounding boxes for bullet/formation collision
- **MysteryShip**: Provides bounding box for bullet collision

### Scoring System Integration

```typescript
const SCORING_TABLE = {
  enemySmall: 40,      // Top 2 rows
  enemyMedium: 20,     // Rows 2-3
  enemyLarge: 10,      // Bottom row
  shieldSegment: 5,    // Per segment destroyed
  mysterShip: {
    timing1: 50,       // Early
    timing2: 100,      // Mid-game
    timing3: 150,      // Late
    timing4: 300       // End-game
  }
}
```

## Success Criteria

✅ **AABB detection accurate** — All entity pairs checked without false positives/negatives  
✅ **Player bullets destroy enemies** — Bullet-enemy collision marks enemy alive = false, bullet removed  
✅ **Scoring works correctly** — Points awarded match table (40/20/10 per enemy type, 5 per segment, 50-300 for mystery ship)  
✅ **Enemy bullets damage player** — Collision with player sets invincible = true, invincibilityTimer = 2000 ms, lives -= 1  
✅ **Shields degrade on hits** — Both player and enemy bullets reduce shield segment health, segments disappear after 3 hits  
✅ **Formation destroys shields** — Contact between formation and shield removes all shield segments instantly  
✅ **Formation triggers game over** — Formation reaching player line causes immediate game-over transition  
✅ **Score persists across waves** — Score accumulated in wave 1 carries forward; not reset on Victory  
✅ **Invincibility frames block damage** — During 2-second invincibility, enemy bullets don't reduce lives  
✅ **Mystery ship awards bonus** — Hitting mystery ship grants 50–300 points based on timing  
✅ **Bullet pooling works** — Inactive bullets reused from pool; no memory leaks during heavy fire  
✅ **Collision events accurate** — All collisions detected within 1 frame; no missed detections  
✅ **Performance acceptable** — Collision checks maintain 55+ FPS even with 55 enemies, 3+ bullets, 4 shields on screen  
✅ **HUD updates immediately** — Score and lives change immediately after collision  

## Observability Impact

### Console Logging (Development)

```typescript
// Collision events
console.log(`Collision: bullet-enemy, enemy type=${type}, points=${points}`)
console.log(`Collision: bullet-mystery, bonus=${bonus}`)
console.log(`Collision: enemy-bullet-player, lives=${lives}`)
console.log(`Collision: formation-shield, shield=${shieldIndex}`)
console.log(`Collision: formation-player → GameOver`)

// Score tracking
console.log(`Score: +${points} (${reason}), total=${score}`)

// Pooling
console.log(`BulletPool: ${activeCount}/${poolSize} in use`)
```

### React DevTools

- Watch gameLoopRef.physics.collisionManager state
- Verify scoreTracker accumulation across frames
- Monitor bulletPool utilization during heavy fire phases
- Track lives decrement on enemy bullet collision

### Canvas Debug Overlay (Optional)

- Draw bounding boxes around entities (debug mode)
- Display collision points where AABBs overlap
- FPS counter to verify no regression
- Collision event count per frame
- Memory usage (bullet pool efficiency)

## Testing Strategy

### Unit Tests

- **AABBDetector**:
  - checkCollision() returns true for overlapping boxes
  - checkCollision() returns false for adjacent/separated boxes
  - getOverlapRect() returns correct intersection rectangle

- **CollisionManager**:
  - checkAllCollisions() detects bullet-enemy at correct frames
  - checkAllCollisions() detects formation-player boundary
  - Returns correct CollisionEvent array
  - Empty array when no collisions

- **BulletPool**:
  - acquire() returns bullet with reset state
  - release() stores bullet back in pool
  - getAllActive() returns only active bullets
  - Pool capacity respected (no overflow)

- **PhysicsSystem**:
  - applyCollisionResponses() updates score correctly
  - applyCollisionResponses() marks entities for destruction
  - Invincibility timer set on player damage
  - Game over triggered when formation touches player

### Integration Tests

- **Bullet-Enemy Collision**:
  - Fire bullet at enemy → enemy.alive = false after collision
  - Score increases by correct amount (10/20/40)
  - Bullet removed from game
  - HUD score updates immediately

- **Enemy Bullet-Player Collision**:
  - Enemy bullet hits player → invincibility triggered
  - Lives decrease by 1
  - Player sprite flashes for 2 seconds
  - Second hit during invincibility → no damage, bullet removed

- **Shield Damage Progression**:
  - Bullet hits segment → opacity decreases
  - After 3 hits → segment disappears
  - Formation contact → all segments disappear instantly

- **Formation Boundary**:
  - Formation descends to player level → game over triggered
  - All movement stops
  - Game state transitions to 'GameOver'

- **Mystery Ship Bonus**:
  - Bullet hits mystery ship → score increases by 50–300
  - Ship disappears
  - Score persists for next wave

- **Bullet Pooling**:
  - Heavy fire (10+ bullets) → pool reuses bullets efficiently
  - No memory accumulation; GC pauses minimal
  - Bullet count stays under pool capacity

### Manual Testing

- Load game, start wave 1
- Fire player bullets at various enemies (top, middle, bottom rows)
- Verify each kills enemy and awards points (40 small, 20 medium, 10 large)
- Let enemy fire; allow bullets to hit player
- Verify player flashes for 2 seconds and takes damage
- Fire at shield; count hits until segment disappears (should be 3)
- Let formation descend to shield level; verify instant destruction
- Allow formation to reach bottom; verify game-over screen
- Restart; verify score carried forward if applicable
- Monitor FPS: should stay 55+ FPS throughout all tests

## Related Slices

- [Slice 1 — Foundation](slice-1-foundation/slice.md)
- [Slice 2 — Enemy Formation & Rendering](slice-2-enemies/slice.md)
- [Slice 3 — Player Control & Firing](slice-3-player/slice.md)
- [Slice 4 — Destructible Shields](slice-4-shields/slice.md)
- [Slice 6 — Enemy Fire System](slice-6-enemy-fire/slice.md)
- [Slice 7 — Mystery Ship & Bonus Encounters](slice-7-bonus/slice.md)
- [Slice 8 — Wave Progression & Difficulty Scaling](slice-8-waves/slice.md)
