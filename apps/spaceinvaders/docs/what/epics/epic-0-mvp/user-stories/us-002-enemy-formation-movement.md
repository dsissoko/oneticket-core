# US-002 — Enemy Formation Movement

## Story

As a player, I want the enemy formation to move realistically (horizontal movement with edge bouncing and vertical dropping) so that the game feels challenging and authentic to the original Space Invaders.

## Expected Behavior

- Formation consists of 11 enemies horizontally × 5 enemies vertically (55 total)
- Formation moves laterally across the screen at a constant speed
- When formation reaches the screen edge, it bounces and drops down by one unit vertically
- Formation speed increases with each wave progression
- Formation speed increases as enemies are destroyed (fewer enemies = faster movement)
- Formation position is calculated and rendered each frame using delta-time for frame-independent movement

## Acceptance Criteria

```gherkin
Feature: Enemy Formation Movement

Scenario: Formation moves horizontally
  Given the game is playing
  And the formation is at initial position
  When the game loop renders each frame
  Then the formation moves left or right by a consistent amount
  And the movement is smooth and continuous
  And all enemies maintain their relative grid positions

Scenario: Formation bounces at screen edge
  Given the formation is moving right
  When the right edge of the formation reaches the right screen boundary
  Then the formation changes direction to move left
  And the entire formation drops down vertically by one unit
  And movement continues smoothly in the new direction

Scenario: Formation bounces at left edge
  Given the formation is moving left
  When the left edge of the formation reaches the left screen boundary
  Then the formation changes direction to move right
  And the entire formation drops down vertically by one unit

Scenario: Formation speed scales with wave
  Given I am on wave 1
  When the formation is moving
  Then it moves at speed S1
  And when all enemies are destroyed and a new wave begins
  Then the new formation moves at speed S1 × 1.1 (10% faster)

Scenario: Formation speed increases as enemies are destroyed
  Given there are 55 enemies in the formation
  When 27 enemies are destroyed (50%)
  Then the remaining 28 enemies move approximately 40% faster
  And movement scaling is proportional to enemies remaining
```

## Related Epic

[Epic 0 — MVP Space Invaders](epic.md)

## Related Slices

<!-- @architect fills this section -->
