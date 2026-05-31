# Product Specification — Breakout

<!-- SITE_DESCRIPTION: Classic arcade game where players destroy bricks by bouncing a ball with a paddle, with 3 lives and increasing difficulty. -->

## 1. Vision

Breakout is a faithful recreation of the classic arcade game that brings timeless gameplay to the web. Players control a paddle to bounce a ball and destroy a wall of bricks, testing their reflexes and strategy across progressively challenging levels.

## 2. Users and Actors

- **Arcade Game Player** — user who enjoys classic 2D arcade games and wants a web-based Breakout experience
- **Game System** — provides game loop, physics simulation, collision detection, and game state management

## 3. Problems to Solve

- Players lack access to the classic Breakout arcade game on modern web platforms
- Existing implementations often miss authentic arcade mechanics (collision detection, ball physics, responsive paddle control)
- Players need a simple yet engaging game that respects the original gameplay

## 4. Product Goals

- Deliver a fully playable Breakout game with authentic arcade mechanics
- Provide responsive, low-latency paddle control and ball physics
- Enable customizable game difficulty through in-game menu (ball speed slider)
- Maintain a retro arcade aesthetic while running smoothly on modern browsers

## 5. Out of Scope

- Persistent high scores or leaderboards
- Multiple difficulty levels or themed brick layouts
- Power-ups or special effects
- Sound and music
- Mobile touch controls (keyboard-only in V1)

## 6. Business Concepts

### Game Entities

| Entity | Definition |
|--------|-----------|
| **Ball** | Circular object that bounces off paddle and bricks; reflects at edges; lost when descends below screen |
| **Paddle** | Horizontal bar controlled by player; bounces incoming ball upward |
| **Brick** | Individual destructible block in wall; removed on collision with ball |
| **Brick Wall** | 5 rows × 10 columns grid of bricks; total destruction = victory |
| **Life** | Player resource; 3 total; decremented when ball exits bottom; 0 lives = game over |
| **Game State** | Playing, Victory (all bricks destroyed), Defeat (0 lives remaining) |

### Game Flow States

- **Menu** — startup state; display start button, speed slider, quit button
- **Playing** — ball bouncing, paddle responding to input, collision detection active
- **Victory** — all bricks destroyed; display victory screen with replay option
- **Defeat** — lives exhausted; display game over screen with replay option

## 7. Product Capabilities

### V1 Capabilities

1. **Game Engine with Physics**
   - Ball physics: velocity, position, bouncing off walls and objects
   - AABB (Axis-Aligned Bounding Box) collision detection between ball, paddle, bricks, and screen boundaries
   - Delta-time-based update loop using `requestAnimationFrame` for frame-rate independence

2. **Paddle Control**
   - Arrow keys (left/right) or A/D keys to move paddle horizontally
   - Smooth, responsive paddle movement constrained to screen bounds

3. **Destructible Brick Wall**
   - 5 rows × 10 columns layout
   - Bricks destroyed on collision with ball
   - Visual feedback (brick disappears immediately on impact)

4. **Life System**
   - Start with 3 lives
   - Lose 1 life when ball exits bottom of screen
   - Ball resets to center and paddle resets after each life loss
   - Game over when lives reach 0

5. **Win/Loss Conditions**
   - **Victory** — all bricks destroyed → display victory screen
   - **Defeat** — 0 lives remaining → display game over screen
   - Both states allow player to replay or quit

6. **In-Game Menu (Main Screen)**
   - Horizontal slider to adjust ball speed (slow → fast range)
   - Start button to begin game
   - Quit button to close game
   - Visual indication of selected speed

7. **Menu Navigation**
   - Mouse-driven buttons for Start, Replay, Quit
   - Slider interaction with mouse for speed adjustment

## 8. High-Level Workflows

### Game Initialization Flow
```
1. Application loads
2. Menu rendered with default ball speed (medium)
3. Player adjusts speed slider if desired
4. Player clicks Start → Game begins
```

### Gameplay Loop
```
1. Ball moves according to velocity and delta time
2. Check collisions:
   - Ball vs. walls → reflect velocity
   - Ball vs. paddle → reflect and adjust angle
   - Ball vs. bricks → remove brick, reflect velocity
   - Ball vs. bottom → lose 1 life
3. Update brick count
4. Check win/loss state
5. Render all entities
6. Repeat until game ends
```

### Game Over Flow
```
1. Victory: all bricks destroyed → Victory screen
2. Defeat: 0 lives → Defeat screen
3. Player clicks Replay → Reset to Menu
4. Player clicks Quit → Return to Menu
```

## 9. Business Rules

1. **Ball Physics**
   - Ball velocity is constant in magnitude; direction changes on collision
   - Ball reflects off screen boundaries (top, left, right) at 180° to impact vector
   - Ball reflects off paddle with angle variation based on paddle hit location (center vs. edges)
   - Ball exits bottom edge → life lost (not reflected)

2. **Paddle Behavior**
   - Paddle moves only horizontally within screen bounds
   - Paddle position does not wrap; stops at left/right edges
   - Paddle moves at constant speed (not physics-based)

3. **Brick Destruction**
   - Each brick requires exactly 1 ball collision to destroy
   - Destroyed bricks are removed from game state and not rendered
   - Collision with a brick removes the brick and reflects the ball

4. **Collision Detection**
   - AABB algorithm: check overlap in X and Y axes
   - Collision resolution: push ball to edge of collider and reflect velocity
   - Order of checks: walls → paddle → bricks (top-to-bottom sorting for brick grid)

5. **Life Management**
   - Player starts with exactly 3 lives
   - Ball lost → life decremented immediately; ball resets to center; game resumes
   - Game ends only when lives reach 0 (not before)

6. **Win Condition**
   - Victory triggered when brick count reaches 0
   - Victory prevents further ball movement and renders victory screen
   - Game waits for Replay or Quit action

7. **Difficulty Adjustment**
   - Ball speed is adjustable via slider in menu (before game start)
   - Speed value affects ball velocity magnitude only
   - Changed speed applies to next game start, not during gameplay

## 10. Success Criteria

- **Functionality**
  - ✓ Ball bounces realistically off all colliders with correct reflection angles
  - ✓ Paddle responds within 1 frame to keyboard input
  - ✓ All 50 bricks (5×10) are destroyable and disappear on impact
  - ✓ Life system works: 3 lives, loss on ball exit, game over at 0
  - ✓ Victory on 0 remaining bricks; Defeat on 0 remaining lives
  - ✓ Speed slider adjusts ball velocity; takes effect on game restart

- **Performance**
  - ✓ Game loop runs at 60 FPS with consistent frame timing
  - ✓ No jank during paddle movement or brick destruction
  - ✓ Collision detection completes in <1 ms per frame

- **User Experience**
  - ✓ Menu is intuitive and mouse-driven
  - ✓ Game starts within 500 ms of clicking Start
  - ✓ Paddle feels responsive to player input
  - ✓ Clear visual feedback on brick destruction and life loss
  - ✓ Win/Loss screens clearly communicate game outcome

## 11. Open Questions

- Should ball angle off paddle vary based on hit location (edge vs. center)? → *Likely yes for arcade authenticity*
- Should bricks have different colors per row or all uniform? → *Recommend row-based coloring for visual clarity*
- Should game pause support be included in V1? → *Recommend as post-MVP nice-to-have*
- Should there be a high-score display? → *Out of scope for V1; localStorage-based in future*
