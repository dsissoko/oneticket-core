<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

---
title: Slice 6 — Game Flow
---

# Slice 6 — Game Flow

## Goal

Implement game state machine, HUD rendering, end screens, and localStorage best score persistence.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-006 — Game States & Scoring](us-006-game-states-scoring.md)

## Impacted Components

GameState (state machine), HUDRenderer, StorageManager.

## Interfaces

State transitions (menu→playing→gameover/victory→restart), score display, best score load/save.

## Data Changes

Game state enum, current score, best score (localStorage).

## Sequence Flow

1. App loads → 2. Menu state displayed → 3. Player starts → 4. Playing state with HUD (score top-left, best score top-right) → 5. Cannon hit → Game Over state → 6. All aliens destroyed → Victory state → 7. Save best score to localStorage → 8. Restart returns to menu.

## Observability Impact

None.

## Related Architecture

- [Architecture](../../architecture.md)
- [Containers](../../c4/containers.md)

## Tasks

- T6.1: Implement GameState state machine (menu/playing/gameover/victory)
- T6.2: Create HUDRenderer for current score (top-left) and best score (top-right)
- T6.3: Implement Game Over screen rendering on canvas
- T6.4: Implement Victory screen rendering on canvas
- T6.5: Create StorageManager for localStorage best score read/write
- T6.6: Implement restart flow (game over/victory → menu)