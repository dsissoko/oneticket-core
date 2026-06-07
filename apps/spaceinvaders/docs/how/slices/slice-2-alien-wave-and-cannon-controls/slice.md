# Slice 2 — Alien Wave and Cannon Controls

## Goal

Implement the core play interaction: alien wave movement and random fire, plus cannon movement/shooting with reload constraints.

## Related Epics

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Alien Wave Movement and Fire](../../../what/epics/epic-0-mvp/user-stories/us-001-alien-wave-movement-and-fire.md)
- [US-002 — Cannon Controls and Shooting](../../../what/epics/epic-0-mvp/user-stories/us-002-cannon-controls-and-shooting.md)

## Impacted Components

- `AlienWaveSystem`
- `CannonSystem`
- `InputController`
- `GameEngine`
- `GameCanvas Renderer`

## Interfaces

- Alien wave contract: `createWave(5x11)`, `advanceWave()`, `spawnAlienMissile()`.
- Cannon contract: `moveCannon(x)`, `firePlayerMissile()`, `reloadDelayMs` bounded [0, 5000].
- Renderer contract: draw wave, cannon, and active missile sets each tick.

## Data Changes

- Add alien matrix state, wave direction/drop progression, and alien missile stream.
- Add cannon position, player missile list, and reload timing state.

## Sequence Flow

1. New run initializes 55 aliens (5x11) at ~70% viewport width.
2. Tick loop advances horizontal wave movement and performs row drop at boundaries.
3. Randomized alien firing emits downward missiles.
4. Player input moves cannon and triggers upward missile spawns.
5. Reload guard enforces configured bounds while allowing multi-missile concurrency.

## Observability Impact

- Debug counters for active missiles and wave step events.
- Validation logs for reload clamping to avoid invalid tuning values.
