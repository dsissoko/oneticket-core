---
title: "US-003 — Alien Wave Formation"
---

# US-003 — Alien Wave Formation

## Story

As a player, I want to see a formation of aliens that moves across the screen, so that I have targets to shoot at.

## Expected Behavior

- Alien wave: 5 rows × 11 columns, single sprite type
- Wave moves left/right continuously
- On boundary hit, wave drops one row down
- Aliens rendered via Canvas API

## Acceptance Criteria

- Given the game starts, then 55 aliens are displayed in a 5x11 grid
- Given the wave reaches the left or right boundary, then it drops one row and reverses direction
- Given all aliens in a row are destroyed, then the remaining aliens continue movement
- Given all aliens are destroyed, then the victory screen is shown

## Related Epic

[Epic 0 — MVP Space Invaders](epic-0-mvp/epic.md)

## Related Slices

- [Slice 3 — Alien Formation](../../../how/slices/slice-3-alien-formation/slice.md)
