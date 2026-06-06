# US-003 — Player Controls

## Story

As a desktop or mobile player, I want to control my cannon using familiar input methods (keyboard, swipe, touch) so that I can aim and fire at enemies on any platform.

## Expected Behavior

### Desktop Controls
- Arrow Keys (Left/Right): Move player cannon left or right
- Spacebar: Fire a bullet
- Player cannot move beyond screen boundaries
- Up to 3 bullets can be on screen simultaneously — rapid fire is allowed

### Mobile Controls
- Swipe Left/Right: Move player cannon left or right
- Tap anywhere on screen: Fire a bullet immediately
- Player cannot move beyond screen boundaries
- Up to 3 bullets can be on screen simultaneously

### General Behavior
- Movement is continuous while key is held (desktop) or while swiping (mobile)
- Firing responds immediately to input — no wait for bullet to clear
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
  When I press the spacebar
  Then a bullet spawns at the cannon's position
  And the bullet moves upward toward enemies

Scenario: Player can fire multiple bullets rapidly
  Given the game is playing
  And fewer than 3 bullets are currently on screen
  When I press the spacebar
  Then a new bullet is created immediately
  And up to 3 bullets can be on screen simultaneously

Scenario: Player moves with swipe gesture (mobile)
  Given the game is playing
  And I am using a mobile device
  When I swipe left
  Then the player cannon moves left smoothly
  And when I swipe right
  Then the player cannon moves right smoothly
  And the cannon stays within screen boundaries

Scenario: Player fires by tapping anywhere on screen (mobile)
  Given the game is playing
  And I am using a mobile device
  When I tap anywhere on the screen
  Then a bullet spawns and moves upward immediately
  And subsequent taps fire new bullets without waiting
```

## Related Epic

[Epic 0 — MVP Space Invaders](epic.md)

## Related Slices

- [Slice 3 — Player Control & Firing](slice-3-player/slice.md)
