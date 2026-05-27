# US-001 — Game Setup

## Story

- **As a** arcade player
- **I want to** launch the game and see the playing field initialized with all game elements
- **so that** I can immediately start playing a round of Breakout

## Expected Behavior

When the game starts, the player sees:
- A canvas or game area sized appropriately for gameplay
- A paddle positioned at the bottom center
- A brick wall (5 rows) fully intact at the top
- A ball positioned at the center top, ready to bounce
- Score display showing 0
- Lives display showing 3
- The main menu with speed slider and "Start" button

## Acceptance Criteria

- **Scenario:** Player opens the game and views the main menu
  - **Given:** The game application is loaded in a browser
  - **and Given:** No game state has been initialized yet
  - **When:** The page renders
  - **Then:** The main menu is displayed with a canvas/game area visible
  - **and Then:** The speed slider is accessible to the player

- **Scenario:** Player clicks the Start button from the main menu
  - **Given:** The game is in the main menu state
  - **and Given:** The player has adjusted or accepted the default speed setting
  - **When:** The player clicks the "Start" button
  - **Then:** The game transitions to "playing" state
  - **and Then:** The canvas displays: paddle at bottom center, brick wall (5 rows × 10 columns) at top, ball at center-top position
  - **and Then:** Score is reset to 0 and Lives to 3

- **Scenario:** Game canvas initializes with correct dimensions and layout
  - **Given:** A new game session is starting
  - **When:** The game renders the playing field
  - **Then:** The brick wall occupies the top third of the canvas with evenly spaced bricks
  - **and Then:** The paddle is positioned at the bottom with a fixed height and appropriate width
  - **and Then:** The ball is positioned at the vertical center of the paddle, horizontally centered

## Related Slices

- Vanilla JavaScript canvas setup
- Game state initialization (score, lives, brick layout)
- Main menu UI (HTML/CSS, Start button, speed slider)
- Initial ball and paddle positioning logic
