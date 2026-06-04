# US-005 — Enemy Fire System

## Story

As a player, I want enemies to shoot back at me so that the game is challenging and I must strategically use shields and movement to survive.

## Expected Behavior

- Enemies fire bullets at random intervals during the game
- Bullets are fired from random enemies in the formation
- A maximum of 3 enemy bullets can be on screen simultaneously
- When the limit is reached, the oldest bullet is removed before a new one is spawned
- Enemy fire rate increases with each wave progression
- Enemy bullets move downward toward the player
- Enemy bullet speed is consistent but may scale with wave number
- Bullets are rendered each frame and collision detection is applied

## Acceptance Criteria

```gherkin
Feature: Enemy Fire System

Scenario: Enemies fire at random intervals
  Given the game is playing with formation on screen
  When the game loop runs for several seconds
  Then enemy bullets appear on screen
  And bullets originate from random enemies in the formation
  And the timing between shots is randomized

Scenario: Enemy bullets move downward
  Given an enemy bullet has spawned
  When the game loop renders each frame
  Then the bullet moves downward smoothly
  And the bullet continues until it hits a target or leaves the screen

Scenario: Maximum 3 bullets on screen
  Given the game is playing
  When 3 enemy bullets are on screen
  And a 4th bullet attempts to spawn
  Then the oldest bullet is removed from the screen
  And the 4th bullet is added
  And at most 3 bullets remain at all times

Scenario: Enemy bullets are destroyed on impact
  Given an enemy bullet is on screen
  When it hits the player cannon
  Then the bullet is immediately destroyed
  And the player loses 1 life (if not invincible)
  When an enemy bullet hits a shield segment
  Then the bullet is immediately destroyed
  And the shield segment is also destroyed

Scenario: Fire rate increases with wave
  Given the game is on wave 1 with fire interval I1
  When all enemies are destroyed and wave 2 begins
  Then enemy bullets spawn at a faster rate (shorter interval)
  And the rate increases proportionally with wave number

Scenario: Fire rate increases as enemies are destroyed
  Given there are 55 enemies firing
  When 50% of enemies are destroyed
  Then remaining enemies fire more frequently
  And the effective fire rate increases to maintain challenge
```

## Related Epic

[Epic 0 — MVP Space Invaders](epic.md)

## Related Slices

- [Slice 6 — Enemy Fire System](slice-6-enemy-fire/slice.md)
- [Slice 8 — Wave Progression & Difficulty Scaling](slice-8-waves/slice.md)
