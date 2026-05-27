# US-004 — Destroy Bricks on Ball Contact

## Story

As a player, I want each brick hit by the ball to disappear so that I can progress toward victory by clearing the brick wall.

## Expected Behavior

When the ball collides with a brick:
- The brick is immediately removed from the play area
- The brick destruction is visually reflected on screen
- The remaining brick count is updated and displayed
- The game continues normally after brick destruction

When all bricks are destroyed:
- The game detects the victory condition
- A victory message is displayed to the player
- The final game state (remaining lives, total bricks destroyed) is shown
- The player can choose to restart or quit

## Acceptance Criteria

```gherkin
Scenario: Ball destroys single brick
  Given the game contains a wall of intact bricks
  When the ball collides with a brick
  Then the brick disappears from the play area
  And the remaining brick counter decreases by 1
  And the game continues playing

Scenario: Score increases on brick destruction
  Given a brick is hit by the ball
  When the collision is detected
  Then the score increases
  And the updated score is displayed on screen

Scenario: Victory condition triggered
  When all bricks are destroyed
  Then the game displays "Victoire!"
  And the screen shows the final score
  And the game transitions to the end screen
  And the player can click "Restart" or "Quit"
```

## Related Slices

- Slice 4: Brick destruction and victory detection
- Slice 1: Ball physics and collision detection (dependency)
