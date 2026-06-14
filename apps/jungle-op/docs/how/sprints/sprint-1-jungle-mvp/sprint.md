---
title: 'Sprint 1 — Jungle MVP'
---
# Sprint 1 — Jungle MVP

Deliver a fully playable Opération Jungle MVP with start screen, red ball fire jets, animal movement, health/scoring, and animal sequence — all 5 user stories in a single sprint.

## Cross-references
- Epic: [epic-0-mvp](../../what/epics/epic-0-mvp/epic.md)
- us-001 — Game Start and Speed Configuration (pending)
- us-002 — Red Ball Automatic Fire Jets (pending)
- us-003 — Animal Movement Controls (pending)
- us-004 — Animal Health and Scoring System (pending)
- us-005 — Animal Sequence and Game Progression (pending)

---

## Technical Notes

### Game Loop — `requestAnimationFrame`
- Use a custom `useGameLoop` hook wrapping `requestAnimationFrame`.
- Each frame, compute `deltaTime` (ms since last frame) and dispatch `{ type: 'TICK', deltaTime }` to the reducer.
- Cancel the rAF loop on unmount or phase change to `'ended'`.
- Target 60fps (~16.67ms per frame); log deviations > 32ms for debugging.

### State Management — `useReducer`
- Single `GameState` object managed by `useReducer` — the only source of truth.
- Core shape: `{ phase, animals, fireJets, score, currentAnimalIndex, speedMultiplier, lastFireTime }`.
- Reducer actions: `START_GAME`, `MOVE_ANIMAL`, `TICK`, `SPAWN_FIRE_JET`, `ANIMAL_HIT`, `ANIMAL_SAVED`, `RESTART`.
- All game logic is pure — no side effects inside the reducer. Side effects (spawning, scoring) are derived from state transitions.

### Collision Detection — Bounding Box
- Axis-aligned bounding box (AABB) between each active `FireJet` and the current `Animal`.
- Each entity has `{ x, y, width, height }` in viewport-relative coordinates.
- Collision: `jet.x < animal.x + animal.w && jet.x + jet.w > animal.x && jet.y < animal.y + animal.h && jet.y + jet.h > animal.y`.
- On collision: decrement animal HP, mark fire jet `active: false`. If HP ≤ 0 → animal lost, advance to next.

### Input Handling — `useInput` Hook
- Keyboard: listen for `ArrowLeft` / `ArrowRight` on `keydown`/`keyup`, map to `'left'` | `'right'` | `'none'`.
- Touch: listen for `touchmove` on the game container — compare `touch.clientX` to container midpoint to determine direction.
- Normalize both inputs into a single `InputState` consumed by the game loop each tick.
- Debounce not needed — rAF naturally throttles to frame rate.

### Rendering — DOM Elements (V1)
- V1 uses DOM elements (styled `<div>`s) rather than Canvas for simplicity and Primer UI integration.
- Each entity (RedBall, FireJet, Animal, JungleTerrain) is a React component receiving position/size props from game state.
- Positioning via CSS `transform: translate(x, y)` for GPU-accelerated compositing — avoid `top`/`left` reflows.
- Re-evaluate Canvas for V2 if DOM rendering becomes a bottleneck (> 20 entities on screen).

### Responsive Layout — Bottom 20% Jungle Zone
- Jungle terrain occupies `height: 20vh` anchored to the viewport bottom.
- Animal `y` position is fixed within this zone; only `x` changes (left-to-right traversal).
- Fire jets target the top edge of the jungle zone as their landing Y coordinate.
- Use CSS `vh` units and `calc()` for all positional math — no hardcoded pixel values.
- Minimum viewport: 320px width; ensure animal and fire jet sizes scale proportionally.

### Fire Jet Trajectory — Sprinkler Pattern
- Jets spawn from RedBall position `(viewportWidth / 2, 0)` at intervals of `baseInterval / speedMultiplier`.
- Each jet receives a randomized spawn angle within ±30° from vertical.
- Velocity calculation:
  - `vx = speed * sin(angle)` — horizontal spread
  - `vy = speed * cos(angle)` — downward velocity
  - Each frame: `x += vx * deltaTime / 16.67`, `y += vy * deltaTime / 16.67`
- Optional gravity: `vy += 0.02 * deltaTime / 16.67` per frame for natural arc feel.
- Jet is deactivated (`active: false`) when `y` exceeds jungle terrain top edge or goes off-screen.

### Animal Data Model
```typescript
interface Animal {
  type: 'lion' | 'mouse' | 'girafe' | 'elephant';
  name: string;       // display name
  hp: number;         // current HP
  maxHp: number;      // max HP (lion=20, mouse=5, girafe=15, elephant=25)
  x: number;          // horizontal position (0 = left edge of jungle zone)
  y: number;          // fixed vertical position within bottom 20% zone
  speed: number;      // pixels per second, left-to-right traversal
}
```
- Static animal definitions as a `const ANIMAL_DEFS` map loaded at build time.
- `currentAnimalIndex` tracks which animal is active; next animal spawns when current is saved or lost.

### Speed Multiplier Application
- Slider range: `-2` to `+2` maps to multiplier `0.5x` to `2.5x`.
- Affects:
  - **Fire jet interval**: `effectiveInterval = baseInterval / speedMultiplier` (higher multiplier = faster fire rate).
  - **Fire jet velocity**: `effectiveSpeed = baseSpeed * speedMultiplier`.
  - **Animal traversal speed**: `effectiveSpeed = baseAnimalSpeed * speedMultiplier`.
- Applied once at `START_GAME` and stored in `GameState.speedMultiplier`.
