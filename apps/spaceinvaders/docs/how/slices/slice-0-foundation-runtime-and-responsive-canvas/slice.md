# Slice 0 — Foundation Runtime and Responsive Canvas

## Goal

Establish the walking skeleton for SpaceInvaders in AppShell: full-area responsive canvas integration, game bootstrap lifecycle, and resize-safe logical dimensions.

## Related Epics

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-006 — Responsive Canvas and Mobile Gesture Zones](../../../what/epics/epic-0-mvp/user-stories/us-006-responsive-canvas-and-mobile-gesture-zones.md)

## Impacted Components

- `GameScreen`
- `GameCanvas`
- Game bootstrap wiring in AppShell route

## Interfaces

- `GameScreen -> GameCanvas`: layout container ownership
- `GameCanvas -> GameEngine`: canvas dimensions and resize updates

## Data Changes

- Introduce runtime logical dimensions derived from `parentElement.clientWidth/clientHeight`
- No persistence changes in this slice

## Sequence Flow

1. AppShell renders `GameScreen` with full-height wrapper.
2. `GameCanvas` mounts with CSS `width: 100%` and `height: 100%`.
3. Canvas reads parent dimensions and initializes logical game size.
4. Resize listener updates logical dimensions while preserving gameplay proportions.

## Observability Impact

- Add minimal logs/guards for canvas init and resize failures.
- Validate no runtime crashes on route mount/unmount.
