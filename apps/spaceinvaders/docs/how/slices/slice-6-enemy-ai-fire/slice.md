# Slice 6 — Enemy AI Fire

## Goal

Implement enemy formation firing AI with random column selection, projectile spawning logic, and trajectory simulation. Enforce a maximum of 3 concurrent enemy projectiles on screen while maintaining 60 FPS performance.

## Related Epics

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related User Stories

[US-005 — Enemy Fire and Mystery Ships](us-005-enemy-fire-mystery-ships.md)

## Impacted Components

- **Formation.ts** — Add firing logic and fire rate timing
- **Enemy.ts** — Track which enemies can fire (bottom of columns)
- **Projectile.ts** — Extend for enemy projectile tracking
- **GameState** — Track enemy projectile count and enforce 3-projectile limit
- **Physics Engine** — Update projectile positions and trajectory
- **Game Loop** — Trigger formation firing, update enemy projectiles, clean up destroyed projectiles

## Interfaces

### Formation Firing Interface
```typescript
interface Formation {
  enemies: Enemy[][];
  fireInterval: number; // milliseconds between fire opportunities
  timeSinceLastFire: number; // accumulates each frame
  fireRateMultiplier: number; // scales with wave difficulty
}

// Method to select and fire
selectAndFireEnemy(state: GameState): Projectile | null;
```

### Enemy Projectile Interface
```typescript
interface Projectile {
  x: number;
  y: number;
  vx: number; // horizontal velocity (0 for downward fire)
  vy: number; // vertical velocity (downward = positive)
  width: number;
  height: number;
  owner: 'player' | 'enemy';
  active: boolean;
}
```

### Fire Selection Logic
```typescript
interface FireSelectionAlgorithm {
  selectRandomColumn(): number; // 0–10 (column indices)
  getBottomAliveEnemyInColumn(column: number): Enemy | null;
  canFire(projectileCount: number): boolean; // true if < 3
}
```

## Data Changes

### GameState Extension
```typescript
interface GameState {
  // ... existing fields ...
  enemyProjectiles: Projectile[]; // Track all active enemy projectiles
  projectileCountLimit: number; // Always 3
}
```

### Formation State Update
```typescript
interface Formation {
  // ... existing fields ...
  lastFireTime: number; // timestamp of last fire event
  pendingFires: Array<{ column: number; enemy: Enemy }>; // queued fires if limit reached
}
```

## Sequence Flow

1. **Fire Timing Check** — Each frame, check if `timeSinceLastFire >= fireInterval`
   - fireInterval defaults to 1000 ms at wave 1
   - Decreases with `fireRateMultiplier` as wave increases

2. **Random Column Selection** — If timing allows:
   - Select random column (0–10)
   - Find bottom-most alive enemy in that column
   - If no enemy found, retry up to 2 more random columns

3. **Projectile Spawn** — If enemy found:
   - Check current enemy projectile count
   - If count < 3, spawn projectile at enemy's position
   - Projectile.vy = +4 pixels/frame (downward)
   - Reset `timeSinceLastFire` to 0

4. **Projectile Update** — Each frame:
   - Apply velocity to position: `y += vy * deltaTime`
   - Mark as inactive if `y > canvasHeight`
   - Remove from `enemyProjectiles` array

5. **Collision Handling** — Resolve collisions:
   - Enemy projectile vs Player: Damage or destroy player
   - Enemy projectile vs Shield segment: Degrade segment
   - Enemy projectile vs bottom boundary: Remove projectile

6. **State Cleanup** — Each frame:
   - Filter out inactive projectiles from `enemyProjectiles`
   - Update HUD if needed (projectile count debug display)

## Observability Impact

- **Performance Metric:** Enemy projectile spawn rate (should match fireInterval timing)
- **Debug Display:** Show active enemy projectile count (target ≤ 3)
- **Collision Logging:** Log when enemy projectile hits player or shield
- **Frame Budget Impact:** Enemy firing adds <1 ms per frame (minimal)

