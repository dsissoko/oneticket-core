---
title: 'US-003 — Contrôle de la raquette avec les flèches'
related_epic: epic-0-mvp
---

# US-003 — Contrôle de la Raquette avec les Flèches

## Summary

Permettre au joueur de contrôler la raquette au clavier avec les flèches gauche/droite pour positionner la balle et la faire rebondir sur les briques.

## Use Case

- **As a** player
- **I want to** move the paddle left and right using the left and right arrow keys
- **so that** I can position the paddle to bounce the ball and keep it in play

## Acceptance Criteria

### Scenario 1: Player moves paddle left

- **Given:** the game is in active gameplay state
- **and Given:** the paddle is positioned at center screen
- **and Given:** the player is ready to input keyboard commands
- **When:** the player presses and holds the left arrow key
- **Then:** the paddle moves smoothly to the left
- **and Then:** the paddle stops at the left boundary of the game canvas (does not go off-screen)

### Scenario 2: Player moves paddle right

- **Given:** the game is in active gameplay state
- **and Given:** the paddle is positioned at center screen
- **and Given:** the player is ready to input keyboard commands
- **When:** the player presses and holds the right arrow key
- **Then:** the paddle moves smoothly to the right
- **and Then:** the paddle stops at the right boundary of the game canvas (does not go off-screen)

### Scenario 3: Paddle responds to rapid direction changes

- **Given:** the game is in active gameplay state
- **and Given:** the paddle is in motion
- **When:** the player quickly releases the left arrow and presses the right arrow
- **Then:** the paddle immediately changes direction and moves right
- **and Then:** there is no visible lag or delay in the direction change

### Scenario 4: Paddle movement does not interfere with other game elements

- **Given:** the game is in active gameplay state
- **and Given:** the ball is in motion
- **and Given:** the paddle is moving
- **When:** the ball collides with the moving paddle
- **Then:** the ball bounces off the paddle correctly
- **and Then:** the paddle continues to respond to keyboard input during the collision

## Notes

- The paddle should move at a consistent speed throughout the gameplay
- Keyboard input should be non-blocking (the game loop continues while waiting for input)
- Arrow keys are the only required input method for paddle movement in this story (mouse control of paddle is out of scope)

## Related Slices

- [Slice 4 — Paddle Input and Movement](../../../../how/slices/slice-4-paddle-input/slice.md)
