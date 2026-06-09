<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

---
title: "Slice 1 — Foundation"
---

# Slice 1 — Foundation

## Goal

Set up the React+Vite+TypeScript project with Canvas-based game loop, responsive sizing, and basic rendering infrastructure.

## Related Epics

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related User Stories

[US-001 — Game Canvas Setup](us-001-game-canvas-setup.md)

## Impacted Components

GameLoop, Canvas setup, responsive sizing logic.

## Interfaces

requestAnimationFrame driver, canvas ref management, viewport resize handler.

## Data Changes

None — infrastructure only.

## Sequence Flow

1. App mounts → 2. Canvas element created with flex-grow → 3. Resize handler calculates scale → 4. Game loop starts with requestAnimationFrame → 5. Empty frame renders.

## Observability Impact

Console log for game loop start/stop.

## Related Architecture

- [Architecture](../../architecture.md)
- [System Context](../../c4/system-context.md)
- [Containers](../../c4/containers.md)