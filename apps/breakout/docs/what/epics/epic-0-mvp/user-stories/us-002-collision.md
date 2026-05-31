# US-002 — Détection collision AABB et gameplay

## Story

En tant que joueur, je veux que la balle rebondisse sur les murs, plafond, raquette et briques, afin que le gameplay soit fonctionnel.

## Expected Behavior

La balle détecte les collisions avec tous les obstacles du jeu et change de direction de manière réaliste :
- Rebondit sur les murs latéraux et le plafond
- Rebondit sur la raquette du joueur
- Détruit les briques au contact et rebondit
- Utilise la détection AABB (Axis-Aligned Bounding Box) pour des collisions précises

## Acceptance Criteria

```gherkin
Feature: Collision Detection and Ball Physics

  Scenario: Ball collides with walls and ceiling
    Given the ball is in play
    When the ball moves towards a wall or the ceiling
    Then the ball detects the collision
    And the ball changes direction appropriately (X or Y velocity reversal)
    And the ball does not pass through the obstacle

  Scenario: Ball collides with paddle
    Given the ball is in play
    And the paddle is in motion or stationary
    When the ball intersects with the paddle
    Then the ball bounces off the paddle
    And the ball's Y velocity is reversed
    And the ball does not become stuck on the paddle

  Scenario: Ball collides with brick
    Given the ball is in play
    And there are bricks on the screen
    When the ball intersects with a brick
    Then the brick is marked for destruction
    And the brick is removed from the game on the next frame
    And the ball bounces off the brick (direction reversed)
    And the player score increases (if scoring is implemented)

  Scenario: AABB Collision Detection is accurate
    Given the collision detection system is using AABB
    When objects with defined bounding boxes interact
    Then collisions are detected when bounding boxes overlap
    And collisions are missed only when objects do not actually touch
    And the system performs efficiently even with multiple bricks
```

## Related Epic

[Epic 0 — MVP Breakout](epic-0-mvp/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
