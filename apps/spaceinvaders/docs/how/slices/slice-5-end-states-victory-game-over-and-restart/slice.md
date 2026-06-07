# Slice 5 — End States: Victory, Game Over, and Restart

## Goal

Complete the gameplay loop with explicit victory/game-over transitions, final-score overlays, and restart behavior.

## Related Epics

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-004 — Game End States and Restart](../../../what/epics/epic-0-mvp/user-stories/us-004-game-end-states-and-restart.md)

## Impacted Components

- `GameEngine` phase-state machine
- `EndStateView`
- Restart bootstrap flow

## Interfaces

- `CollisionSystem -> GameEngine`: terminal-loss events
- `GameEngine -> EndStateView`: victory/game-over model + final score
- `EndStateView -> GameEngine`: restart command

## Data Changes

- Add explicit phase enum (`running`, `victory`, `gameOver`).
- Add end-state payload (`finalScore`, `reason`).

## Sequence Flow

1. While running, engine evaluates terminal conditions each tick.
2. On cannon hit or alien line breach, phase becomes `gameOver`.
3. On all aliens destroyed, phase becomes `victory`.
4. End-state overlay displays final score and restart action.
5. Restart resets runtime entities while preserving persisted best score.

## Observability Impact

- Log end-state transition reasons.
- Ensure restart fully reinitializes runtime without stale entities.
