# US-003 — Implement Lives System and Game Over Detection

## Goal

Manage player lives and detect game over/victory conditions with proper state transitions.

## Acceptance Criteria

- Game starts with exactly 3 lives
- Lives display is visible to the player
- When ball passes below paddle, one life is lost
- Ball resets to paddle center after life loss
- Game transitions to Game Over state when lives reach 0
- Game transitions to Victory state when all bricks are destroyed
- Game Over and Victory states prevent further gameplay
- Players can restart game from terminal state
- UI clearly displays current game state (Playing, Game Over, Victory)

## Business Value

Lives and game state management create meaningful progression and challenge. Clear feedback on game status and restart capability enable players to understand their progress and continue playing.

## Related Slices

[Slice 3 — Game States & Lives](../../../how/slices/slice-3-game-states/slice.md)
