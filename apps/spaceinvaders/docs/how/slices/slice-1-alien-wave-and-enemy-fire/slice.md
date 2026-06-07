# Slice 1 — Alien Wave and Enemy Fire

## Goal

Deliver the core enemy behavior: 5×11 alien grid initialization, sweep/drop movement pattern, and random downward missile fire.

## Related Epics

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Alien Wave Movement and Fire](../../../what/epics/epic-0-mvp/user-stories/us-001-alien-wave-movement-and-fire.md)

## Impacted Components

- `GameEngine`
- Alien wave domain model
- Enemy missile spawn subsystem

## Interfaces

- `GameEngine -> Renderer`: alien matrix/frame state
- `GameEngine -> Missile subsystem`: random fire events

## Data Changes

- Add alien matrix state for 5 rows × 11 columns.
- Add wave direction, edge detection, and row-drop progression state.
- Add enemy missile collection state.

## Sequence Flow

1. Game start initializes 55 aliens in a 5×11 grid at ~70% playfield width.
2. Tick loop moves wave horizontally until boundary.
3. On boundary, wave drops one row and reverses direction.
4. Random fire timer emits downward missile from eligible alien.

## Observability Impact

- Add debug counters for active aliens and enemy missiles.
- Optional trace hooks for movement phase transitions.
