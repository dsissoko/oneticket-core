# Slice 3 — Shields and Collision Outcomes

## Goal

Deliver collision outcomes with defensive gameplay: shield durability, missile destruction on impact, and progressive shield degradation rendering.

## Related Epics

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-003 — Shield Durability and Missile Blocking](../../../what/epics/epic-0-mvp/user-stories/us-003-shield-durability-and-missile-blocking.md)

## Impacted Components

- `CollisionSystem`
- `ShieldSystem`
- `GameEngine`
- `GameCanvas Renderer`

## Interfaces

- Collision interface: resolve missile vs shield/alien/cannon hits per tick.
- Shield interface: `applyShieldImpact(shieldId)` with max durability 10.
- Renderer interface: map durability levels to visual degradation states.

## Data Changes

- Introduce exactly 4 shield entities with durability counters.
- Extend collision outcome model with missile-destroy and damage events.

## Sequence Flow

1. Game initializes 4 shields between cannon and alien wave.
2. On missile/shield intersection, collision resolves in one tick.
3. Missile is removed immediately.
4. Shield durability decrements by 1 (min 0).
5. Renderer updates shield visual damage representation.

## Observability Impact

- Collision diagnostics (entity ids, collision type, outcome).
- Shield durability metrics for balancing and regression checks.
