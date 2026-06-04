# US-006 — Wave Progression and Scoring

## Story

As a player, I want waves to increase in difficulty and score to persist across waves so that I experience escalating challenge and can build a high score.

## Expected Behavior

### Victory Condition
- All enemies in formation are destroyed, triggering wave completion

### Wave Progression
- New wave starts automatically when all enemies destroyed
- Enemy speed increases per wave
- Enemy fire interval decreases per wave (more frequent projectiles)
- Lives reset to 3 for each new wave
- Score persists across all waves (accumulated)

### Game Over Condition
- Lives reach 0 (player loses all remaining lives)
- Enemy formation reaches the player's line (formation descends to player position)

### Game Over Display
- Final accumulated score is displayed
- Restart button is provided to begin new game

## Acceptance Criteria

```gherkin
Scenario: Player completes wave and new wave starts
Given the game is running with enemies in formation
When all enemies in the formation are destroyed
Then a new wave begins with increased enemy speed
And enemy fire interval is reduced
And lives are reset to 3
And the score is preserved

Scenario: Score persists across multiple waves
Given the player has a score of 500 points
When the current wave is completed
Then the next wave displays the accumulated score of 500+ new points
And the score continues to accumulate

Scenario: Game over when lives reach zero
Given the player has 1 life remaining
When the player loses that final life
Then the game ends
And final score is displayed
And a restart button is shown

Scenario: Game over when formation reaches player
Given the enemy formation is descending
When the formation reaches the player's line
Then the game ends
And final score is displayed
And a restart button is shown

Scenario: Player restarts after game over
Given the game is in game over state
When the player clicks the restart button
Then the game resets to wave 1
And lives are set to 3
And score is reset to 0
And the game resumes playable state
```

## Related Epic

[Epic 0 — MVP Space Invaders](epic.md)

## Related Slices

- [Slice 4 — Collision Detection and Scoring System](slice-4-collision-scoring/slice.md)
- [Slice 8 — Game States and Wave Progression](slice-8-game-states-progression/slice.md)
