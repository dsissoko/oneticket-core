# Epic 0 — MVP Breakout

## Goal

Deliver a fully playable Breakout arcade game in vanilla JavaScript where a player can control a paddle to bounce a ball, destroy a wall of bricks, manage their lives, and experience complete game states (menu, gameplay, victory, defeat) with adjustable difficulty.

## Business Value

Provides a complete, engaging arcade experience with zero external dependencies. Players enjoy responsive controls, predictable ball physics, and clear game states. The adjustable speed setting accommodates different skill levels and preferences.

## Scope

### Core Gameplay
- Ball rendering and movement with physics-based bouncing
- Paddle rendering and keyboard control (left/right arrows)
- Brick wall rendering (5 rows of destructible bricks)
- Collision detection and resolution (ball-wall, ball-ceiling, ball-paddle, ball-brick)
- Brick destruction on collision
- Life management (3 lives initial, decrement on ball loss, display remaining)
- Game state management (menu, active, victory, defeat)

### User Interface & Menus
- Main menu with buttons (Start, Settings, Quit)
- Settings menu with ball speed slider (very slow → very fast)
- Gameplay HUD displaying remaining lives and brick count
- Victory screen with replay/quit options
- Game Over screen with replay/quit options

### Controls & Input
- Keyboard input for paddle movement (arrow keys)
- Mouse input for menu navigation (buttons and slider)
- Slider for adjustable ball speed

### Configuration & Tuning
- Paddle dimensions and positioning
- Ball initial velocity and speed multiplier from slider
- Brick layout (5 rows, columns per row)
- Initial life count (3)
- Canvas/viewport dimensions and scaling

## Out of Scope (V1)

- Score or point system
- Level progression or additional levels
- Sound effects or music
- Advanced animations
- Multiplayer functionality
- Progress persistence or save states
- Enemy AI or power-ups
- Pause/resume mechanics
- Fullscreen mode

## Status

🟡 In Progress

## Related User Stories

- [US-001 — Game Initialization and Menu](user-stories/us-001-game-initialization-menu.md)
- [US-002 — Paddle Rendering and Keyboard Control](user-stories/us-002-paddle-control.md)
- [US-003 — Ball Physics and Collision Detection](user-stories/us-003-ball-physics.md)
- [US-004 — Brick Rendering and Destruction](user-stories/us-004-brick-destruction.md)
- [US-005 — Life Management and Game States](user-stories/us-005-life-states.md)
- [US-006 — Settings Menu and Speed Configuration](user-stories/us-006-settings-speed.md)

## Related Slices

- [Slice 1 — Canvas Setup and Rendering Foundation](../../how/slices/slice-1-canvas-setup.md)
- [Slice 2 — Paddle and Keyboard Input](../../how/slices/slice-2-paddle-input.md)
- [Slice 3 — Ball Physics and Wall Collision](../../how/slices/slice-3-ball-physics.md)
- [Slice 4 — Brick Grid and Ball-Brick Collision](../../how/slices/slice-4-brick-collision.md)
- [Slice 5 — Game State Machine and Menus](../../how/slices/slice-5-game-states.md)
- [Slice 6 — Life Tracking and Victory/Defeat Conditions](../../how/slices/slice-6-life-tracking.md)
