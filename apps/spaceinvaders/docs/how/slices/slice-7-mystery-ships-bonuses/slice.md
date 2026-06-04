# Slice 7 — Mystery Ships Bonuses

## Goal

Implement mystery ship mechanics including periodic spawning with horizontal movement, random point value selection (50/100/150/300), and collision detection with player projectiles that triggers destruction and score rewards.

## Related Epics

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related User Stories

[US-005 — Enemy Fire and Mystery Ships](us-005-enemy-fire-mystery-ships.md)

## Impacted Components

- **MysteryShip.ts** — Entity definition and state management
- **Physics & Collision Engine** — Projectile–MysteryShip collision detection
- **Game Loop** — Mystery ship spawn timing and lifecycle
- **Renderer** — Mystery ship visual rendering

## Interfaces

### MysteryShip Entity
```typescript
interface MysteryShip {
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  points: 50 | 100 | 150 | 300;
  active: boolean;
}
```

### GameState Extension
```typescript
interface GameState {
  mysteryShip: MysteryShip | null;
  // ... existing fields
}
```

### Collision Event
```typescript
interface CollisionEvent {
  projectile: Projectile;
  target: MysteryShip;
  resolve: (state: GameState) => GameState;
}
```

## Data Changes

- **Mystery Ship Active State:** Added to `GameState.mysteryShip` (null when inactive)
- **Spawn Timer:** Track elapsed time to trigger periodic spawning
- **Point Values:** Store assigned random points in `MysteryShip.points` field
- **Score Integration:** Collision resolution increments `GameState.score` by mystery ship point value

## Sequence Flow

```
[Game Loop Tick]
  ├─ Check Mystery Ship Spawn Timer
  │  └─ If elapsedTime % spawnInterval == 0
  │     ├─ Randomize point value (50/100/150/300)
  │     └─ Spawn MysteryShip at top-left, moving right
  │
  ├─ Update Mystery Ship Position
  │  └─ Apply horizontal velocity
  │     └─ If x > screenWidth, destroy and set to null
  │
  ├─ Collision Detection: Projectile vs Mystery Ship
  │  └─ If collision detected
  │     ├─ Remove player projectile
  │     ├─ Destroy mystery ship
  │     └─ Add points to score
  │
  └─ Render Mystery Ship (if active)
     └─ Draw sprite at (x, y)
```

## Observability Impact

- **Score Events:** Log score award on mystery ship destruction for analytics
- **Spawn Events:** Track mystery ship spawn frequency and point distribution
- **Performance:** Monitor entity count when mystery ship active
- **Debug Overlay:** Display mystery ship bounding box and point value in dev mode
