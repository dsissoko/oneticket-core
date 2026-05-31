# Epic 0 — MVP Breakout

## Goal

Deliver a fully playable Breakout game with authentic arcade mechanics, responsive paddle control, and smooth ball physics on modern web browsers.

## Business Value

- Bring the classic Breakout arcade game to web platforms
- Provide players with an engaging, low-latency 2D arcade experience
- Establish foundation for future difficulty levels, themes, and social features
- Validate game mechanics and player engagement before post-MVP enhancements

## Scope

**In Scope (V1 Complete):**
- Game engine with physics simulation (velocity, bouncing, delta-time updates)
- AABB collision detection (ball vs. walls, paddle, bricks, boundaries)
- Ball physics with realistic reflection angles off paddle and walls
- Paddle control (arrow keys / A-D) with smooth, frame-responsive movement
- Destructible brick wall (5 rows × 10 columns = 50 bricks total)
- Life system (3 lives; lose 1 when ball exits bottom)
- Win/Loss conditions (Victory: all bricks destroyed; Defeat: 0 lives)
- In-game menu with speed slider, Start button, Quit button
- Menu screen transitions and replay/quit options
- 60 FPS rendering with frame-rate independent physics

**Out of Scope (Post-MVP):**
- Persistent high scores or leaderboards
- Multiple difficulty levels or themed layouts
- Power-ups or special effects
- Sound and music
- Mobile touch controls
- Pause/resume mid-game

## Related User Stories

- [US-002 — Paddle Control](user-stories/us-002-paddle-control.md)

<!-- @analyst fills this section — write filename only, no relative path, no ../
     US files are always in user-stories/ subfolder — never flat in the epic directory
     The build script resolves the correct path automatically.
     Component User Stories (to be created by next task):
     - [US-001 — Game Engine Setup](user-stories/us-001-game-engine-setup.md)
     - [US-003 — Ball Physics & Collision Detection](user-stories/us-003-ball-physics-collision.md)
     - [US-004 — Brick Destruction & Game State](user-stories/us-004-brick-destruction-game-state.md)
     - [US-005 — Menu & Game Flow](user-stories/us-005-menu-game-flow.md)
-->

## Acceptance Criteria

- **Game Initialization**
  - ✓ Application loads and displays menu with Start button, speed slider, Quit button
  - ✓ Default ball speed is set to medium
  - ✓ Player can adjust speed slider before game start

- **Gameplay Mechanics**
  - ✓ Ball bounces realistically off all colliders (walls, paddle, bricks) with correct reflection angles
  - ✓ Paddle responds within 1 frame to keyboard input (arrow keys / A-D)
  - ✓ All 50 bricks (5×10 grid) are destroyable and disappear immediately on impact
  - ✓ Ball velocity is constant in magnitude; direction changes on collision only
  - ✓ Ball reflects off paddle with angle variation based on hit location

- **Life & Game State**
  - ✓ Player starts with exactly 3 lives
  - ✓ Life decremented when ball exits bottom; ball resets to center after life loss
  - ✓ Game over triggered when lives reach 0
  - ✓ Victory triggered when all bricks destroyed

- **Performance & Polish**
  - ✓ Game loop runs at 60 FPS with consistent frame timing
  - ✓ Collision detection completes in <1 ms per frame
  - ✓ No jank during paddle movement or brick destruction
  - ✓ Menu is intuitive and mouse-driven
  - ✓ Game starts within 500 ms of clicking Start
  - ✓ Clear visual feedback on brick destruction and life loss
  - ✓ Win/Loss screens clearly communicate game outcome

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
