# Slice 3 — Enemy Formation Grid with Movement and Rendering

## Goal

Implement a fully functional 11×5 enemy formation grid with synchronized movement, speed scaling based on remaining enemies and wave progression, and multi-type visual rendering.

## Related Epics

[Epic 0 — MVP Complete Playable Space Invaders Game](epic-0-mvp/epic.md)

## Related User Stories

[US-002 — Enemy Formation](us-002-enemy-formation.md)

## Impacted Components

- **Formation.ts** — Grid state, movement direction, speed multipliers, fire tracking
- **Enemy.ts** — Individual enemy entity with type (top/middle/bottom), alive flag, grid and world coordinates
- **usePhysics** (physics engine) — Formation movement updates, boundary detection, step-down logic
- **useRenderer** (renderer) — Enemy rendering with 3 visual types, grid positioning
- **GameState** — Formation field and enemy arrays

## Interfaces

**Formation.ts**
```typescript
interface Formation {
  enemies: Enemy[][]; // 5 rows × 11 columns
  x: number; // world x position of formation top-left
  y: number; // world y position
  direction: 1 | -1; // 1 = moving right, -1 = moving left
  speed: number; // pixels per frame
  fireInterval: number; // milliseconds between fire events
  timeSinceLastFire: number; // elapsed time since last shot
  speedMultiplier: number; // 1.0 + (0.15 × (waveNumber - 1))
  fireRateMultiplier: number; // scaling factor applied to fireInterval
}
```

**Enemy.ts**
```typescript
interface Enemy {
  gridX: number; // column (0–10)
  gridY: number; // row (0–4)
  type: 'top' | 'middle' | 'bottom'; // determines points: 30, 20, 10
  alive: boolean; // false = destroyed, remains in array but skipped in render
  x: number; // world position (computed from grid + formation offset)
  y: number; // world position
  width: number; // fixed (e.g., 32 pixels)
  height: number; // fixed (e.g., 24 pixels)
}
```

## Data Changes

- **GameState.formation** — Added Formation object on wave start
- **Formation.enemies[][]** — 2D array initialized with 55 Enemy objects (5 rows, 11 columns)
- **Enemy.alive** — Set to false on destruction; true on spawn
- **Formation.x, Formation.y** — Updated each frame; determines all enemy world positions
- **Formation.direction** — Flips when formation reaches screen boundary

## Sequence Flow

### 1. Formation Spawn (Wave Start)
```
Wave starts
  ↓
Initialize Formation:
  - Create 5×11 grid of Enemy objects
  - Assign types: gridY 0–1 = 'top' (30 pts), 2–3 = 'middle' (20 pts), 4 = 'bottom' (10 pts)
  - Set Formation.x = centered on screen
  - Set Formation.y = top margin (e.g., 40 pixels)
  - Set Formation.direction = 1 (moving right)
  - Set Formation.speed = baseSpeed × speedMultiplier
  - All enemies: alive = true
```

### 2. Formation Movement (Every Frame)
```
Update Physics:
  ↓
For each column in Formation:
  - Update Formation.x by (Formation.speed × Formation.direction) pixels
  - Recompute all Enemy world positions: Enemy.x = Formation.x + (gridX × spacing)
  ↓
Check Boundary Collision:
  IF Formation.x <= leftBound OR Formation.x + width >= rightBound:
    - Step all enemies down by one row (Formation.y += rowHeight)
    - Flip Formation.direction
    - Clamp Formation.x to valid range
  ↓
Check Defeat Condition:
  IF Formation.y + height >= playerY:
    - Set game phase to GAME_OVER with reason "formation-reached"
```

### 3. Enemy Rendering (Every Frame)
```
Render Layer — Enemies:
  ↓
For each Enemy in Formation (row-major order):
  IF Enemy.alive == true:
    - Compute screen position (Formation.x + gridX offset, Formation.y + gridY offset)
    - Draw enemy visual based on Enemy.type:
      * 'top' (30 pts) — Visual style A (e.g., invader shape A)
      * 'middle' (20 pts) — Visual style B (e.g., invader shape B)
      * 'bottom' (10 pts) — Visual style C (e.g., invader shape C)
    - Use classic arcade colors (green or white on black background)
```

### 4. Speed Scaling with Destroyed Enemies (Optional Enhancement)
```
On Enemy destruction:
  - Count remaining alive enemies
  - If desired, apply bonus speed multiplier:
    speedBonus = 1.0 + (0.1 × (55 - aliveCount) / 55)
    effectiveSpeed = Formation.speed × speedBonus
    (Alternative: Keep speed constant; complexity in next iteration)
```

## Observability Impact

- **Debug Overlay:** Display Formation grid state, alive count, current speed multiplier, movement direction
- **Collision Feedback:** Log boundary collisions and step-down events (dev mode)
- **Performance:** Monitor enemy grid iteration cost; ensure <2 ms per frame for all 55 entities
- **Visual Feedback:** Distinct colors for each enemy type; confirm 3 types render correctly
