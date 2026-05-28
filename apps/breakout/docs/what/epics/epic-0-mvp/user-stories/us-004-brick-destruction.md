# US-004 — Brick Destruction and Victory Condition

## Story

As a **player**
I want **the bricks to be destroyed when the ball collides with them**
So that **I can clear the wall and experience the victory condition when all bricks are gone**

## Expected Behavior

- Each brick is an individual entity with position, dimensions, and state (active/destroyed)
- When the ball collides with an active brick, that brick is immediately destroyed
- The destroyed brick disappears from the game canvas
- When the last brick is destroyed, the game transitions to a victory state
- The victory screen displays and allows the player to replay or quit
- Collision detection is precise enough to handle ball-brick interactions reliably
- Multiple bricks can be destroyed in rapid succession without bugs or visual glitches

## Acceptance Criteria

```gherkin
Feature: Brick Destruction and Victory Condition

  Scenario: Destroy a brick on ball collision
    Given the game is active with a full wall of bricks
    When the ball collides with a brick
    Then that brick is immediately removed from the game canvas
    And the collision causes the ball to bounce as expected

  Scenario: Multiple bricks can be destroyed
    Given the game is active with multiple bricks
    When the ball collides with multiple bricks in sequence
    Then each brick is destroyed upon collision
    And no visual artifacts or overlapping issues occur

  Scenario: Victory condition triggered when all bricks destroyed
    Given the game is active with only one brick remaining
    When the ball destroys the last brick
    Then the game transitions to victory state
    And the victory screen is displayed
    And the brick count shows 0

  Scenario: Victory screen shows replay and quit options
    Given the player has won the game
    When the victory screen is displayed
    Then a "Replay" button is present and clickable
    And a "Quit" button is present and clickable
    And the score or brick count is visible

  Scenario: Ball correctly bounces off destroyed brick location
    Given a brick is destroyed
    When a new ball enters that space
    Then the ball continues without collision
    And the destroyed brick location is completely empty

  Scenario: Brick grid remains intact during gameplay
    Given the brick wall is initialized with 5 rows
    When bricks are destroyed throughout gameplay
    Then remaining bricks maintain their grid positions
    And no bricks spontaneously disappear or shift unexpectedly
```

## Related Slices

- [Slice 4 — Brick Grid and Ball-Brick Collision](../../how/slices/slice-4-brick-collision.md)
- [Slice 6 — Life Tracking and Victory/Defeat Conditions](../../how/slices/slice-6-life-tracking.md)
