# US-004 — Destructible Shields

## Story

As a player, I want shields (bunkers) positioned between me and the enemy formation so that I can strategically block incoming fire and have time to counterattack.

## Expected Behavior

- Four shields (bunkers) are positioned horizontally above the player cannon
- Each shield consists of multiple segments arranged in a grid pattern (e.g., 4×4 segments per shield)
- Shield segments degrade when struck by player or enemy bullets
- When a segment is destroyed, the shield becomes visually damaged and a "hole" appears
- If the enemy formation makes contact with a shield, the entire shield is immediately destroyed
- Shields regenerate only on new waves (not during current wave)
- Shield visual representation clearly shows damage state

## Acceptance Criteria

```gherkin
Feature: Destructible Shields

Scenario: Shields appear at game start
  Given the game is playing on wave 1
  When the game initializes
  Then four shields appear evenly distributed above the player cannon
  And each shield is fully intact (all segments visible)

Scenario: Shield segment is destroyed by player bullet
  Given the game is playing
  And a shield with all segments intact is on screen
  When a player bullet hits a shield segment
  Then that segment is destroyed and removed
  And the shield is visually damaged with a visible hole
  And the bullet is also destroyed

Scenario: Shield segment is destroyed by enemy bullet
  Given the game is playing
  And a shield with intact segments is on screen
  When an enemy bullet hits a shield segment
  Then that segment is destroyed
  And the shield visual updates to show the damage
  And the enemy bullet is also destroyed

Scenario: Entire shield is destroyed by formation contact
  Given the game is playing
  And a shield is on screen
  When the enemy formation moves down and touches any shield segment
  Then the entire shield is immediately destroyed
  And all remaining segments disappear

Scenario: Shields regenerate on new wave
  Given the game was playing and shields were partially destroyed
  When all enemies are defeated and a new wave begins
  Then all four shields are regenerated with all segments intact
  And shields are positioned in their original locations above the player
```

## Related Epic

[Epic 0 — MVP Space Invaders](epic.md)

## Related Slices

<!-- @architect fills this section -->
