---
title: 'US-002 — Red Ball Automatic Fire Jets'
---

# US-002 — Red Ball Automatic Fire Jets

## Story

As a player, I want to see the red ball automatically shoot fire jets in sprinkler-like patterns, so that there is a dynamic challenge to avoid.

## Expected Behavior

Red ball is positioned at top-center of the game screen. It rotates and shoots fire jets automatically toward the jungle terrain (bottom 20% of screen). Jets are not rectilinear — they spread like an automatic sprinkler with varying angles. Fire jet frequency is controlled by the speed selected on the start screen.

## Acceptance Criteria

- Given the game has started, When the red ball is active, Then it continuously shoots fire jets toward the jungle zone
- Given a fire jet is fired, When it reaches the jungle zone, Then it creates a hit zone on the terrain
- Given the speed slider was set to +2x, When the game runs, Then fire jets are emitted at double the normal frequency
- Given the speed slider was set to -2x, When the game runs, Then fire jets are emitted at half the normal frequency

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related Sprints

- [Sprint 1 — Jungle MVP](sprint-1-jungle-mvp/sprint.md)
