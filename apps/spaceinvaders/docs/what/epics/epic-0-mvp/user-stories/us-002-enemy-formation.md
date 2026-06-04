# US-002 — Enemy Formation

## Story

As a player, I want to see enemies arranged in an 11×5 grid with 3 visual types (10/20/30 pts) so that I can strategically target high-value enemies.

## Expected Behavior

- Enemies spawn in a uniform 11×5 grid (55 total) at the start of each wave
- Three enemy types are visually distinct:
  - **Top 2 rows (30 points):** Highest-value enemies, distinct visual appearance
  - **Middle 2 rows (20 points):** Medium-value enemies, different visual appearance
  - **Bottom row (10 points):** Lowest-value enemies, unique visual appearance
- Formation moves in synchronized horizontal sweeps (left-right-left pattern)
- When formation reaches screen edge, all enemies step down one row
- Formation speed increases by 15% each wave
- As enemies are destroyed, remaining enemies continue sweeping at the same rhythm
- When all enemies in a row are destroyed, enemies from higher rows may cascade down (optional: visual feedback on row clearing)
- Formation collision with player row triggers immediate game over

## Acceptance Criteria

```gherkin
Feature: Enemy Formation Display and Movement
  
  Scenario: Initial enemy formation spawn
    Given the game is on wave 1
    When the wave starts
    Then 55 enemies spawn in 11 columns × 5 rows
    And top 2 rows display 30-point enemy type (visual style A)
    And middle 2 rows display 20-point enemy type (visual style B)
    And bottom row displays 10-point enemy type (visual style C)
    And formation is centered horizontally on screen

  Scenario: Enemy formation horizontal movement
    Given the enemy formation is displayed
    When the wave is active
    Then formation moves left and right in synchronized horizontal sweep
    And all enemies in formation move together as one unit
    And each enemy maintains grid spacing during movement

  Scenario: Formation step-down at boundary
    Given formation is moving horizontally
    When formation reaches left or right screen edge
    Then all enemies step down by one row height
    And formation reverses direction
    And movement resumes smoothly

  Scenario: Formation speed increases per wave
    Given wave 1 is active with baseline formation speed
    When wave 2 starts
    Then formation movement speed is 15% faster than wave 1
    When wave 3 starts
    Then formation movement speed is 15% faster than wave 2

  Scenario: Enemy destruction preserves formation rhythm
    Given enemies are in formation and moving
    When player destroys 3 random enemies
    Then remaining enemies maintain synchronized movement pattern
    And remaining enemies continue sweeping at current rhythm
    And grid structure is preserved for remaining enemies

  Scenario: Formation reaches player row triggers game over
    Given formation is descending with active movement
    When formation reaches the player's row
    Then game immediately ends
    And "GAME OVER" screen displays
    And final score is shown
```

## Related Epic

[Epic 0 — MVP Complete Playable Space Invaders Game](epic-0-mvp/epic.md)

## Related Slices

- [Slice 3 — Enemy Formation Grid with Movement and Rendering](slice-3-enemy-formation/slice.md)
- [Slice 8 — Game States and Wave Progression](slice-8-game-states-progression/slice.md)
