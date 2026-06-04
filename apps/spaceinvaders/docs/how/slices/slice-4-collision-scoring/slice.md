# Slice 4 — Collision Detection and Scoring System

## Goal

Implement complete collision detection across all game entity types (projectile-enemy, projectile-shield, projectile-mystery, enemy-shield, formation-player) and provide a comprehensive scoring system that awards points based on entity type, with life management integrated throughout.

## Related Epics

[Epic 0 — MVP Complete Playable Space Invaders Game](epic-0-mvp/epic.md)

## Related User Stories

[US-002 — Enemy Formation](us-002-enemy-formation.md)
[US-004 — Shields and Collisions](us-004-shields-collisions.md)
[US-005 — Enemy Fire and Mystery Ships](us-005-enemy-fire-mystery-ships.md)

## Impacted Components

- **Physics & Collision Engine** (`usePhysics` hook) — AABB collision detection, collision resolution
- **Game Loop** (`SpaceInvaders.tsx`) — Collision handling integration into update phase
- **Entity System** — Enemy, Projectile, Shield, MysteryShip, Player entities with collision responses
- **Game State** (`GameState` interface) — Lives tracking, score accumulation
- **Renderer** (`useRenderer` hook) — Visual feedback on collisions (segment degradation, enemy destruction flash)

## Interfaces

### Collision Detection Interface
```typescript
interface Collision {
  type: 'projectile-enemy' | 'projectile-shield' | 'projectile-mystery' | 'enemy-shield' | 'formation-player';
  entities: Entity[];
  resolve(state: GameState): GameState;
}

interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

function detectAABBCollision(box1: AABB, box2: AABB): boolean;
```

### Scoring Interface
```typescript
interface ScoreEvent {
  type: 'enemy-destroyed' | 'mystery-ship-destroyed';
  points: number;
  enemyType?: 'top' | 'middle' | 'bottom';
  timestamp: number;
}

interface ScoringSystem {
  awardPoints(state: GameState, event: ScoreEvent): GameState;
  getPointsForEnemy(enemyType: 'top' | 'middle' | 'bottom'): number;
}
```

### Life Management Interface
```typescript
interface LifeSystem {
  reduceLife(state: GameState): GameState;
  checkGameOver(state: GameState): boolean;
  resetLives(wave: number): number;
}
```

## Data Changes

### GameState Additions/Modifications
- **lives:** number — Player lives remaining (starts at 3 per wave)
- **score:** number — Cumulative score across waves
- **elapsedTime:** number — For timing game over transitions
- **gameOverReason:** 'lives-exhausted' | 'formation-reached' — Why game ended

### Scoring Point Values
- **Top 2 rows (30 points):** High-value enemies
- **Middle 2 rows (20 points):** Medium-value enemies
- **Bottom row (10 points):** Low-value enemies
- **Mystery Ship (50/100/150/300 points):** Random bonus per appearance

### Shield Segment State
- **destroyed:** boolean — Whether segment is visually gone and excluded from collision
- Segments degrade visually on each hit; destroyed completely on final hit

## Sequence Flow

### Projectile-Enemy Collision
1. **Detection Phase:** Broadphase filter player projectiles vs alive enemies
2. **Narrowphase:** AABB intersection test on each pair
3. **Resolution:** 
   - Mark enemy as `alive: false`
   - Remove projectile from active array
   - Emit `ScoreEvent` with enemy type and points
   - Award points to player score

### Projectile-Shield Collision
1. **Detection Phase:** Player projectiles vs shield segments
2. **Narrowphase:** AABB collision on each projectile vs segment bounding box
3. **Resolution:**
   - Mark segment as `destroyed: true`
   - Remove projectile from active array
   - Trigger segment visual degradation (if needed)

### Projectile-Mystery Ship Collision
1. **Detection Phase:** Player projectiles vs mystery ship (if active)
2. **Narrowphase:** AABB collision
3. **Resolution:**
   - Set `mysteryShip: null`
   - Remove projectile from active array
   - Emit `ScoreEvent` with mystery ship points (50/100/150/300)
   - Award bonus points

### Enemy-Shield Collision
1. **Detection Phase:** Formation bounding box vs shield segments during step-down
2. **Narrowphase:** Grid-based segment intersection
3. **Resolution:**
   - Destroy affected segments (mark `destroyed: true`)
   - Formation continues downward

### Formation-Player Collision
1. **Detection Phase:** Formation bounding box at player row level
2. **Narrowphase:** Full formation vs player collision box
3. **Resolution:**
   - Set `gameOverReason: 'formation-reached'`
   - Transition to `GamePhase.GAME_OVER`
   - Preserve score; reset lives for next game

### Enemy Projectile-Player Collision
1. **Detection Phase:** Enemy projectiles vs player bounding box
2. **Narrowphase:** AABB collision
3. **Resolution:**
   - Reduce lives by 1
   - Remove projectile
   - If lives > 0: Apply invincibility frames; continue playing
   - If lives = 0: Set `gameOverReason: 'lives-exhausted'`; transition to `GamePhase.GAME_OVER`

### Enemy Projectile-Shield Collision
1. **Detection Phase:** Enemy projectiles vs shield segments
2. **Narrowphase:** AABB collision
3. **Resolution:**
   - Mark segment as `destroyed: true`
   - Remove projectile

## Observability Impact

### Debug Visualization
- Canvas overlay (dev mode): Draw collision bounding boxes in green
- Console logging (dev mode): Log every collision event with entities and resolution
- FPS counter: Ensure collision detection does not impact frame budget

### Metrics
- **Collision Count:** Total collision checks per frame
- **Performance:** Collision detection latency (target <5 ms per frame)
- **Score Events:** Log all scoring events with timestamp, type, and points
- **Lives Lost:** Track player damage events and game over conditions

### Error Handling
- Gracefully ignore collisions on destroyed or out-of-bounds entities
- Validate collision state consistency before each resolution
- Catch edge cases: collision during entity spawn, double-detection on same pair

---

## Technical Notes

**Collision Detection Strategy:**
- Broadphase: Entity type filtering (only test compatible pairs)
- Narrowphase: AABB (Axis-Aligned Bounding Box) intersection
- Resolution: Immediate destruction or state change in same frame

**Scoring Accumulation:**
- Points are added to `state.score` immediately on kill
- Score persists across waves (cumulative)
- No score cap enforced; arcade tradition accepts high scores

**Life Management:**
- Lives reset to 3 at wave start
- Lives decrement on enemy projectile hit (invincibility frames optional)
- Game over triggered when lives = 0 or formation reaches player
- High score tracking optional (localStorage)
