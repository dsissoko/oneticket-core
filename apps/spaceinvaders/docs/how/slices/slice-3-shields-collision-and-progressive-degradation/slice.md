# Slice 3 — Shields, Collision, and Progressive Degradation

## Goal

Add four shields with durability, progressive visual degradation, and missile-destruction collision behavior for both player and alien fire.

## Related Epics

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-003 — Shield Durability and Missile Blocking](../../../what/epics/epic-0-mvp/user-stories/us-003-shield-durability-and-missile-blocking.md)

## Impacted Components

- Shield domain model
- `CollisionSystem`
- Canvas rendering layer for shield visuals

## Interfaces

- `GameEngine -> CollisionSystem`: player/alien missile vs shield collisions
- `CollisionSystem -> Renderer`: shield damage stage updates

## Data Changes

- Add exactly 4 shields with durability initialized to 10 each.
- Add shield damage-stage representation for visual degradation.

## Sequence Flow

1. Game start places 4 shields between cannon and alien wave.
2. Missile collides with shield.
3. Collision system destroys missile and decrements shield durability.
4. Renderer updates shield visual state to reflect degradation level.

## Observability Impact

- Log durability transitions in debug mode.
- Validate no negative durability and proper shield removal/empty state.
