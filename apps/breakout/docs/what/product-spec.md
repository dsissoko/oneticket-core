# Breakout — Product Specification

<!-- A vanilla JavaScript arcade game where players destroy bricks with a bouncing ball and keyboard controls -->

## 1. Vision

Breakout is a classic arcade-style game where a player controls a paddle to bounce a ball and destroy all bricks on screen. The game combines simple, accessible mechanics with engaging gameplay and offers adjustable difficulty via ball speed control. It serves as a demonstration of core game development concepts: physics simulation, collision detection, user input handling, and state management—all built with vanilla JavaScript, HTML, and CSS without external dependencies.

## 2. Users and Actors

- **Player**: An end user engaging with the game, navigating menus with the mouse and controlling the paddle with keyboard arrow keys
- **System**: The game engine managing physics, collision detection, ball movement, brick destruction, and game state transitions

## 3. Problems to Solve

- Players need a responsive, enjoyable arcade game experience with clear visual feedback
- Players require straightforward controls (keyboard for gameplay, mouse for menus)
- Players need the ability to adjust game difficulty to match their skill level
- Players need to understand game state clearly (lives remaining, win/loss condition)
- The system must handle ball physics, collision detection, and state transitions reliably without external libraries

## 4. Product Goals

1. Deliver a fully playable, self-contained arcade game in vanilla JavaScript
2. Provide intuitive controls: arrow keys for paddle movement, mouse for navigation
3. Enable difficulty adjustment via a ball speed slider
4. Maintain clear game state feedback: lives counter, win/loss screens
5. Ensure smooth, responsive gameplay without external dependencies

## 5. Out of Scope

- Level progression or multiple difficulty levels
- High score tracking or persistent data storage (beyond MVP)
- Power-ups or special abilities
- Sound or music
- Mobile touch controls (keyboard/mouse only)
- Leaderboards or multiplayer features
- Custom themes or visual customization

## 6. Business Concepts

### Core Entities

**Brick**
- Location on grid (x, y)
- Active/destroyed state
- Destruction triggers score and brick count updates

**Ball**
- Position (x, y) on screen
- Velocity (vx, vy) determining direction and speed
- Collision detection with walls, ceiling, paddle, and bricks
- Respawns or ends game if below screen boundary

**Paddle**
- Horizontal position controlled by player
- Confined to playable area
- Collision point for ball deflection

**Game State**
- Current lives (starts at 3)
- Number of remaining bricks
- Win condition: all bricks destroyed
- Loss condition: no lives remaining
- Paused/active status

### Key Relationships

- Ball bounces off: walls, ceiling, paddle, bricks
- Ball loss: ball reaches bottom of screen → decrease lives
- Brick destruction: ball collides with brick → remove brick, update count
- Game end: lives = 0 (loss) OR bricks = 0 (win)

## 7. Product Capabilities

1. **Game Board Setup**
   - 5 rows of bricks arranged in a grid
   - Playable area with bounded dimensions
   - Paddle centered at bottom

2. **Ball Physics**
   - Continuous motion with constant velocity
   - Bouncing on vertical walls (left/right boundaries)
   - Bouncing on ceiling (top boundary)
   - Bouncing on paddle with angle adjustment based on hit location
   - Speed controlled by player slider (very slow to very fast)

3. **Paddle Control**
   - Movement via left/right arrow keys
   - Confined to playable boundaries
   - No vertical movement

4. **Brick Destruction**
   - Ball collision with brick removes brick
   - Visual feedback on removal
   - Brick count updates

5. **Life Management**
   - Start with 3 lives
   - Lose one life when ball passes below paddle
   - Ball resets to starting position after life loss
   - Game over when lives = 0

6. **Game States**
   - Menu: Start game, adjust settings, quit
   - Active: Gameplay, paddle control, ball physics
   - Pause: Suspended gameplay
   - Win: All bricks destroyed, offer replay
   - Loss: No lives remaining, offer replay

7. **Speed Adjustment**
   - Slider control (UI element) ranges from very slow to very fast
   - Affects ball velocity magnitude
   - Adjustable before game starts and during play

## 8. High-Level Workflows

### Happy Path: Win Game
1. Player opens game, clicks "Start"
2. Ball launches, player controls paddle with arrow keys
3. Ball bounces, destroying bricks on impact
4. Player prevents ball from falling by moving paddle
5. All bricks destroyed → victory screen
6. Player clicks "Play Again" to restart with new brick layout

### Happy Path: Game Over
1. Player opens game, clicks "Start"
2. Ball falls below paddle → life lost
3. Repeat until lives = 0
4. Game over screen appears
5. Player clicks "Play Again" to restart

### Alternative: Adjust Speed
1. Player moves speed slider left (slower) or right (faster)
2. Ball velocity updates immediately
3. Player continues gameplay or starts new game

### Alternative: Quit to Menu
1. Player clicks "Menu" or "Quit" button
2. Game returns to title screen

## 9. Business Rules

1. **Ball Initialization**: Ball starts at paddle center, moves upward with initial velocity
2. **Collision Detection**: Ball bounces off walls, ceiling, paddle, and bricks; collision is instantaneous (no overlap)
3. **Paddle Hit Angle**: Ball angle changes based on where it hits the paddle (left edge = left angle, right edge = right angle, center = straight up)
4. **Brick Destruction**: Any ball contact with brick removes it; removal is permanent until game restart
5. **Life Loss**: Ball crossing the bottom boundary (y > screen height) costs one life and resets ball to start
6. **Game Over**: When lives = 0, no further gameplay; must restart
7. **Victory**: When bricks remaining = 0, game ends in victory regardless of lives remaining
8. **Speed Range**: Ball speed slider must keep ball velocity within playable range (not so fast it's uncontrollable, not so slow it's unengaging)
9. **Paddle Bounds**: Paddle cannot move beyond left or right screen edges
10. **Frame-Based Physics**: Ball position updates every frame based on velocity; no time-delta needed (fixed frame rate assumed)

## 10. Success Criteria

1. All bricks visible, arranged in 5 rows
2. Ball bounces correctly off all surfaces (walls, ceiling, paddle, bricks)
3. Paddle responds immediately to arrow key input (left/right)
4. Speed slider adjusts ball velocity smoothly
5. Brick collision correctly removes brick and updates display
6. Lives counter decrements on ball loss; game ends at 0 lives
7. Win screen appears when all bricks destroyed
8. Menu buttons (Start, Play Again, Quit) function correctly
9. No console errors or visual glitches
10. Game runs smoothly without external dependencies (vanilla JS, HTML, CSS only)

## 11. Open Questions

1. What is the exact brick grid layout (spacing, size)?
2. What is the ideal ball speed range for the slider (min/max velocity)?
3. Should the paddle size be fixed or adjustable?
4. Does the ball angle change vary based on paddle hit location, or always bounce straight up?
5. Should there be a delay/reset animation when a life is lost, or immediate ball reset?
6. Are there specific color schemes or visual styling guidelines for the game board?
7. Should pause be available during gameplay, or only before start?
