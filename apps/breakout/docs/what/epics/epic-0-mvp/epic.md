---
title: 'Epic 0 — MVP Breakout'
---

# Epic 0 — MVP Breakout

## Goal

Deliver a fully playable Breakout arcade game in vanilla JavaScript where players can:
- Play a complete game from start to finish
- Win by destroying all bricks
- Lose when they run out of lives
- Restart or quit the game at any time
- Adjust game difficulty via a speed slider

## Business Value

Provide players with an accessible, nostalgic arcade experience with simple mechanics and responsive gameplay. The game establishes a solid foundation for future enhancements (levels, power-ups, scoring systems) while remaining pure and dependency-free.

## Scope

### In Scope

**Game Core Mechanics**
- Ball physics with collision detection against walls, ceiling, paddle, and bricks
- Paddle movement controlled via keyboard (← →)
- Brick destruction on ball contact
- Life management system (3 lives per game)
- Game state transitions (menu → playing → end screen)

**User Controls & Interface**
- Start menu with "Start Game" button
- Speed slider (before and during gameplay) affecting ball velocity
- Game over and victory screens with "Restart" and "Quit" options
- Real-time display of lives remaining and bricks remaining

**Game Layout**
- 5 rows of bricks (layout and count TBD with PO)
- Paddle positioned at bottom of play area with boundary constraints
- Ball bounces with angle reflection (simple law of reflection)
- Walls at sides, ceiling at top

**Initial State**
- Player starts with 3 lives
- All bricks initialized at game start
- Ball rests on paddle until player initiates play (keyboard or click)
- Speed slider defaults to mid-range

### Out of Scope

- Level progression or dynamic difficulty scaling
- Power-ups or special falling objects
- Multiplayer or competitive modes
- Persistent score storage or leaderboards
- 3D graphics or advanced animations
- Audio or background music
- Score point accumulation (v1.0)
- Responsive design for mobile/tablet

## Success Criteria

- [x] Playable Breakout game in vanilla JavaScript without external dependencies
- [x] Ball bounces correctly on all surfaces (walls, ceiling, paddle, bricks)
- [x] Keyboard controls (← →) move paddle smoothly without lag
- [x] Lives decrease correctly when ball falls below paddle
- [x] All bricks destroyed triggers victory screen
- [x] Zero lives remaining triggers game over screen
- [x] Speed slider adjusts ball velocity in real-time
- [x] Menu buttons (Start, Restart, Quit) respond to mouse clicks
- [x] Game state displays lives, remaining bricks, and game status
- [x] Code is well-structured, readable, and maintainable

## Related User Stories

- US-001 — Initialize Game Board
- US-002 — Implement Ball Physics and Collision
- US-003 — Control Paddle with Keyboard
- US-004 — Manage Lives and Game Over
- US-005 — Destroy Bricks and Detect Victory
- US-006 — Implement Speed Control Slider
- US-007 — Build Menu and Game State Screens
- US-008 — Display Game Status in Real-Time

## Related Slices

- Slice 0: Game initialization and rendering pipeline
- Slice 1: Ball physics and collision detection
- Slice 2: Paddle control and boundary handling
- Slice 3: Life management and game over detection
- Slice 4: Brick destruction and victory detection
- Slice 5: Speed slider and game state management
- Slice 6: UI menus and screen transitions
