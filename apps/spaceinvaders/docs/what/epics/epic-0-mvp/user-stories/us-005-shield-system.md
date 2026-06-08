---
title: US-005 — Shield System
---

# US-005 — Shield System

## Story

As a player, I want destructible shields between me and the aliens, so that I have temporary protection from enemy fire.

## Expected Behavior

- 4 shields positioned between cannon and alien wave
- Shields absorb projectiles from both player and alien sides
- Progressive visual degradation on each impact
- Shield destroyed after 10 impacts

## Acceptance Criteria

- Given the game starts, then 4 shields are displayed between the cannon and alien wave
- Given a projectile hits a shield, then the shield shows visual degradation
- Given a shield receives 10 impacts, then it is completely destroyed and removed
- Given a projectile hits a shield, then the projectile is absorbed and does not pass through

## Related Epic

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related Slices

- [Slice 5 — Shield System](../../../how/slices/slice-5-shield-system/slice.md)
