# Breakout — Arcade Game

<!-- SITE_DESCRIPTION: A modern arcade-style breakout game built with AppShell, featuring brick destruction, collision physics, and classic gameplay mechanics. -->

## 1. Vision

Create a modern implementation of the classic Breakout arcade game using AppShell as the foundation. Deliver a polished, fast-paced gaming experience with smooth physics, responsive controls, and engaging progression through levels.

## 2. Users and Actors

- **Casual Players** — Users seeking quick, engaging arcade gameplay with minimal learning curve
- **Game Engine** — HTML5 Canvas, collision detection, physics simulation
- **Game Loop** — Frame-based rendering and state updates

## 3. Problems to Solve

- Players need a modern, web-based version of the classic Breakout game
- Require smooth, responsive gameplay with accurate collision detection
- Need clear feedback on game state (lives, score, brick destruction)
- Must support intuitive control (paddle movement, ball physics)

## 4. Product Goals

1. Deliver a fully playable Breakout game with classic gameplay mechanics
2. Implement smooth collision detection between ball, paddle, and bricks
3. Support multiple lives and clear win/lose conditions
4. Enable smooth, responsive paddle control with adjustable speed
5. Provide visual feedback for game events (brick destruction, ball collision, game over)

## 5. Out of Scope

- Multiplayer gameplay
- Complex level editors or procedural generation
- Advanced graphics, particle effects, or animations beyond core mechanics
- Sound/audio implementation
- Online persistence or leaderboards

## 6. Business Concepts

- **Ball** — The projectile that bounces off the paddle, bricks, and walls
- **Paddle** — Player-controlled entity that blocks the ball from falling
- **Brick** — Destructible game objects arranged in patterns; destroyed on ball collision
- **Level** — Organized arrangement of bricks; completion leads to next level
- **Lives** — Number of ball losses allowed before game over (3 default)
- **Game State** — Playing, Paused, Game Over, Victory

## 7. Product Capabilities

- **Brick Destruction Gameplay** — Paddle bounces ball to destroy bricks; all bricks destroyed = victory
- **Collision Detection** — Accurate detection between ball and paddle, bricks, and level boundaries
- **Lives System** — Players start with 3 lives; lose one when ball falls below paddle
- **Paddle Speed Control** — Adjustable slider to control paddle movement speed
- **Game Over Detection** — Automatic game over when all lives exhausted
- **Victory Detection** — Automatic level completion when all bricks destroyed
- **Smooth Movement** — Frame-based rendering ensures responsive, fluidly moving paddle and ball

## 8. High-Level Workflows

### Game Initialization
1. Load game engine with AppShell foundation
2. Initialize paddle at bottom center
3. Initialize ball at paddle position
4. Arrange bricks in grid pattern
5. Set lives to 3
6. Enter Playing state

### Ball in Play
1. Ball moves continuously with constant velocity
2. Detect collisions with paddle, bricks, and walls
3. Update velocity on collision
4. Destroy brick on ball contact
5. Apply paddle speed modifier from slider

### Game Over Workflow
1. Detect condition: all lives lost OR all bricks destroyed
2. If all bricks destroyed → Victory state, show win message
3. If all lives lost → Game Over state, show lose message
4. Offer restart option

## 9. Business Rules

1. **Lives** — Game starts with exactly 3 lives; one life lost when ball passes paddle
2. **Ball Velocity** — Ball moves at constant speed; direction changes only on collision
3. **Paddle Speed** — Speed adjustable via slider (0.5x to 2.0x base speed)
4. **Brick Destruction** — Each brick destroyed exactly once per game; collision removes brick and reverses ball Y velocity
5. **Collision Detection** — Ball-to-brick, ball-to-paddle, and ball-to-wall collisions are mutually exclusive per frame
6. **Game Over** — Game ends immediately when lives reach 0 or all bricks destroyed
7. **Ball Reset** — After life loss, ball resets to paddle position before resuming play
8. **Boundary Behavior** — Ball bounces off top and side walls; falls through bottom (triggers life loss)

## 10. Success Criteria

- Players can smoothly move paddle left/right with slider control
- Ball bounces accurately off paddle, bricks, and walls
- Bricks are destroyed on collision and removed from board
- Lives count decreases correctly when ball is lost
- Game recognizes victory (all bricks destroyed) and game over (no lives remaining)
- Paddle speed adjustment responds immediately to slider changes
- Gameplay runs at 60 FPS with no stuttering or lag

## 11. Open Questions

- Should paddle have maximum/minimum size constraints?
- How should ball velocity increase or change across levels?
- Should brick hardness (multiple hits to destroy) be supported?
- Is pause/resume functionality required?
- Should score/leaderboard be part of MVP?
