# US-006 — Collision Detection & Scoring

## Story

As a player, I want collisions to be detected accurately and scored appropriately so that I can see my progress and feel rewarded for successful gameplay.

## Expected Behavior

### Collision Detection
- AABB (Axis-Aligned Bounding Box) collision detection used for all game objects
- Collisions checked between: player bullets ↔ enemies, player bullets ↔ shields, enemy bullets ↔ player, formation ↔ shields, formation ↔ player
- Collisions resolved immediately: entities destroyed or damaged as appropriate
- Collision detection runs every frame with delta-time accuracy

### Scoring System
- Player bullet hits enemy: +10 points per enemy
- Shield segment destroyed by bullet: +5 points per segment
- Mystery ship bonus: +100–300 points (varies by stage of game and mystery ship timing)
- Score persists across waves until game over
- Score displayed in HUD updates immediately on collision

### Mystery Ship
- Bonus target periodically traverses the top of the screen
- Appears at regular intervals or random times
- Player receives bonus points for destroying it before it exits the screen
- Score varies depending on when the ship was hit (timing-based bonus scaling)

## Acceptance Criteria

```gherkin
Feature: Collision Detection and Scoring

Scenario: Player bullet hits an enemy
  Given the game is playing
  And a player bullet is on screen moving upward
  When the bullet collides with an enemy
  Then the enemy is immediately destroyed
  And the bullet is destroyed
  And the player score increases by 10 points
  And the score updates immediately on the HUD

Scenario: Player bullet hits a shield segment
  Given a shield with intact segments exists
  When a player bullet collides with a segment
  Then the segment is destroyed
  And the player score increases by 5 points
  And the shield visual updates to show damage

Scenario: Enemy bullet hits the player
  Given the player is on screen
  And an enemy bullet is moving downward
  When the bullet hits the player cannon
  Then the bullet is destroyed
  And the player loses 1 life
  And the player enters a 2-second invincibility period
  And lives are updated in the HUD

Scenario: Formation touches a shield
  Given a shield is positioned above the player
  When the enemy formation descends and makes contact with the shield
  Then the entire shield is destroyed immediately
  And no points are awarded for this destruction

Scenario: Formation reaches player
  Given the formation is moving downward
  When the formation's bottom edge reaches the player's vertical position
  Then the game transitions to game over state
  And all movement and firing stops

Scenario: Mystery ship appears and awards bonus
  Given the game is playing
  When a mystery ship appears at the top of the screen
  And a player bullet hits it
  Then the ship is destroyed
  And the player receives bonus points (100–300 depending on timing)
  And the bonus is added to the score displayed in the HUD

Scenario: Score persists across waves
  Given the player has scored 250 points on wave 1
  When all enemies are defeated and wave 2 begins
  Then the score remains 250 points
  And new points earned on wave 2 add to the existing score
```

## Related Epic

[Epic 0 — MVP Space Invaders](epic.md)

## Related Slices

<!-- @architect fills this section -->
