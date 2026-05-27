# Product Specification

## 1. Vision

Breakout is a vanilla JavaScript arcade game that delivers classic gameplay without external dependencies. Players enjoy accessible, retro-style entertainment with responsive controls and straightforward game mechanics.

## 2. Users and Actors

**Primary User**: Gamers seeking classic arcade entertainment
- Wants: Quick, fun, dependency-free arcade gameplay
- Uses: Keyboard (arrow keys) and mouse for interaction

## 3. Problems to Solve

- Limited access to lightweight, dependency-free arcade games
- Need for entertaining browser-based games without complex setup
- Lack of accessible retro gaming experiences

## 4. Product Goals

1. Deliver a fully playable Breakout arcade game using vanilla JavaScript
2. Provide responsive, intuitive paddle and ball mechanics
3. Enable accessible gameplay for casual players
4. Maintain zero external dependencies

## 5. Out of Scope

- Multiplayer functionality
- Network or online leaderboards
- Level progression systems
- Advanced graphics or animations
- Mobile touch controls (V1)
- Sound effects or music

## 6. Business Concepts

- **Game Session**: A single playthrough from start to game over
- **Lives**: Player health mechanic; player loses on reaching zero lives
- **Paddle**: Player-controlled horizontal bar at bottom of screen
- **Ball**: Bouncing projectile that destroys bricks and ends lives if missed
- **Brick**: Destructible gameplay element; destroying all bricks wins the game
- **Game Over**: Terminal state reached by losing all lives or winning

## 7. Product Capabilities

### V1 Capabilities

1. **Game Board with Brick Wall**
   - Display playfield with 5 rows of destructible bricks
   - Clear visual distinction of breakable elements

2. **Ball and Physics**
   - Bouncing ball that responds to collisions
   - Rebounds from walls, ceiling, and paddle
   - Adjustable speed via slider control (very slow to very fast)

3. **Paddle Control**
   - Player controls paddle using left/right arrow keys only
   - Smooth horizontal movement across bottom of screen

4. **Lives System**
   - Player starts with 3 lives
   - Loses 1 life when ball reaches bottom of screen
   - Game ends when lives reach zero

5. **Win/Lose Conditions**
   - Win: Destroy all bricks
   - Lose: Exhaust all 3 lives

6. **Interactive Menu**
   - Start Game button
   - Replay/Restart button
   - Quit/Exit button
   - Mouse-controlled menu navigation

7. **Ball Speed Control**
   - Slider to adjust ball speed
   - Range: Very slow to very fast
   - Affects gameplay difficulty and pace

## 8. High-Level Workflows

**Start Game**
1. Player clicks "Start" from menu
2. Game initializes with 5 rows of bricks, paddle at center, ball in ready position
3. Gameplay begins

**During Gameplay**
1. Player moves paddle with arrow keys (left/right)
2. Ball bounces off walls, ceiling, paddle, and bricks
3. Hitting brick destroys it and updates score/board state
4. Ball reaching bottom: lose 1 life, ball resets to ready position
5. If lives > 0: resume gameplay
6. If lives = 0 or all bricks destroyed: end game

**End Game and Menu**
1. Display win/lose screen
2. Offer Replay or Quit options
3. Return to menu on selection

## 9. Business Rules

- **Input**: Only arrow keys (left/right) control paddle; mouse reserved for menus
- **Lives**: Start with 3; decrement by 1 when ball exits bottom; game ends at 0
- **Physics**: Ball rebounds predictably from walls, ceiling, raquette, and bricks
- **No Progression**: V1 has single difficulty level; no multi-level campaigns
- **Simplicity**: Vanilla JavaScript only; no external frameworks or libraries

## 10. Success Criteria

- [ ] Game launches and displays playfield with 5 rows of bricks
- [ ] Paddle responds to arrow key input with smooth movement
- [ ] Ball bounces correctly off all surfaces (walls, ceiling, paddle, bricks)
- [ ] Destroying a brick removes it from the board
- [ ] Ball reaching bottom triggers loss of life and ball reset
- [ ] Game ends correctly on losing all lives (game over) or destroying all bricks (win)
- [ ] Menu buttons (Start, Replay, Quit) function correctly
- [ ] Ball speed slider affects game pace from very slow to very fast
- [ ] Game runs smoothly without lag or visual glitches
- [ ] No external dependencies; pure vanilla JavaScript/HTML/CSS

## 11. Open Questions

- Should paddle speed be adjustable alongside ball speed?
- What visual feedback (colors, animations) indicates brick destruction?
- Should there be a score/counter for bricks destroyed?
- What is the optimal default ball speed for initial gameplay?
- Should the game persist state (resume after accidental close)?
