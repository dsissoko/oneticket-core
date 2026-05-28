# US-001 — Game Setup

## Story

**Summary:** Initialize the game with core playfield elements and display the main menu so players can start the game.

### Use Case

- **As a** player launching the Breakout game
- **I want to** see a main menu with a clear Start button and a Quit button
- **so that** I can begin a new game or exit the application easily

## Expected Behavior

The game initializes with:
- A bounded playfield (left and right walls, top wall, bottom as loss boundary)
- A 5-row grid of bricks positioned at the top of the screen
- A paddle positioned at the bottom center
- A ball initially positioned above the paddle
- A main menu interface with visible Start and Quit buttons
- A display showing the current number of lives (default: 3)

## Acceptance Criteria

- **Scenario:** Player launches the game and sees the main menu
  - **Given:** The game has just loaded
  - **When:** The page renders
  - **Then:** The main menu is displayed with Start and Quit buttons centered on the screen
  - **And:** The playfield background is visible behind the menu

- **Scenario:** Player sees the initial game state elements before starting
  - **Given:** The main menu is displayed
  - **When:** I examine the game area
  - **Then:** I can see the bounded playfield with walls
  - **And:** I can see the grid of bricks at the top
  - **And:** I can see the paddle at the bottom center
  - **And:** I can see the ball positioned above the paddle
  - **And:** I can see a lives counter showing "Lives: 3"

- **Scenario:** Player clicks the Quit button
  - **Given:** The main menu is displayed
  - **When:** I click the Quit button
  - **Then:** The game closes or returns to the previous page

## Related Epic

- [Epic 0 — MVP Breakout](../epic.md)

## Related Slices

- [Slice 1 — Project Setup and HTML/CSS Base](../../../../how/slices/slice-1-project-setup-and-html-css-base/slice.md)
