# US-005 — Enemy Fire and Mystery Ships

## Story

As a player, I want enemies to fire projectiles and bonus mystery ships to pass overhead so that I face evolving challenges and can earn bonus points.

## Expected Behavior

### Enemy Projectiles
- Enemies fire projectiles randomly from the bottom of their columns
- Maximum 3 simultaneous projectiles on screen at any time
- Each projectile travels downward toward the player's ship
- Projectiles are destroyed when they exit the bottom of the screen or collide with the player's ship

### Mystery Ships
- Mystery ships appear periodically and travel horizontally across the top of the screen
- Each mystery ship has a random point value: 50, 100, 150, or 300 points
- Mystery ships appear at unpredictable intervals to create variety
- When destroyed, the player earns the ship's point value
- Mystery ships are destroyed if hit by a player projectile

## Acceptance Criteria

```gherkin
Feature: Enemy Fire and Mystery Ships
  As a player
  I want enemies to fire projectiles and see mystery ships
  So that I face evolving challenges and earn bonus points

  Scenario: Enemy fires projectiles randomly from bottom of column
    Given enemies are spawned on the screen
    When an enemy reaches its firing condition
    Then a projectile spawns at the bottom of that enemy's column
    And the projectile travels downward
    And it is removed when it exits the screen

  Scenario: Maximum 3 simultaneous enemy projectiles
    Given enemies are firing projectiles
    When 3 projectiles already exist on screen
    Then no new enemy projectiles spawn
    Until a projectile is removed

  Scenario: Mystery ship appears periodically
    Given the game is running
    When a mystery ship spawn interval elapses
    Then a mystery ship appears at the top of the screen
    And it has a random point value (50, 100, 150, or 300)
    And it travels horizontally across the screen

  Scenario: Player earns points by destroying mystery ship
    Given a mystery ship with 150 points is on screen
    When the player fires and hits the mystery ship
    Then the mystery ship is destroyed
    And the player's score increases by 150 points
    And the mystery ship is removed from the screen

  Scenario: Mystery ship disappears when exiting screen
    Given a mystery ship is traveling horizontally
    When the mystery ship exits the right edge of the screen
    Then the mystery ship is removed from the game
```

## Related Epic

<!-- @analyst fills this section — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Epic 0 — AppShell MVP](epic-0-mvp/epic.md) -->

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related Slices

- [Slice 4 — Collision Detection and Scoring System](slice-4-collision-scoring/slice.md)
- [Slice 6 — Enemy AI Fire](slice-6-enemy-ai-fire/slice.md)
- [Slice 7 — Mystery Ships Bonuses](slice-7-mystery-ships-bonuses/slice.md)
