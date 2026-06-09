<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

---
title: Slice 4 — Combat System
---

# Slice 4 — Combat System

## Goal

Implement projectile rendering, collision detection, and scoring for player and alien missiles.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-004 — Projectile System](us-004-projectile-system.md)

## Impacted Components

ProjectileRenderer, CollisionDetector, ScoreManager.

## Interfaces

Player missile creation (upward velocity), alien missile creation (downward, random), collision events.

## Data Changes

Projectile arrays (position + velocity), score counter, alien alive status.

## Sequence Flow

1. Player fires → 2. Missile created with upward velocity → 3. Each frame, missiles move → 4. CollisionDetector checks missile vs alien/cannon → 5. On hit, remove alien/missile, update score → 6. Alien random fire creates downward missile.

## Observability Impact

None.

## Related Architecture

- [Architecture](../../architecture.md)
- [Containers](../../c4/containers.md)

## Tasks

- T4.1: Create ProjectileRenderer for missiles (upward and downward)
- T4.2: Implement player missile creation on fire event
- T4.3: Implement alien random fire (downward missiles from random positions)
- T4.4: Create CollisionDetector for missile-alien and missile-cannon collisions
- T4.5: Implement score increment on alien destruction
- T4.6: Remove off-screen projectiles from memory