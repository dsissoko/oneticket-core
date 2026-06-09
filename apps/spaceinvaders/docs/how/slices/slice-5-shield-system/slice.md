<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

---
title: Slice 5 — Shield System
---

# Slice 5 — Shield System

## Goal

Implement 4 destructible shields with progressive visual degradation and collision absorption.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-005 — Shield System](us-005-shield-system.md)

## Impacted Components

ShieldRenderer, Shield collision logic.

## Interfaces

Shield health (0-10 impacts), visual degradation states, collision absorption.

## Data Changes

Shield health counters, visual state per shield.

## Sequence Flow

1. Game starts → 2. 4 shields rendered between cannon and aliens → 3. Projectile hits shield → 4. Health decrements, visual degradation → 5. At 10 impacts, shield destroyed and removed → 6. Absorbed projectile does not pass through.

## Observability Impact

None.

## Related Architecture

- [Architecture](../../architecture.md)
- [Containers](../../c4/containers.md)

## Tasks

- T5.1: Define shield data structure (position, health 0-10, visual state)
- T5.2: Create ShieldRenderer with progressive degradation visuals
- T5.3: Implement shield-projectile collision detection (both sides)
- T5.4: Implement health decrement and visual degradation on impact
- T5.5: Implement shield destruction at 10 impacts
- T5.6: Ensure absorbed projectiles are removed and do not pass through