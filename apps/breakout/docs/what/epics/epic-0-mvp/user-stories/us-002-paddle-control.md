# US-002 — Paddle Control

## Story

As a player
I want to control the paddle exclusively with left/right keyboard arrows
So that I can hit the ball and keep it in play

## Expected Behavior

### Input Handling
- **Left Arrow Key**: Paddle moves left at constant speed when pressed and held
- **Right Arrow Key**: Paddle moves right at constant speed when pressed and held
- **Boundary Constraints**: Paddle stops at left and right screen edges; does not wrap or move beyond boundaries
- **Game State Dependency**: Paddle only responds to input when game state is "Playing"; no movement during Menu, Victory, or Defeat states

### Event Listeners
- `keydown` event listener tracks when arrow keys are pressed
- `keyup` event listener stops paddle movement when keys are released
- Listeners are attached to the `window` or `document` for global input coverage
- Both left and right arrow keys can be pressed simultaneously without conflicts

## Acceptance Criteria

### When I press the left arrow key
Given the game is running (Playing state)
When I press the left arrow key
Then the paddle moves left at the configured speed

### When I press the right arrow key
Given the game is running (Playing state)
When I press the right arrow key
Then the paddle moves right at the configured speed

### When paddle reaches left boundary
Given the paddle is at the left boundary
When I press left arrow
Then the paddle does not move further left

### When paddle reaches right boundary
Given the paddle is at the right boundary
When I press right arrow
Then the paddle does not move further right

### When game is paused or not playing
Given the game is in Menu, Victory, or Defeat state
When I press arrow keys
Then nothing happens (paddle does not move)

## Technical Details

### Input Handling Implementation
- Maintain a set or object of currently pressed keys to handle simultaneous key presses
- Update paddle position each frame based on which keys are currently held
- Use frame-independent movement: `paddle.x += paddleSpeed * deltaTime * direction`

### Paddle Bounds Checking
- Check paddle position against screen boundaries after calculating new position
- Apply clamping: `paddle.x = Math.max(0, Math.min(paddle.x, canvasWidth - paddleWidth))`
- Ensure paddle never renders partially off-screen

### State Dependency
- Query current game state before processing input
- Only update paddle position when `gameState === 'Playing'`
- Allow input listeners to remain active but guard the movement logic

## Related Epic

[Epic 0 — MVP Breakout](epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

## Estimation

**Story Points: 3**

**Justification:**
- Low complexity: input event listeners and paddle position updates are straightforward
- Clear acceptance criteria tied directly to game mechanics
- Boundary checking and state-dependent logic add minor complexity but are well-defined
- Estimated effort: ~2–4 hours for implementation, testing, and integration with game loop
