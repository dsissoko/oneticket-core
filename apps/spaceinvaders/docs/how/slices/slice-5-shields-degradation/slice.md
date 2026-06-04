# Slice 5 — Shields Degradation

## Goal

Implement four destructible shield bunkers positioned between the enemy formation and player cannon, with segment-based destruction matrices that degrade progressively through player fire, enemy fire, and formation contact, updating visual state and collision detection in real-time as segments are destroyed.

## Related Epics

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related User Stories

[US-004 — Shields and Collisions](us-004-shields-collisions.md)

## Impacted Components

### Data Model: Shield Entities
- **Shield.ts:** Core shield/bunker data structure with segment grid lifecycle
  - `x, y`: Bunker position on canvas
  - `segments: SegmentGrid`: 4×4 grid of destructible segments
  - `totalSegmentsDestroyed: number`: Track damage accumulation for visual feedback

### Entity Management: Shield System
- **Shield Lifecycle:** Initialize 4 bunkers at game start; persist through waves; reset on new game
- **Segment State:** Each segment tracks `destroyed: boolean`; destroyed segments skip rendering and collision tests

### Physics & Collision: Projectile-Shield Detection
- **Player Projectile → Shield:** Detect hit on segment; destroy segment immediately; remove projectile
- **Enemy Projectile → Shield:** Detect hit on segment; destroy segment immediately; remove projectile
- **Formation Contact → Shield:** When enemy formation moves down to bunker Y-range, test enemy bounding boxes against segment grid; destroy contacted segments

### Renderer: Shield Visualization
- **Segment Rendering:** Draw only non-destroyed segments (opacity fade or removal pattern for visual degradation)
- **Visual Degradation:** Optionally render burn marks or darkening as segments take damage
- **HUD:** No visible HUD change; bunker visuals are self-explanatory

### Game State Updates
- **Collision Response:** Update GameState with destroyed shields on each collision; return updated state
- **Persistence:** Shield state (segments) persists within a wave; resets to full health on new wave

## Interfaces

### Shield Data Structure
```typescript
interface Shield {
  id: number; // 0–3 for 4 bunkers
  x: number; // left edge of bunker
  y: number; // top edge
  width: number; // total bunker width
  height: number; // total bunker height
  segments: SegmentGrid; // 4×4 grid
}

interface SegmentGrid {
  grid: Segment[][]; // 4 rows × 4 columns
  segmentWidth: number; // width of single segment
  segmentHeight: number; // height of single segment
}

interface Segment {
  gridX: number; // column 0–3
  gridY: number; // row 0–3
  destroyed: boolean;
  x: number; // world position (computed)
  y: number; // world position (computed)
}
```

### Collision Detection Interface
```typescript
interface ShieldCollision {
  type: 'projectile-shield' | 'formation-shield';
  projectile?: Projectile;
  enemies?: Enemy[];
  segment: Segment;
  shield: Shield;
  resolve(state: GameState): GameState;
}
```

### Physics Query
```typescript
// Detect collision between projectile and shield segments
detectProjectileShieldCollision(
  projectile: Projectile,
  shield: Shield
): Segment | null;

// Detect collision between formation and bunker
detectFormationShieldCollision(
  enemies: Enemy[],
  shield: Shield
): Segment[];

// Destroy segment and update state
destroySegment(
  state: GameState,
  shield: Shield,
  segment: Segment,
  projectile?: Projectile
): GameState;
```

## Data Changes

### Shield Initialization (Game Start)
```typescript
const shields: Shield[] = [
  { id: 0, x: 80, y: 320, segments: createSegmentGrid(), ... },
  { id: 1, x: 280, y: 320, segments: createSegmentGrid(), ... },
  { id: 2, x: 480, y: 320, segments: createSegmentGrid(), ... },
  { id: 3, x: 680, y: 320, segments: createSegmentGrid(), ... },
];
```

### Wave Reset
- All shields reset to full health (all segments `destroyed: false`)
- Shield positions remain fixed across waves
- No shield persistence between waves (classic arcade behavior)

### Segment Destruction
- Single impact destroys segment; sets `destroyed: true`
- Removes projectile from active list
- Updates GameState with modified shield
- No re-spawn of destroyed segments during wave

## Sequence Flow

### Player Fires at Shield Segment
1. Player fires projectile (spawned at cannon position)
2. Projectile moves upward each frame
3. Physics engine tests projectile against all shield segments
4. On hit: Segment marked `destroyed: true`, projectile removed
5. Renderer skips drawing destroyed segment
6. Next frame: Segment no longer participates in collision tests

### Enemy Formation Advances and Contacts Shield
1. Formation moves down on frame N (every X frames)
2. Physics engine tests enemy bounding boxes against all shield segments
3. For each enemy that overlaps a segment: Mark segment `destroyed: true`
4. Formation continues downward
5. Destroyed segments no longer block formation

### Enemy Fires at Shield
1. Random enemy in formation fires projectile
2. Enemy projectile moves downward each frame
3. Physics engine tests projectile against all shield segments
4. On hit: Segment marked `destroyed: true`, projectile removed
5. Segment removed from next render and collision pass

## Observability Impact

### Debug Visualization (Dev Mode)
- Overlay segment grid with coordinates (gridX, gridY)
- Show bounding boxes for all segments
- Highlight active (non-destroyed) segments in green; destroyed in gray

### Collision Logging
- Console log on segment destruction: `Shield ${shieldId} Segment (${gridX}, ${gridY}) destroyed by ${projectileOwner}`
- Track total segment destruction count per wave for gameplay analysis

### Performance Monitoring
- Monitor collision check count per frame (AABB tests)
- Track segment state changes (should be < 10 per frame in typical play)
- Profile rendering time for shield segments (should be < 1 ms per frame)

### Optional Metrics
- Segment survival rate per wave (feedback for difficulty tuning)
- Average bunker health at wave end (tracks player defense effectiveness)
