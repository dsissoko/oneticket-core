# US-007 — Speed Slider Control for Ball Velocity

## Story

**Summary:** Allow players to adjust ball speed via an interactive slider, providing precise control over gameplay difficulty before and during play.

### Use Case

- **As a** player of the breakout game
- **I want to** adjust the ball speed using a slider control ranging from very slow to very fast
- **so that** I can customize the game difficulty to match my skill level and preferred pace

## Expected Behavior

The speed control feature provides a visual slider in the game menu and during active gameplay. The slider enables real-time adjustment of ball velocity magnitude, allowing players to increase challenge or reduce difficulty at any point. The ball responds immediately to speed changes without requiring a restart.

## Acceptance Criteria

### Scenario 1: Slider appears on menu screen

- **Given** the game is in the Menu state
- **and Given** the game board is initialized
- **When** the player views the menu
- **Then** the speed slider control is visible below the "Start Game" button
- **and Then** the slider displays a label indicating "Ball Speed: Slow → Fast"
- **and Then** the slider has a default position at 50% (medium speed)

### Scenario 2: Player adjusts speed before game starts

- **Given** the game is in the Menu state
- **and Given** the player can see the speed slider
- **When** the player moves the slider to the leftmost position (very slow)
- **Then** the slider visual updates to reflect the new position
- **and Then** the game remembers this setting when the player clicks "Start Game"
- **and Then** the ball launches at the very slow speed defined by the leftmost position

### Scenario 3: Slider adjusts ball speed during active gameplay

- **Given** the game is in the Active state
- **and Given** the ball is in motion at medium speed
- **When** the player moves the speed slider to the rightmost position (very fast)
- **Then** the ball velocity magnitude increases immediately
- **and Then** the ball continues its current trajectory but at the new faster speed
- **and Then** subsequent ball bounces maintain the new speed setting

### Scenario 4: Speed adjustment with edge cases

- **Given** the game is in the Active state
- **and Given** the ball has recently bounced off the paddle
- **When** the player adjusts the slider to 25% (slow speed)
- **Then** the ball velocity magnitude immediately reduces
- **and Then** the ball does not snap to a new position (only magnitude changes)
- **and Then** the next bounce event reflects the reduced speed

### Scenario 5: Speed slider persists across life losses

- **Given** the player has set ball speed to 80% (fast)
- **and Given** the ball passes below the paddle and a life is lost
- **When** the ball resets to the starting position
- **Then** the ball launches again at 80% speed (fast)
- **and Then** the slider position remains at 80%

## Related Slices

- Slice 2: Ball Physics Engine
- Slice 6: Speed Adjustment and UI Controls
