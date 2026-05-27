# US-006 — Game Menu

## Story

- **As a** arcade player
- **I want to** interact with menus to start a new game, replay after game over, or quit the application
- **so that** I can control the game flow and easily return to the main menu or exit

## Expected Behavior

The game displays a main menu at startup and after game over/victory. Each menu has clearly labeled buttons that respond to mouse clicks. The main menu includes a speed slider for difficulty control. Game over and victory menus offer Replay and Quit options.

## Acceptance Criteria

- **Scenario:** Main menu is displayed at application startup
  - **Given:** The game application is loaded
  - **When:** The page renders
  - **Then:** The main menu is visible with a title "Breakout"
  - **and Then:** The speed slider is prominently displayed
  - **and Then:** "Start" and "Quit" buttons are visible and clickable

- **Scenario:** Player clicks the Start button
  - **Given:** The main menu is displayed
  - **and Given:** The player has optionally adjusted the speed slider
  - **When:** The player clicks the "Start" button
  - **Then:** The main menu disappears
  - **and Then:** The playing field is rendered and gameplay begins

- **Scenario:** Player clicks the Quit button from main menu
  - **Given:** The main menu is displayed
  - **When:** The player clicks the "Quit" button
  - **Then:** The game returns to the main menu or closes the application (implementation detail)

- **Scenario:** Game over menu is displayed after losing all lives
  - **Given:** The game is in "game over" state
  - **When:** The state transition completes
  - **Then:** The playing field is hidden
  - **and Then:** A game over menu is displayed with title "Game Over"
  - **and Then:** The final score is shown
  - **and Then:** "Replay" and "Quit" buttons are visible

- **Scenario:** Player clicks Replay from game over menu
  - **Given:** The game over menu is displayed
  - **When:** The player clicks the "Replay" button
  - **Then:** The game state resets (score = 0, lives = 3, bricks restored)
  - **and Then:** The playing field is rendered with fresh game state
  - **and Then:** Gameplay begins immediately

- **Scenario:** Player clicks Quit from game over menu
  - **Given:** The game over menu is displayed
  - **When:** The player clicks the "Quit" button
  - **Then:** The game returns to the main menu

- **Scenario:** Victory menu is displayed after destroying all bricks
  - **Given:** The game is in "victory" state
  - **When:** The state transition completes
  - **Then:** The playing field is hidden
  - **and Then:** A victory menu is displayed with title "You Win!"
  - **and Then:** The final score is shown
  - **and Then:** "Replay" and "Quit" buttons are visible

- **Scenario:** Player clicks Replay from victory menu
  - **Given:** The victory menu is displayed
  - **When:** The player clicks the "Replay" button
  - **Then:** The game state resets (score = 0, lives = 3, bricks restored)
  - **and Then:** The playing field is rendered and gameplay begins

- **Scenario:** Buttons are visually distinct and respond to hover
  - **Given:** A menu is displayed
  - **When:** The player hovers over a button with the mouse
  - **Then:** The button's visual state changes (e.g., highlight, color change)
  - **and Then:** The button is clearly interactive

## Related Slices

- Menu state management (main, game over, victory)
- HTML/CSS for menu layout and styling
- Button click event handlers (mouse listeners)
- Game reset logic (reinitialize lives, score, bricks)
- State transitions (playing → game over, playing → victory, menu → playing)
