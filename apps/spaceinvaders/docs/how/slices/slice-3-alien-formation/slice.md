<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

---
title: "Slice 3 — Alien Formation"
---

# Slice 3 — Alien Formation

## Goal

Implement the 5x11 alien grid with left/right movement, boundary detection, and row-drop behavior.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-003 — Alien Wave Formation](us-003-alien-wave-formation.md)

## Impacted Components

AlienWaveRenderer, AlienMovement logic.

## Interfaces

Alien grid data structure (5 rows x 11 columns), movement direction, speed.

## Data Changes

Alien positions array, alive/dead status per alien, movement direction flag.

## Sequence Flow

1. Game starts → 2. Alien grid initialized (55 aliens) → 3. Each frame, wave moves left/right → 4. On boundary hit, drop one row and reverse direction → 5. Render alive aliens.

## Observability Impact

None.

## Related Architecture

- [Architecture](../../architecture.md)
- [Containers](../../c4/containers.md)