---
title: 'US-003 — Animal Movement Controls'
---

# US-003 — Animal Movement Controls

## Story

As a player, I want to move animals left and right across the jungle terrain, so that I can dodge fire jets and guide them to safety.

## Expected Behavior

The currently active animal appears on the left side of the jungle zone (bottom 20% of screen). Player moves it horizontally using left/right arrow keys on desktop, or by touch drag on mobile. The animal can move both forward (right) and backward (left) to avoid incoming fire jets.

## Acceptance Criteria

- Given an animal is active on the left, When I press the right arrow key, Then the animal moves right across the jungle zone
- Given an animal is active, When I press the left arrow key, Then the animal moves left (can retreat)
- Given I am on a touch device, When I drag my finger in the jungle zone, Then the animal follows my horizontal movement
- Given an animal is at the left edge, When I try to move left, Then the animal stops at the screen boundary

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related Sprints

<!-- @po fills this section after producing sprints — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Sprint 1 — Skeleton Foundation](sprint-1/sprint.md) -->
