---
title: 'US-001 — Game Start and Speed Configuration'
---

# US-001 — Game Start and Speed Configuration

## Story

As a player, I want to adjust the red ball speed on the start screen, so that I can control the game difficulty.

## Expected Behavior

Start screen shows a slider ranging from -2x (slower than normal) to +2x (faster than normal) with normal speed as default. Player adjusts slider and clicks 'Start' to begin the game. The selected speed is applied to the red ball's fire jet frequency.

## Acceptance Criteria

- Given I am on the start screen, When I see the speed slider, Then it defaults to normal speed
- Given I am on the start screen, When I move the slider to -2x, Then the red ball fires at half the normal rate
- Given I am on the start screen, When I move the slider to +2x, Then the red ball fires at double the normal rate
- Given I have set a speed, When I click Start, Then the game begins with the selected speed

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related Sprints

- [Sprint 1 — Jungle MVP](sprint-1-jungle-mvp/sprint.md)
