---
title: 'US-004 — Animal Health and Scoring System'
---
# US-004 — Animal Health and Scoring System

## Story

As a player, I want animals to lose health when hit by fire jets and earn points when they reach safety, so that there are clear stakes and rewards.

## Expected Behavior

Each animal has a specific HP pool: Lion=20, Mouse=5, Girafe=15, Elephant=25. When a fire jet hits an animal, it loses 1 HP. When HP reaches 0, the animal disappears (failed). When an animal reaches the right edge of the screen, it is saved and the player earns points equal to the animal's remaining HP.

## Acceptance Criteria

- Given a Lion is active, When it is hit by a fire jet, Then it loses 1 HP (from 20 to 19)
- Given a Mouse has 1 HP remaining, When it is hit by a fire jet, Then it disappears from the screen
- Given an Elephant with 25 HP reaches the right edge with 18 HP remaining, Then the player earns 18 points
- Given an animal disappears or is saved, When the next animal in sequence appears, Then it starts on the left with full HP

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related Sprints

- [Sprint 1 — Jungle MVP](sprint-1-jungle-mvp/sprint.md)
