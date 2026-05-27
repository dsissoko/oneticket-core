# US-001 — Game Setup and Initialization

## Story

En tant que joueur, je veux que le jeu s'initialise correctement avec un canvas configuré, une aire de jeu délimitée, et les éléments de base positionnés, afin de disposer d'une fondation solide pour jouer au breakout.

## Expected Behavior

- Le canvas est créé et rendu dans le DOM avec des dimensions fixes (par ex. 800x600)
- L'aire de jeu est définie avec des limites de collision (murs gauche, droit et plafond)
- La raquette est positionnée au centre en bas de l'écran
- Les briques sont arrangées en grille (5 lignes) en haut de l'aire de jeu
- La balle est positionnée au centre, prête à être lancée
- L'état du jeu est initialisé (3 vies, briques intactes, vitesse par défaut)
- Tous les éléments graphiques sont visibles et correctement dimensionnés

## Acceptance Criteria

```gherkin
Feature: Game Setup and Initialization
  Scenario: Canvas and game board are initialized on page load
    Given the player loads the game page
    When the game initializes
    Then the canvas element is created and visible in the DOM
    And the canvas has fixed dimensions (800x600 or similar)
    And the playable area boundaries are defined

  Scenario: Paddle is positioned correctly
    Given the game board is initialized
    When the setup completes
    Then the paddle is centered horizontally at the bottom of the playable area
    And the paddle has a default width (e.g., 80px) and height (e.g., 10px)

  Scenario: Bricks are arranged in a grid
    Given the game board is initialized
    When the setup completes
    Then 5 rows of bricks are displayed
    And bricks are evenly spaced in a grid layout
    And each brick has consistent dimensions (e.g., 75x15px)

  Scenario: Ball is positioned and ready
    Given the game board is initialized
    When the setup completes
    Then the ball is centered horizontally above the paddle
    And the ball has a default size (e.g., 8px diameter)
    And the ball is ready to be launched

  Scenario: Game state is initialized
    Given the game board is initialized
    When the setup completes
    Then the game state is set to "Menu"
    And the player has 3 lives
    And all bricks are marked as active/unbroken
    And the default ball speed is set
```

## Related Slices

- Slice 1: Game Board and Paddle Setup
