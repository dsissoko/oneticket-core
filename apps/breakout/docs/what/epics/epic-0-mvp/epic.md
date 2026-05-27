# Epic 0 — Breakout MVP

## Goal

Deliver a fully playable Breakout arcade game in vanilla JavaScript (HTML/CSS/JS, no external dependencies) — from menu to game over — with responsive keyboard controls, ball physics, brick destruction, life management and adjustable ball speed.

## Business Value

Provides a complete, self-contained retro gaming experience accessible directly in any modern browser without installation or dependencies.

## Scope

**In scope:**
- Game board with 5-row brick wall, ball, paddle and 3-life system
- Ball physics — bouncing off walls, ceiling and paddle
- Paddle control with left/right keyboard arrows
- Brick destruction on ball collision
- Life loss when ball reaches bottom — game over when 0 lives
- Victory detection when all bricks destroyed
- Ball speed slider accessible from menu (very slow to very fast)
- Menu system — start, replay, quit — mouse navigation

**Out of scope:**
- Multi-level progression
- Power-ups or special brick types
- Sound and music
- Mobile/touch controls
- Persistent scoring or leaderboards

## Related User Stories

- [US-001 — Game Setup](./user-stories/us-001-game-setup)
- [US-002 — Paddle Control](./user-stories/us-002-paddle-control)
- [US-003 — Ball Physics](./user-stories/us-003-ball-physics)
- [US-004 — Brick Destruction](./user-stories/us-004-brick-destruction)
- [US-005 — Ball Speed Control](./user-stories/us-005-ball-speed-control)
- [US-006 — Game Menus](./user-stories/us-006-game-menus)

## Related Slices

See `how/slices/` for implementation slices derived from this epic.
