# US-003 — Player Controls

## Story

As a player, I want to move my cannon left/right and fire projectiles so that I can destroy enemies and survive waves.

## Expected Behavior

- **Desktop Controls**
  - Arrow keys (Left/Right) move the cannon horizontally
  - Spacebar fires a projectile
  - One active projectile at a time
  - Next shot only fires after previous projectile exits screen or hits target

- **Mobile Controls**
  - Swipe left/right on screen moves cannon
  - On-screen fire button triggers projectile
  - One active projectile at a time
  - Touch responsiveness matches desktop experience

- **Player Respawn**
  - Player starts with 3 lives
  - Upon collision with enemy, lose one life
  - Respawn at center of screen after death
  - 2-second invincibility period after respawn (visual feedback via blinking)
  - Game ends when all lives are lost

## Acceptance Criteria

```gherkin
Feature: Player Controls and Movement
  
  Scenario: Desktop player moves cannon left with arrow key
    Given the game is running
    When I press the left arrow key
    Then the cannon moves left
    And the cannon does not exceed the left boundary
  
  Scenario: Desktop player moves cannon right with arrow key
    Given the game is running
    When I press the right arrow key
    Then the cannon moves right
    And the cannon does not exceed the right boundary
  
  Scenario: Player fires a single projectile on desktop
    Given the game is running
    When I press spacebar
    Then a projectile appears above the cannon
    And the projectile travels upward
    And I cannot fire another projectile until the current one exits the screen or hits an enemy
  
  Scenario: Mobile player moves cannon by swiping left
    Given the game is running on mobile
    When I swipe left on the screen
    Then the cannon moves left
    And the cannon does not exceed the left boundary
  
  Scenario: Mobile player moves cannon by swiping right
    Given the game is running on mobile
    When I swipe right on the screen
    Then the cannon moves right
    And the cannon does not exceed the right boundary
  
  Scenario: Mobile player fires projectile via button
    Given the game is running on mobile
    When I tap the fire button
    Then a projectile appears above the cannon
    And the projectile travels upward
    And I cannot fire another projectile until the current one exits the screen or hits an enemy
  
  Scenario: Player respawns at center with initial lives
    Given the game is running
    When the game starts
    Then the player is positioned at the center bottom of the screen
    And the player has 3 lives displayed
  
  Scenario: Player loses a life on collision with enemy
    Given the game is running with 3 lives
    When the cannon collides with an enemy
    Then the player loses one life
    And the player respawns at the center
    And the player is invincible for 2 seconds
    And the player cannon blinks during invincibility
  
  Scenario: Game over when all lives lost
    Given the player has 1 life remaining
    When the cannon collides with an enemy
    Then the player loses the final life
    And the game ends
    And a game over screen is displayed
  
  Scenario: Invincibility prevents multiple deaths
    Given the player has just respawned with invincibility active
    When an enemy touches the cannon during invincibility
    Then the player does not lose another life
    And the player continues normal play after invincibility expires
```

## Related Epic

[Epic 0 — MVP Breakout (Space Invaders)](epic-0-mvp/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices -->
