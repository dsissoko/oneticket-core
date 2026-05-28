# US-006 — Menus and Game State Navigation

## Story

**Summary:** Implement a complete menu system with main menu, game-over screens, and state transitions so players can start, pause, replay, and quit games smoothly.

### Use Case

- **As a** player
- **I want to** navigate between main menu, speed control, gameplay, and end-game screens
- **so that** I can manage my game experience and easily start new games or exit without confusion

## Expected Behavior

**Main Menu State:**
- Displays at game startup with "Start Game" and "Quit" buttons
- "Start Game" button transitions to Speed Control screen
- "Quit" button closes or exits the game

**Speed Control Screen:**
- Appears before gameplay starts
- Displays a slider to adjust ball speed (e.g., "Slow ← → Fast")
- Shows current speed setting
- "Start Game" button begins gameplay with the selected speed
- "Back" button returns to Main Menu

**Gameplay State:**
- Active game loop runs
- Lives counter is visible
- Game can transition to Win or Loss screen

**Loss Screen (0 lives):**
- Displays "Game Over — You Lost!" message
- Shows final statistics (e.g., bricks destroyed, final lives count)
- "Replay" button resets the game and returns to Speed Control screen
- "Main Menu" button returns to Main Menu
- "Quit" button closes the game

**Win Screen (all bricks destroyed):**
- Displays "You Win!" message
- Shows final statistics (e.g., time played, lives remaining)
- "Replay" button resets the game and returns to Speed Control screen
- "Main Menu" button returns to Main Menu
- "Quit" button closes the game

**State Transitions:**
- All transitions are instantaneous or have a brief 1–2 second animation
- Previous game state is cleared when transitioning (except lives/stats for display on end screens)

## Acceptance Criteria

- **Scenario:** Main menu displays at startup
  - **Given:** The game has just loaded
  - **When:** The page renders
  - **Then:** The main menu is displayed
  - **And:** Start Game and Quit buttons are visible and clickable

- **Scenario:** Start Game button transitions to speed control
  - **Given:** The main menu is displayed
  - **When:** I click the "Start Game" button
  - **Then:** The speed control screen appears
  - **And:** The main menu disappears

- **Scenario:** Speed control screen displays and accepts slider input
  - **Given:** The speed control screen is displayed
  - **When:** I adjust the slider
  - **Then:** The speed indicator updates in real-time
  - **When:** I click "Start Game"
  - **Then:** Gameplay begins with the selected speed
  - **And:** The speed control screen disappears

- **Scenario:** Gameplay transitions to loss screen when lives reach 0
  - **Given:** A game is active with 1 life remaining
  - **When:** The player loses the final life
  - **Then:** The game pauses
  - **And:** The loss screen appears with "Game Over — You Lost!" message
  - **And:** Replay and Main Menu buttons are visible

- **Scenario:** Gameplay transitions to win screen when all bricks are destroyed
  - **Given:** A game is active with bricks remaining
  - **When:** The last brick is destroyed
  - **Then:** The game pauses
  - **And:** The win screen appears with "You Win!" message
  - **And:** Replay and Main Menu buttons are visible

- **Scenario:** Replay button starts a new game
  - **Given:** The loss or win screen is displayed
  - **When:** I click the "Replay" button
  - **Then:** Lives reset to 3
  - **And:** All bricks are restored to the playfield
  - **And:** The paddle resets to the center
  - **And:** The speed control screen appears again
  - **And:** The previous end-game screen disappears

- **Scenario:** Main Menu button returns to main menu
  - **Given:** The loss or win screen is displayed
  - **When:** I click the "Main Menu" button
  - **Then:** The main menu appears
  - **And:** The end-game screen disappears
  - **And:** The game state is completely cleared

- **Scenario:** Quit button closes the game from any screen
  - **Given:** Any menu or game screen is displayed
  - **When:** I click the "Quit" button
  - **Then:** The game closes or returns to the previous page

- **Scenario:** Back button returns to previous menu
  - **Given:** The speed control screen is displayed
  - **When:** I click the "Back" button
  - **Then:** The main menu appears
  - **And:** The speed control screen disappears

## Related Epic

- [Epic 0 — MVP Breakout](../epic.md)

## Related Slices

- [Slice 3 — State Management and Menu Navigation](../../../../how/slices/slice-3-state-management-and-menus/slice.md)
- [Slice 4 — Full Integration and Quality Assurance](../../../../how/slices/slice-4-full-integration-and-testing/slice.md)
