<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

---
title: "Slice 2 — Player Cannon"
---

# Slice 2 — Player Cannon

## Goal

Implement player cannon rendering and input handling for both desktop (keyboard) and mobile (touch).

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-002 — Player Cannon & Controls](us-002-player-cannon-controls.md)

## Impacted Components

CannonRenderer, InputHandler (keyboard + touch).

## Interfaces

Keyboard events (arrow keys, space), touch events (swipe, tap), reload delay config.

## Data Changes

Cannon position (x coordinate), fire state (cooldown timer).

## Sequence Flow

1. Input detected → 2. InputHandler updates cannon position or fire state → 3. GameLoop renders cannon at new position → 4. If fire triggered, create player missile.

## Observability Impact

None.

## Related Architecture

- [Architecture](../../architecture.md)
- [Containers](../../c4/containers.md)