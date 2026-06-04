# US-003 — Player Controls

## Story

As a desktop or mobile player, I want to control my cannon using familiar input methods (keyboard, swipe, touch button) so that I can aim and fire at enemies on any platform.

## Expected Behavior

### Desktop Controls
- Arrow Keys (Left/Right): Move player cannon left or right
- Spacebar: Fire a bullet
- Player cannot move beyond screen boundaries
- New bullet only fires when previous bullet has exited the screen or hit a target (max 1 bullet on screen at a time)

### Mobile Controls
- Swipe Left/Right: Move player cannon left or right
- On-Screen Fire Button: Tap to fire a bullet
- Touch-and-hold: Optional continuous movement support
- Player cannot move beyond screen boundaries
- New bullet fires only after previous bullet clears (max 1 bullet on screen)

### General Behavior
- Movement is continuous while key is held (desktop) or while swiping (mobile)
- Firing responds immediately to input
- Cannon sprite is rendered at correct position each frame
- Cannon position is constrained to game boundaries

## Acceptance Criteria

```gherkin
Feature: Player Controls and Movement

Scenario: Player moves cannon with arrow keys
  Given the game is playing
  And I am using a desktop device
  When I press the left arrow key
  Then the player cannon moves left smoothly
  And the cannon remains on screen (not beyond left boundary)

Scenario: Player moves cannon to the right
  Given the game is playing
  When I press the right arrow key
  Then the player cannon moves right smoothly
  And the cannon remains on screen (not beyond right boundary)

Scenario: Player fires with spacebar
  Given the game is playing
  And no bullet is currently on screen
  When I press the spacebar
  Then a bullet spawns at the cannon's position
  And the bullet moves upward toward enemies

Scenario: Player cannot fire multiple bullets
  Given the game is playing
  And a bullet is on screen
  When I press the spacebar again
  Then no new bullet is created
  And the player must wait for the existing bullet to clear

Scenario: Player moves with swipe gesture (mobile)
  Given the game is playing
  And I am using a mobile device
  When I swipe left
  Then the player cannon moves left smoothly
  And when I swipe right
  Then the player cannon moves right smoothly
  And the cannon stays within screen boundaries

Scenario: Player fires with touch button (mobile)
  Given the game is playing
  And I am using a mobile device
  When I tap the fire button
  Then a bullet spawns and moves upward
  And subsequent taps fire only after bullet clears
```

## Related Epic

[Epic 0 — MVP Space Invaders](epic.md)

## Related Slices

<!-- @architect fills this section -->
