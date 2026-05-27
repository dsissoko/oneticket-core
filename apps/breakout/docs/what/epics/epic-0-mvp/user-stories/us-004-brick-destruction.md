# US-004 — Brick Destruction and State Management

## Story

- **Summary:** Destroy bricks on ball collision to enable core gameplay progression

### Use Case:
- **As a** player
- **I want to** have bricks disappear when the ball hits them
- **so that** I can progress through the game and work toward winning by clearing all bricks

## Expected Behavior

When the ball collides with a brick:
1. The brick is immediately removed from the game board
2. The remaining bricks remain in their original positions
3. The brick count decreases by one
4. The ball continues moving after collision without additional collision penalties
5. Players see visual feedback confirming the brick destruction

## Acceptance Criteria

### Scenario 1: Ball collides with a single brick
- **Given:** The game is active and running
- **and Given:** There are 5 rows of bricks on the board
- **and Given:** The ball is in motion
- **When:** The ball collides with a brick
- **Then:** The brick is visually removed from the board immediately
- **and Then:** The brick count decreases by one
- **and Then:** The ball continues moving in the opposite direction from the collision point

### Scenario 2: Player clears multiple bricks in sequence
- **Given:** The game is active with multiple bricks available
- **and Given:** The player has successfully cleared 5 bricks already
- **and Given:** 20 bricks remain on the board
- **When:** The ball hits another brick
- **Then:** The brick is removed
- **and Then:** The brick count now shows 19 remaining
- **and Then:** Adjacent bricks remain unaffected

### Scenario 3: Ball collides with corner of a brick
- **Given:** The game is active
- **and Given:** The ball is approaching a brick at an angle
- **When:** The ball hits the corner of a brick
- **Then:** The brick is destroyed
- **and Then:** The ball bounces correctly based on the collision surface

### Scenario 4: Multiple bricks destroyed (no overlap)
- **Given:** The game is active with multiple bricks
- **and Given:** Several bricks are arranged in the grid
- **When:** The ball collides with the first brick and then with a second brick (in sequence)
- **Then:** Both bricks are removed from the board
- **and Then:** The brick count decreases to reflect both destroyed bricks
- **and Then:** The game continues until all bricks are destroyed or lives are lost

## Related Slices

- [Slice 3 — Collision Detection System](../../../how/slices/slice-3-collision-detection/slice.md)
- [Slice 4 — Brick Destruction and Visual Feedback](../../../how/slices/slice-4-brick-destruction/slice.md)
