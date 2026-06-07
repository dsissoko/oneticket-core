---
title: 'Epic 0 — SpaceInvaders MVP Gameplay Loop'
---

# Epic 0 — SpaceInvaders MVP Gameplay Loop

## Goal

Deliver a complete and responsive Space Invaders MVP experience in AppShell, from gameplay start to win/lose and restart.

## Business Value

- Enables a playable first version of SpaceInvaders.
- Establishes a reusable game runtime pattern in the AppShell layout.
- Provides measurable replay value through persisted best score.

## Scope

- 5×11 alien wave with deterministic movement pattern and random enemy firing.
- Bottom cannon with desktop and mobile controls.
- Cannon and alien missiles with collision outcomes.
- Four degradable shields with shared impact handling.
- HUD (current score, best score persisted in localStorage).
- Victory and Game Over screens with final score and restart.
- Responsive layout behavior aligned with Breakout canvas-fill pattern.

## Related User Stories

- [US-001 — Alien Wave Movement and Fire](user-stories/us-001-alien-wave-movement-and-fire.md)
- [US-002 — Cannon Controls and Shooting](user-stories/us-002-cannon-controls-and-shooting.md)
- [US-003 — Shield Durability and Missile Blocking](user-stories/us-003-shield-durability-and-missile-blocking.md)
- [US-004 — Game End States and Restart](user-stories/us-004-game-end-states-and-restart.md)
- [US-005 — Score HUD and Best Score Persistence](user-stories/us-005-score-hud-and-best-score-persistence.md)
- [US-006 — Responsive Canvas and Mobile Gesture Zones](user-stories/us-006-responsive-canvas-and-mobile-gesture-zones.md)

## Related Slices

- [Slice 1 — Foundation Runtime and Responsive Canvas](../../../how/slices/slice-1-foundation-runtime-and-responsive-canvas/slice.md)
- [Slice 2 — Alien Wave and Cannon Controls](../../../how/slices/slice-2-alien-wave-and-cannon-controls/slice.md)
- [Slice 3 — Shields and Collision Outcomes](../../../how/slices/slice-3-shields-and-collision-outcomes/slice.md)
- [Slice 4 — Score, End States, and Restart](../../../how/slices/slice-4-score-end-states-and-restart/slice.md)
