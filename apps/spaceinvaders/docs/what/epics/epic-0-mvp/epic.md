# Epic 0 — MVP Space Invaders

## Goal

Deliver a complete, playable Space Invaders game with all core mechanics: enemy formation movement, player controls, shields, enemy fire, collision detection, scoring, and wave progression. Game must run at 60 FPS with responsive controls on desktop and mobile platforms.

## Business Value

- Establishes Space Invaders as a playable product in the OneTicket ecosystem
- Validates React + Canvas architecture for arcade game implementation
- Provides foundation for future arcade game features and ports
- Demonstrates cross-platform responsive game design

## Scope

This epic covers the minimum viable Space Invaders implementation:

- Game initialization and start screen
- 11×5 enemy formation with movement and edge detection
- Player cannon with dual input methods (keyboard + touch)
- Four destructible shields with segment degradation
- Enemy fire system with collision detection
- AABB collision detection for all game objects
- Scoring system with multiplier logic
- Game state management (Start, Playing, Victory, Game Over)
- Wave progression with lives reset and speed scaling

## Related User Stories

- [US-001 — Game Setup](us-001-game-setup.md)
- [US-002 — Enemy Formation Movement](us-002-enemy-formation-movement.md)
- [US-003 — Player Controls](us-003-player-controls.md)
- [US-004 — Destructible Shields](us-004-destructible-shields.md)
- [US-005 — Enemy Fire System](us-005-enemy-fire-system.md)
- [US-006 — Collision Detection & Scoring](us-006-collision-detection-scoring.md)
- [US-007 — Game States & Wave Progression](us-007-game-states-wave-progression.md)

## Related Slices

- [Slice 1 — Foundation](slice-1-foundation/slice.md)
- [Slice 2 — Enemy Formation & Rendering](slice-2-enemies/slice.md)
- [Slice 3 — Player Control & Firing](slice-3-player/slice.md)
- [Slice 4 — Destructible Shields](slice-4-shields/slice.md)
- [Slice 5 — Collision Detection & Resolution](slice-5-collision/slice.md)
- [Slice 6 — Enemy Fire System](slice-6-enemy-fire/slice.md)
- [Slice 7 — Mystery Ship & Bonus Encounters](slice-7-bonus/slice.md)
- [Slice 8 — Wave Progression & Difficulty Scaling](slice-8-waves/slice.md)
