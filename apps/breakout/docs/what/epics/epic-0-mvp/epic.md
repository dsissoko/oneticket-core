# Epic 0 — MVP Breakout

## Goal

Deliver a fully playable Breakout game with complete core gameplay mechanics including brick destruction, collision detection, lives system, and adjustable paddle speed.

## Business Value

Establish a solid foundation for the Breakout arcade game with all essential mechanics functional. Players can experience a complete game loop from start to finish with proper collision handling, lives management, and game state transitions.

## Scope

Playable Breakout game with complete gameplay (bricks, collision, lives, adjustable speed).

### Core Features
- Canvas initialization and game loop setup
- Paddle and ball rendering with continuous movement
- Brick grid layout and rendering
- Collision detection (ball-paddle, ball-bricks, ball-walls)
- Lives tracking and game over detection
- Victory detection when all bricks destroyed
- Paddle speed adjustment via slider control (0.5x to 2.0x)

### Out of Scope
- Multiplayer gameplay
- Advanced animations or particle effects
- Sound/audio
- Level progression or procedural generation
- Score/leaderboard systems
- Pause/resume functionality

## Related User Stories

[US-001 — Initialize Canvas and Game Loop](user-stories/us-001-initialize-canvas.md)

[US-002 — Implement Collision Detection and Brick Destruction](user-stories/us-002-collision-detection.md)

[US-003 — Implement Lives System and Game Over Detection](user-stories/us-003-lives-system.md)

[US-004 — Add Paddle Speed Control Slider](user-stories/us-004-paddle-speed-slider.md)

## Related Slices

[Slice 1 — Foundation (Canvas & Game Loop)](slice-1-foundation/slice.md)

[Slice 2 — Physics (Collision & Rebounds)](slice-2-physics/slice.md)

[Slice 3 — Game States & Lives](slice-3-game-states/slice.md)
