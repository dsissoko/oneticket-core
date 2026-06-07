# Slice 4 — Score HUD and Best Score Persistence

## Goal

Implement score feedback through HUD and localStorage-backed best score persistence across sessions.

## Related Epics

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-005 — Score HUD and Best Score Persistence](../../../what/epics/epic-0-mvp/user-stories/us-005-score-hud-and-best-score-persistence.md)

## Impacted Components

- `ScoreService`
- HUD rendering layer
- localStorage adapter

## Interfaces

- `GameEngine -> ScoreService`: alien-destroyed score events
- `ScoreService -> HUD`: current score and best score projections
- `ScoreService -> localStorage`: persisted best score updates

## Data Changes

- Add `currentScore` runtime state.
- Add `bestScore` read/write in localStorage.

## Sequence Flow

1. Game start loads `bestScore` from localStorage.
2. Alien destruction triggers score increment event.
3. HUD renders current score (top-left) and best score (top-right).
4. End-of-run updates `bestScore` when current score exceeds stored value.

## Observability Impact

- Add defensive handling for unavailable/invalid localStorage values.
- Track score update and best-score write events in debug mode.
