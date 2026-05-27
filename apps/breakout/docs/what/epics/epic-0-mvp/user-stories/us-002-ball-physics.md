# US-002 — Ball Physics and Collision Detection

## Story

As a **player**, I want the **ball to move with consistent physics and bounce off surfaces**, so that **I can engage in challenging, predictable gameplay where I control the outcome through skill**.

## Expected Behavior

The ball is launched from the center of the paddle with a constant velocity determined by the speed slider. It travels in a straight line until it collides with a surface:

- **Wall Collisions** (left/right boundaries): The ball bounces back with the horizontal velocity component reversed.
- **Ceiling Collision** (top boundary): The ball bounces back with the vertical velocity component reversed.
- **Paddle Collision**: The ball bounces back with the vertical velocity reversed. The horizontal velocity is adjusted based on where the ball hit the paddle:
  - Hit on left side of paddle → ball deflects left
  - Hit on center of paddle → ball continues with minimal horizontal change
  - Hit on right side of paddle → ball deflects right
- **Brick Collision**: The ball bounces back and the brick is destroyed (handled in a separate story).
- **Bottom Boundary** (loss condition): If the ball passes below the paddle, a life is lost and the ball resets.

The ball's speed is proportional to the speed slider setting, ranging from very slow (almost stationary) to very fast (challenging gameplay).

## Acceptance Criteria

```gherkin
Feature: Ball Physics and Bouncing

  Scenario: Ball moves with constant velocity
    Given the game is active
    When the ball is launched from the paddle
    Then the ball moves in a straight line
    And the ball's velocity magnitude is consistent until a collision occurs
    And the velocity magnitude matches the speed slider setting

  Scenario: Ball bounces off left wall
    Given the ball is moving toward the left wall
    When the ball reaches the left boundary
    Then the horizontal velocity component is reversed
    And the vertical velocity component is unchanged
    And the ball remains within the playable area

  Scenario: Ball bounces off right wall
    Given the ball is moving toward the right wall
    When the ball reaches the right boundary
    Then the horizontal velocity component is reversed
    And the vertical velocity component is unchanged
    And the ball remains within the playable area

  Scenario: Ball bounces off ceiling
    Given the ball is moving toward the top boundary
    When the ball reaches the ceiling
    Then the vertical velocity component is reversed
    And the horizontal velocity component is unchanged
    And the ball remains within the playable area

  Scenario: Ball bounces off paddle with angle adjustment
    Given the ball is falling toward the paddle
    When the ball collides with the left third of the paddle
    Then the ball bounces back (vertical component reversed)
    And the horizontal velocity is deflected leftward

  Scenario: Ball bounces off center of paddle
    Given the ball is falling toward the paddle
    When the ball collides with the center of the paddle
    Then the ball bounces back (vertical component reversed)
    And the horizontal velocity component is minimally adjusted

  Scenario: Ball bounces off paddle with angle adjustment
    Given the ball is falling toward the paddle
    When the ball collides with the right third of the paddle
    Then the ball bounces back (vertical component reversed)
    And the horizontal velocity is deflected rightward

  Scenario: Ball speed reflects slider setting
    Given the speed slider is set to a slow value
    When the ball is in motion
    Then the ball's velocity magnitude is slow and predictable

  Scenario: Ball speed reflects slider setting (fast)
    Given the speed slider is set to a fast value
    When the ball is in motion
    Then the ball's velocity magnitude is fast and challenging

  Scenario: Ball velocity updates when slider changes during play
    Given the game is active and the ball is in motion
    When the player adjusts the speed slider
    Then the ball's velocity magnitude is updated immediately
    And the direction of motion is preserved

  Scenario: Ball falls below paddle (life loss)
    Given the ball is falling below the paddle's position
    When the ball passes the bottom boundary
    Then the ball motion stops
    And a life is deducted
    And the ball resets to the center of the paddle

  Scenario: No tunneling through surfaces
    Given the ball is moving at high speed
    When the ball would collide with a surface
    Then the ball never passes through the surface into the out-of-bounds area
    And collision is detected accurately even at high velocities
```

## Related Slices

- Slice 2: Ball Physics Engine
- Slice 3: Collision Detection System
