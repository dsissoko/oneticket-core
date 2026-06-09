<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

# Slice 2 — Physics (Collision & Rebounds)

## Goal

Implement AABB collision detection and physics resolution for ball interactions with game obstacles (walls, ceiling, paddle, and bricks), enabling realistic bouncing and brick destruction mechanics.

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related User Stories

[US-002 — Implement Collision Detection and Brick Destruction](us-002-collision-detection.md)

## Impacted Components

- `app/utils/collision.ts` — AABB collision detection and resolution functions
- `app/components/GameCanvas.tsx` — Game loop physics update phase; collision checks and velocity resolution
- Game state object — Ball velocity reversals; brick alive flag updates

## Interfaces

**Input:**
- Ball position (x, y) and velocity (vx, vy) per frame
- Paddle bounding box from paddle state
- Brick bounding boxes from bricks array
- Canvas walls (implicit from canvas dimensions)

**Output:**
- Updated ball velocity after collision resolution
- Marked bricks for removal (alive = false)
- Ball position constrained to canvas bounds

## Data Changes

### Collision Detection Module (`app/utils/collision.ts`)

Pure functions:
- `checkAABB(rect1: Rect, rect2: Rect): boolean` — Detects overlap between two axis-aligned rectangles
- `checkCircleAABB(ball: Ball, rect: Rect): boolean` — Detects overlap between ball (circle) and rectangle
- `resolveBallCollision(ball: Ball, obstacle: Rect): { vx: number, vy: number }` — Determines which velocity component(s) to reverse on collision

### Game State Updates in GameCanvas Loop

1. **Ball Physics Update:**
   - `ball.x += ball.vx * deltaTime / 1000`
   - `ball.y += ball.vy * deltaTime / 1000`

2. **Collision Detection Phase (each frame):**
   - Check ball vs. left/right walls → reverse vx if collision
   - Check ball vs. top/ceiling → reverse vy if collision
   - Check ball vs. paddle → reverse vy if collision
   - Check ball vs. each brick → reverse appropriate velocity component and mark brick `alive = false`

3. **Brick Cleanup:**
   - Filter bricks array to remove entries with `alive = false`

## Sequence Flow

```
Frame Loop:
  1. Input Phase (mouse position, slider)
  2. Physics Update
     2a. Update ball position: x += vx * dt, y += vy * dt
     2b. Clamp ball position to canvas bounds (no pass-through)
  3. Collision Detection
     3a. Check walls (left, right, top) → resolve vx or vy
     3b. Check paddle (bottom area) → resolve vy
     3c. Check all bricks → resolve velocity and mark brick for removal
  4. State Updates
     4a. Apply velocity reversals
     4b. Remove destroyed bricks
  5. Render phase
  6. Check win/loss conditions
```

## Observability Impact

- Console logging for collision event count per frame (debug mode)
- Visual debug overlay option: draw bounding boxes for ball, paddle, bricks, and walls
- Frame count and delta time logging to detect physics drift