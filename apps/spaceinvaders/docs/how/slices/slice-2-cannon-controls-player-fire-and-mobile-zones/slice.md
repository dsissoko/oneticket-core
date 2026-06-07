# Slice 2 — Cannon Controls, Player Fire, and Mobile Zones

## Goal

Implement cannon controls and firing across desktop and mobile, including configurable reload delay and gesture zone behavior.

## Related Epics

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Cannon Controls and Shooting](../../../what/epics/epic-0-mvp/user-stories/us-002-cannon-controls-and-shooting.md)
- [US-006 — Responsive Canvas and Mobile Gesture Zones](../../../what/epics/epic-0-mvp/user-stories/us-006-responsive-canvas-and-mobile-gesture-zones.md)

## Impacted Components

- `InputController`
- `GameEngine`
- Cannon projectile subsystem

## Interfaces

- `InputController -> GameEngine`: move left/right and fire intents
- `GameCanvas -> InputController`: touch tap/drag events with zone mapping

## Data Changes

- Add cannon horizontal position and bounds-clamped movement state.
- Add player missile collection (multi-shot support).
- Add reload delay config with [0ms, 5000ms] clamp.

## Sequence Flow

1. Desktop input maps `ArrowLeft/ArrowRight/Space` to movement/fire intents.
2. Mobile top 80% tap maps to fire intent.
3. Mobile bottom 20% horizontal drag maps to cannon movement intent.
4. Fire intent spawns upward missile when reload timer allows.

## Observability Impact

- Track rejected shots due to reload delay.
- Track input-source parity (keyboard vs touch) in debug mode.
