# US-007 — Speed Control

## Story

- **As a** arcade player
- **I want to** adjust the difficulty of the game using a speed slider on the main menu
- **so that** I can control how fast the ball moves and tailor the challenge to my skill level

## Expected Behavior

The main menu displays a slider control that lets the player set the ball's speed before starting a game. Moving the slider adjusts the speed from slow to fast, and the chosen speed is applied when the game begins. The speed setting is clearly labeled and easy to understand.

## Acceptance Criteria

- **Scenario:** Speed slider is visible on the main menu
  - **Given:** The main menu is displayed
  - **When:** The player looks at the menu
  - **Then:** A slider control is visible
  - **and Then:** The slider is labeled with a descriptive text (e.g., "Ball Speed" or "Difficulty")
  - **and Then:** The slider has clearly marked endpoints (e.g., "Slow" and "Fast")

- **Scenario:** Player adjusts the speed slider
  - **Given:** The main menu is displayed
  - **and Given:** The player can interact with the slider using the mouse
  - **When:** The player clicks and drags the slider handle
  - **Then:** The slider moves smoothly along its track
  - **and Then:** A visual indicator (e.g., text or number) shows the current speed value

- **Scenario:** Speed value persists until changed
  - **Given:** The player has set the speed slider to a specific value
  - **When:** The player moves the mouse away from the slider
  - **Then:** The slider retains the selected value
  - **and Then:** If the player clicks Start and then Replay, the same speed is remembered (or resets to default)

- **Scenario:** Selected speed is applied when the game starts
  - **Given:** The main menu is displayed
  - **and Given:** The player has set the speed slider to a specific value
  - **When:** The player clicks the "Start" button
  - **Then:** The game initializes with ball velocity proportional to the chosen speed
  - **and Then:** A slower speed setting results in a slower-moving ball
  - **and Then:** A faster speed setting results in a visibly faster-moving ball

- **Scenario:** Speed range is clearly defined and playable
  - **Given:** The player is adjusting the speed slider
  - **When:** The slider is at the minimum (slow) position
  - **Then:** The ball moves slow enough to be controllable for most players
  - **When:** The slider is at the maximum (fast) position
  - **Then:** The ball moves fast enough to be challenging but not impossible
  - **and Then:** All positions between min and max are playable

- **Scenario:** Default speed is set to a reasonable middle value
  - **Given:** The main menu is displayed for the first time
  - **When:** The game loads without a previous speed setting
  - **Then:** The slider defaults to a middle position
  - **and Then:** The default speed is neither too slow nor too fast (moderate difficulty)

## Related Slices

- HTML slider input element (range input)
- CSS styling for slider appearance and interactivity
- JavaScript event listeners for slider change (oninput/onchange)
- Speed multiplier state variable
- Application of speed multiplier to initial ball velocity
- Visual feedback for slider position (label update, value display)
