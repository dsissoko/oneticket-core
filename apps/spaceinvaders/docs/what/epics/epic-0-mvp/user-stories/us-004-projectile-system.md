---
title: US-004 — Projectile System
---

# US-004 — Projectile System

## Story

As a player, I want to fire missiles at aliens and see them fire back, so that the game has interactive combat.

## Expected Behavior

- Player missiles travel upward from cannon position
- Alien missiles travel downward from random alien positions
- Collision detection between missiles and targets
- Each alien destroyed increments the score

## Acceptance Criteria

- Given I fire a missile, then it travels upward until it hits an alien or leaves the screen
- Given an alien fires, then a missile travels downward from a random alien position
- Given a player missile hits an alien, then the alien is removed and score increments
- Given an alien missile hits the cannon, then the player loses their life
- Given a missile leaves the screen bounds, then it is removed from memory

## Related Epic

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
