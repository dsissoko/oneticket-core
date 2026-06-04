# US-004 — Shields and Collisions

## Story

As a player, I want shields between me and enemies that degrade when hit so that I have partial protection during battles.

## Expected Behavior

### Bunker Shields
- Four bunkers positioned between the enemy formation and the player
- Each bunker consists of multiple destructible segments (4x4 grid pattern recommended)
- Bunkers provide physical barriers that can be destroyed by projectile impacts
- Segments degrade on impact and disappear when destroyed

### Segment Damage and Destruction
- Player projectiles hitting shield segments destroy the segments and disappear
- Enemy projectiles hitting shield segments degrade the segments and disappear
- Formation contact (enemy rows moving down and touching bunker) destroys affected segments
- Destroyed segments are removed from rendering and collision detection immediately

### Collision Behaviors

#### Enemy Hit
- Enemy ship impacted by player projectile is destroyed
- Destroyed enemy adds to player score (based on enemy type)
- Enemy projectile disappears on hit

#### Mystery Ship Hit
- Mystery ship (bonus target) hit by player projectile awards bonus points
- Mystery ship disappears from screen
- No projectile bounce or secondary effects

#### Shield Segment Hit
- Shield segment impacted by any projectile degrades
- Segment visual state changes (burn marks or gradual transparency recommended)
- Final impact destroys the segment completely
- Bunker structure remains otherwise intact

#### Enemy Fire to Player
- Enemy projectile reaching player position reduces player lives by 1
- Player ship flashes briefly (invulnerability frames optional)
- Enemy projectile disappears on impact
- If lives reach 0, game over

#### Formation Reaching Player
- Enemy formation moving down to player row level triggers game over
- No shield can prevent formation contact game over
- Game state transitions to end screen

## Acceptance Criteria

```gherkin
Feature: Shield and Collision System

  Scenario: Bunkers provide protection
    Given player has 4 bunkers on screen
    And each bunker has destructible segments
    When enemy fires toward player
    And projectile hits bunker segment
    Then segment degrades and disappears
    And player remains unharmed

  Scenario: Player projectile destroys enemy
    Given enemy formation is on screen
    When player fires projectile
    And projectile hits enemy
    Then enemy is destroyed
    And score increases by enemy value
    And projectile disappears

  Scenario: Enemy projectile damages player
    Given player has 3 lives
    When enemy fires projectile
    And projectile reaches player
    Then lives decrease to 2
    And projectile disappears

  Scenario: Formation contact causes game over
    Given bunkers are destroyed or insufficient
    When enemy formation moves to player row level
    Then game transitions to game over state

  Scenario: Mystery ship bonus
    Given mystery ship appears
    When player hits mystery ship with projectile
    Then bonus points awarded
    And mystery ship disappears
    And projectile disappears

  Scenario: Formation destroys bunker segments
    Given bunker is below enemy formation
    When enemies move down and contact bunker
    Then affected segments are destroyed
    And formation continues downward
```

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 4 — Bunker System](slice-4-bunker-system/slice.md) -->
