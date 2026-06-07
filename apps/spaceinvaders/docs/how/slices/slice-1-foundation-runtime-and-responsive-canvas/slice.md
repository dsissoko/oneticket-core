# Slice 1 — Foundation Runtime and Responsive Canvas

## Goal

Establish the walking skeleton for SpaceInvaders: AppShell integration, full-area responsive canvas, phase-aware runtime loop, and shared input/render wiring.

## Related Epics

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-006 — Responsive Canvas and Mobile Gesture Zones](../../../what/epics/epic-0-mvp/user-stories/us-006-responsive-canvas-and-mobile-gesture-zones.md)

## Impacted Components

- `GameScreen`
- `GameCanvas`
- `GameEngine` (phase state machine + loop)
- `InputController` (desktop/mobile event boundaries)

## Interfaces

- AppShell route mount/unmount lifecycle.
- Canvas host contract: parent-sized rendering surface.
- Input intent contract: `move(deltaX)` and `fire()`.

## Data Changes

- In-memory initial game state envelope (`running`, `victory`, `gameOver`).
- Responsive dimensions derived from `parentElement.clientWidth/Height`.

## Sequence Flow

1. AppShell route renders `GameScreen` and mounts `GameCanvas`.
2. `GameCanvas` computes logical dimensions from parent size and subscribes to resize.
3. `InputController` binds keyboard and touch zones (80% fire / 20% movement).
4. `GameEngine` starts tick loop and publishes frame state for rendering.

## Observability Impact

- Log startup/runtime errors to existing frontend logger.
- Optional non-user-facing timing debug (tick duration / dropped frame counters).
