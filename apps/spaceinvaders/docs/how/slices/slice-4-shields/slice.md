# Slice 4 — Destructible Shields

## Goal

Implement the complete shield system: 4 destructible bunkers positioned between player and formation, each consisting of a segment matrix (4×4 grid per shield). Shields degrade segment-by-segment when struck by player bullets, enemy bullets, or formation contact, with opacity feedback showing progressive damage. Full degradation removes segments from the game world, and formation contact destroys entire shields instantly.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-004 — Destructible Shields](us-004-destructible-shields.md)
[US-005 — Enemy Fire & Bullet Pooling](us-005-enemy-fire-bullet-pooling.md)
[US-006 — Collision Detection & Scoring](us-006-collision-detection-scoring.md)

## Impacted Components

### Core Components
- **Shield Class**: Manages 4 shields with segment matrices and health tracking
- **Segment Class**: Individual segment state (position, hit count, opacity, alive flag)
- **ShieldManager**: Factory and lifecycle handler for all 4 bunkers
- **RenderingSystem.drawShields()**: Draws all 4 shields with segment opacity based on health
- **PhysicsSystem**: Shield segment collision detection and damage response
- **Entity Manager**: Initialization and reset of shields on new waves

### Data Structures
- **Shield**: Position, 4×4 segment grid, visual bounding box
- **Segment**: Grid position, alive flag, health counter, opacity value
- **CollisionResponse**: Shield damage events propagated to physics system

## Interfaces

### Shield Class
```typescript
class Shield {
  x: number
  y: number
  width: number
  height: number
  segments: Segment[][]  // 4×4 grid

  constructor(x: number, y: number, segmentSize: number)
  damageSegment(gridX: number, gridY: number): boolean
  isDestroyed(): boolean
  reset(): void
  getVisibleSegments(): Segment[]
  getBoundingBox(): BoundingBox
}
```

### Segment Class
```typescript
class Segment {
  gridX: number
  gridY: number
  x: number
  y: number
  width: number
  height: number
  alive: boolean
  hitCount: number
  opacity: number

  constructor(gridX: number, gridY: number, x: number, y: number, size: number)
  takeDamage(): void
  updateOpacity(): void
  isDestroyed(): boolean
}
```

### RenderingSystem Extensions
```typescript
class RenderingSystem {
  drawShields(shields: Shield[]): void
  drawSegment(segment: Segment, ctx: CanvasRenderingContext2D): void
}
```

### PhysicsSystem Extensions
```typescript
class PhysicsSystem {
  checkPlayerBulletShieldCollision(bullet: PlayerBullet, shields: Shield[]): CollisionResponse[]
  checkEnemyBulletShieldCollision(bullet: EnemyBullet, shields: Shield[]): CollisionResponse[]
  checkFormationShieldCollision(formation: Formation, shields: Shield[]): CollisionResponse[]
  getShieldSegmentAtPoint(shields: Shield[], x: number, y: number): Segment | null
}
```

## Data Changes

### Shield Entity State
```typescript
interface Shield {
  x: number
  y: number
  width: number
  height: number
  segments: Segment[][]  // 4×4 grid
}

interface Segment {
  gridX: number
  gridY: number
  x: number
  y: number
  width: number
  height: number
  alive: boolean
  hitCount: number  // Tracks damage: 0 = fresh, 1-2 = degraded, 3+ = destroyed
  opacity: number   // 1.0 = fully intact, decreases with damage, 0 = invisible/removed
}
```

### Game Loop State Extensions (useRef)
```typescript
interface GameLoopState {
  // ... existing fields ...
  shields: Shield[]  // Array of 4 shields
  shieldSegmentsDamaged: number  // For tracking scoring bonus
}
```

### Collision Response
```typescript
interface ShieldCollisionResponse {
  shieldIndex: number
  segmentGridX: number
  segmentGridY: number
  damageType: 'player_bullet' | 'enemy_bullet' | 'formation_contact'
  segmentDestroyed: boolean
  shieldDestroyed: boolean
}
```

## Sequence Flow

### Shield Initialization (on wave start or game start)
1. GameLoopManager creates ShieldManager
2. ShieldManager creates 4 Shield instances
3. Shields positioned horizontally above player: x positions at 25%, 41%, 59%, 75% of canvas width
4. Each shield positioned at y = 150 pixels (above formation spawn point at y = 50 + buffer)
5. Each shield initialized with 4×4 segment grid (16 segments per shield)
6. All segments: alive = true, hitCount = 0, opacity = 1.0

### Shield Layout (per shield)
```
Segment dimensions: 12×12 pixels
Grid: 4 columns × 4 rows = 16 segments per shield
Shield total: 48×48 pixels
Spacing: 25% between shields horizontally
```

### Player Bullet → Shield Segment Collision
1. PhysicsSystem.checkPlayerBulletShieldCollision() iterates all segments
2. AABB test: bullet.boundingBox vs segment.boundingBox
3. On collision:
   - Segment.takeDamage() called: hitCount++
   - Segment.updateOpacity(): opacity = max(0, 1.0 - (hitCount * 0.33))
   - If hitCount >= 3: segment.alive = false
   - Bullet removed from game
   - Score += 10 points (optional incentive for shield breaking)
4. Segment disappears when opacity ≤ 0 or alive = false

### Enemy Bullet → Shield Segment Collision
1. PhysicsSystem.checkEnemyBulletShieldCollision() iterates all segments
2. AABB test: enemyBullet.boundingBox vs segment.boundingBox
3. On collision (same as player bullet):
   - Segment.takeDamage(): hitCount++
   - Segment.updateOpacity()
   - If hitCount >= 3: segment.alive = false
   - Bullet removed from game
   - No score awarded (enemy fire penalty)
4. Segment opacity decreases, disappears when threshold reached

### Formation Contact → Entire Shield Destroyed
1. PhysicsSystem.checkFormationShieldCollision() checks formation bounding box vs all shields
2. If formation.bottom >= any shield.top:
   - Set shield.isDestroyed() = true
   - All segments: alive = false, opacity = 0
   - Shield removed from rendering on next frame
   - No score change (end-game event)
3. If all shields destroyed by formation: GameOver triggered (via separate game-over logic)

### Rendering Shields
1. Each frame, RenderingSystem.drawShields(shields) called
2. For each shield in shields array:
   - For each segment in shield.segments:
     - If segment.alive:
       - Set ctx.fillStyle with opacity: `rgba(color, ${segment.opacity})`
       - fillRect(segment.x, segment.y, segment.width, segment.height)
3. Segments with opacity < 0.3 appear nearly transparent (visual degradation feedback)
4. Segments with alive = false skipped entirely

### Shield Reset (on new wave)
1. After Victory screen (all enemies defeated)
2. Transition to new wave (wave++, waveNumber updated in React state)
3. All shields: reset() called
4. All segments: hitCount = 0, alive = true, opacity = 1.0
5. Shields redrawn fresh at next frame

## Deliverables

### Code Files

1. **src/game/entities/Shield.ts**
   - Shield class with constructor, damageSegment(), isDestroyed(), reset()
   - Segment class with takeDamage(), updateOpacity(), isDestroyed()
   - Shield positioning logic
   - Segment grid initialization (4×4)

2. **src/game/managers/ShieldManager.ts**
   - Factory to create 4 shields at correct positions
   - Lifecycle management: init(), reset(), update()
   - Helper: getShieldSegmentAtPoint(x, y) for collision queries

3. **src/game/systems/RenderingSystem.ts** (extended)
   - drawShields(shields: Shield[]): void
   - drawSegment(segment: Segment): void
   - Opacity rendering using ctx.globalAlpha

4. **src/game/systems/PhysicsSystem.ts** (extended)
   - checkPlayerBulletShieldCollision(bullet, shields): CollisionResponse[]
   - checkEnemyBulletShieldCollision(bullet, shields): CollisionResponse[]
   - checkFormationShieldCollision(formation, shields): CollisionResponse[]
   - AABB helper: getSegmentAtPoint(x, y): Segment | null

5. **src/game/GameLoopManager.ts** (updated)
   - Initialize shields on wave start
   - Call shield.update() in game loop (optional animation logic)
   - Reset shields on new wave transition
   - Process shield collision responses in update step

6. **src/components/Game.tsx** (updated)
   - Add shields: Shield[] to gameLoopRef
   - Initialize shields on 'Playing' state entry
   - Reset shields on Victory → Playing transition

### Canvas Setup
- Shield rendering integrated into existing Canvas 2D context
- Opacity via ctx.globalAlpha (no additional assets required)
- Segment color: cyan or green (classic arcade style)

### Game Loop Behavior
- Shield collision checks run every frame (before rendering)
- Segment opacity updates applied immediately on damage
- Shield destruction persists until wave reset
- Formation contact triggers instant shield destruction (no health degradation)

## Success Criteria

✅ **Four shields render** — All 4 bunkers visible between player and formation at game start  
✅ **Shields positioned correctly** — Evenly distributed horizontally, above formation spawn point  
✅ **Segment matrix renders** — Each shield shows 4×4 grid of segments clearly  
✅ **Player bullet degrades segment** — Firing at shield segment reduces opacity and removes segment after 3 hits  
✅ **Enemy bullet degrades segment** — Enemy fire damages segments identically to player bullets  
✅ **Formation contact destroys shield** — If formation moves down to shield level, entire shield disappears instantly  
✅ **Opacity feedback visible** — Damage progression clearly shows via opacity changes (bright → dim → invisible)  
✅ **Segment removal works** — Fully degraded segments no longer render or block bullets  
✅ **Shields regenerate on new wave** — After Victory, all shields reset to intact state with full opacity  
✅ **Collision detection accurate** — Bullet-to-segment and formation-to-shield hits register correctly without false positives  
✅ **No rendering glitches** — Shields render smoothly without flicker or artifact overlap  
✅ **Performance maintained** — Shield rendering and collision checks do not reduce FPS below 55

## Observability Impact

### Console Logging (Development)
- Shield creation: `console.log('Shields initialized: 4 bunkers at y=150')`
- Damage event: `console.log('Shield ${shieldIndex} segment (${gridX},${gridY}) hit, opacity=${opacity}')`
- Shield destruction: `console.log('Shield ${shieldIndex} destroyed completely')`
- Wave reset: `console.log('Shields reset for wave ${waveNumber}')`

### React DevTools
- Watch shields array length in gameLoopRef
- Verify segment opacity values change on collision
- Track shield state across wave transitions

### Canvas Debug Overlay (Optional)
- Draw bounding boxes around shields (development mode)
- Display hit count per segment (optional)
- FPS counter to verify no performance regression

## Testing Strategy

### Unit Tests
- Shield constructor initializes 4×4 segment grid correctly
- Segment.takeDamage() increments hitCount and updates opacity
- Shield.isDestroyed() returns true only when all segments destroyed or alive = false
- ShieldManager creates 4 shields at correct positions

### Integration Tests
- Shields render at game start in Playing state
- Player bullet collision removes segment and bullet
- Enemy bullet collision removes segment (no bullet pooling collision here)
- Formation collision destroys entire shield instantly
- Shield reset() restores all segments to alive = true, opacity = 1.0
- Opacity visual feedback matches hit count (opacity ≥ 0.66 @ 1 hit, ≥ 0.33 @ 2 hits, 0 @ 3+ hits)

### Manual Testing
- Load game, start wave 1, verify 4 shields visible and evenly spaced
- Fire player bullets at shield segment, count hits until disappearance (should be 3)
- Verify enemy bullets damage shields identically
- Allow formation to descend to shield level, verify instant destruction
- Complete wave (enemy defeat), verify shields regenerate at Victory → Playing transition
- Check frame rate in DevTools: should maintain 55+ FPS with shields + bullets + formation on screen
- Visual inspection: shields degrade smoothly without flicker, opacity changes clearly visible

