# Slice 4 — Score, End States, and Restart

## Goal

Complete the gameplay loop with score HUD, best-score persistence, win/lose transitions, final score display, and restart behavior.

## Related Epics

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-004 — Game End States and Restart](../../../what/epics/epic-0-mvp/user-stories/us-004-game-end-states-and-restart.md)
- [US-005 — Score HUD and Best Score Persistence](../../../what/epics/epic-0-mvp/user-stories/us-005-score-hud-and-best-score-persistence.md)

## Impacted Components

- `ScoreService`
- `GameEngine`
- `EndStateView` / `EndStatePresenter`
- `GameCanvas Renderer`
- localStorage adapter

## Interfaces

- Score events: alien destroyed → score increment.
- Persistence contract: `getBestScore()` / `setBestScore(score)`.
- Phase transitions: `running -> victory|gameOver -> running (restart)`.

## Data Changes

- Add `currentScore`, `bestScore`, `finalScore`, and `phase` transition payload.
- Persist `bestScore` in localStorage when surpassed.

## Sequence Flow

1. While running, HUD displays current score (top-left) and best score (top-right).
2. On scoring events, `ScoreService` updates current score and conditionally updates localStorage.
3. On lose/win trigger, `GameEngine` transitions to `gameOver` or `victory`.
4. End screen presents final score and restart action.
5. Restart reinitializes runtime state while keeping persisted best score.

## Observability Impact

- Track phase transition events and reasons (cannon hit, alien line reached, all aliens destroyed).
- Log best-score write operations for persistence troubleshooting.
