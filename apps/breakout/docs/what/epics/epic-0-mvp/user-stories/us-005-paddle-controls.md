# US-005 — Paddle Controls and Input Handling

## Story

**Summary:** Implement responsive keyboard and mouse input handling so players can control the paddle with left/right arrow keys and interact with menus via mouse clicks.

### Use Case

- **As a** player
- **I want to** control the paddle using arrow keys and click menu buttons with my mouse
- **so that** I can play the game intuitively using the input methods I expect

## Expected Behavior

- **Keyboard input:** Left arrow (`←`) and right arrow (`→`) keys move the paddle left and right respectively
- **Input responsiveness:** Paddle movement is immediate (no delay) when a key is pressed
- **Continuous movement:** Holding down an arrow key causes the paddle to move smoothly and continuously
- **Boundary enforcement:** Paddle does not move beyond the left or right walls of the playfield
- **Mouse input:** Clicks on menu buttons (Start, Quit, Replay, Speed Slider) are registered and trigger the appropriate actions
- **Input focus:** The game window must maintain focus to receive keyboard and mouse input

## Acceptance Criteria

- **Scenario:** Paddle moves left with left arrow key
  - **Given:** A game is active and the paddle is at the center of the playfield
  - **When:** I press and hold the left arrow key
  - **Then:** The paddle moves left smoothly
  - **And:** The paddle does not move beyond the left wall boundary
  - **When:** I release the left arrow key
  - **Then:** The paddle stops moving immediately

- **Scenario:** Paddle moves right with right arrow key
  - **Given:** A game is active and the paddle is at the center of the playfield
  - **When:** I press and hold the right arrow key
  - **Then:** The paddle moves right smoothly
  - **And:** The paddle does not move beyond the right wall boundary
  - **When:** I release the right arrow key
  - **Then:** The paddle stops moving immediately

- **Scenario:** Paddle responds to rapid key presses
  - **Given:** A game is active
  - **When:** I rapidly press left and right arrow keys in succession
  - **Then:** The paddle responds immediately to each direction change
  - **And:** Movement is fluid with no stuttering or lag

- **Scenario:** Menu buttons respond to mouse clicks
  - **Given:** A menu is displayed (main menu or end-game menu)
  - **When:** I click the Start button
  - **Then:** The game transitions to an active play state
  - **When:** I click the Quit button
  - **Then:** The game closes or returns to the previous page
  - **When:** I click the Replay button
  - **Then:** A new game starts with 3 lives and all bricks reset

- **Scenario:** Speed slider responds to mouse input
  - **Given:** The speed control screen is displayed (pre-game or accessible from menu)
  - **When:** I click and drag the slider to the left (slower)
  - **Then:** The ball speed decreases
  - **When:** I click and drag the slider to the right (faster)
  - **Then:** The ball speed increases
  - **And:** The speed change is reflected in the next game

- **Scenario:** Input focus is required for keyboard interaction
  - **Given:** The game window is open but not focused (user has clicked another window)
  - **When:** I press an arrow key
  - **Then:** The paddle does not move
  - **When:** I click the game window to refocus it
  - **And:** I press an arrow key
  - **Then:** The paddle moves as expected

## Related Slices

- Slice 1 — Configuration du projet et structure HTML/CSS de base
- Slice 2 — Moteur de jeu (boucle, physique, détection de collisions)
