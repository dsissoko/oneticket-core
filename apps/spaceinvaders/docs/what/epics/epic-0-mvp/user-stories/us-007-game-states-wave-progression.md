# US-007 — Game States & Wave Progression

## Story

As a player, I want clear game states (Start, Playing, Victory, Game Over) and progressive wave difficulty so that I understand the game flow and feel increasing challenge.

## Expected Behavior

### Game States
- **Start**: Start screen displayed with title and start button; ready to begin
- **Playing**: Game loop running; player controls cannon, enemies fire, collisions occur
- **Victory**: All enemies in formation destroyed; transition screen displayed
- **Game Over**: Lives exhausted or formation reached player; game ends

### Wave Progression
- Each wave increments counter (Wave 1, Wave 2, etc.)
- When wave begins: lives reset to 3, score persists, formation spawns at top-center
- Formation speed increases by 10% per wave
- Formation speed also increases dynamically as enemies are destroyed
- Enemy fire rate increases per wave
- After game over, start screen reappears; all game state resets on next game start

### Visual Feedback
- HUD displays current wave number
- State transitions are clear (fade, screen clear, or state change visual)
- Victory screen shows wave number and score before transition to next wave
- Game over screen shows final score and option to restart

## Acceptance Criteria

```gherkin
Feature: Game States and Wave Progression

Scenario: Game initializes in Start state
  Given the game has loaded
  Then the game state is "Start"
  And the start screen is displayed
  And the player sees the title and start button

Scenario: Player transitions from Start to Playing
  Given the game is in Start state
  When the player clicks the start button
  Then the game state changes to "Playing"
  And the game loop begins rendering
  And the HUD shows score 0 and lives 3

Scenario: Transition to Victory state
  Given the game is in Playing state on wave 1
  When the last enemy in the formation is destroyed
  Then the game state changes to "Victory"
  And all movement and firing stops
  And a victory message displays with wave number and score

Scenario: Wave progression after victory
  Given the game is in Victory state at the end of wave 1
  When the transition animation completes (after 2–3 seconds)
  Then the game state changes back to "Playing"
  And a new formation spawns
  And wave counter increments to 2
  And lives reset to 3
  And score persists from wave 1

Scenario: Formation speed increases per wave
  Given wave 1 formation moves at speed S
  When wave 2 begins
  Then the formation moves at speed S × 1.1 (10% faster)
  And when wave 3 begins
  Then the formation moves at speed S × 1.21 (10% faster than wave 2)

Scenario: Enemy fire rate increases per wave
  Given wave 1 enemy bullets spawn at interval I1
  When wave 2 begins
  Then enemy bullets spawn at a shorter interval (faster rate)
  And the rate continues to increase with each wave

Scenario: Transition to Game Over — lives exhausted
  Given the game is in Playing state
  And the player has 1 life remaining
  When an enemy bullet hits the player
  Then the player loses the last life
  And the game state changes to "Game Over"
  And all motion stops
  And the game over screen displays with final score

Scenario: Transition to Game Over — formation reaches player
  Given the formation is moving downward
  When the formation's bottom edge reaches the player's Y position
  Then the game state immediately changes to "Game Over"
  And the game over screen displays the final score

Scenario: Restart after game over
  Given the game is on the game over screen
  When the player clicks the start button
  Then wave counter resets to 1
  And lives reset to 3
  And score resets to 0
  And the game state changes to "Playing"
  And a new formation spawns at the top-center
```

## Related Epic

[Epic 0 — MVP Space Invaders](epic.md)

## Related Slices

<!-- @architect fills this section -->
