---
title: Space Invaders — Product Specification
---

# Space Invaders — Product Specification

<!-- SITE_DESCRIPTION: Classic 2D arcade Space Invaders game built with React+Vite+TypeScript and Canvas API, deployed on GitHub Pages. -->

## 1. Vision

Build a faithful browser-based recreation of the classic Space Invaders arcade game with modern responsive design and touch controls.

## 2. Users and Actors

- **Single Player** — desktop users (keyboard: arrow keys + space) and mobile users (touch: swipe to move, tap to fire).

## 3. Problems to Solve

- No browser-based Space Invaders game with proper responsive layout, mobile touch support, and progressive shield degradation.

## 4. Product Goals

- Authentic arcade experience
- Responsive canvas scaling
- Mobile touch zones
- Score persistence via localStorage

## 5. Out of Scope

- UFO bonus ship
- Multiple high scores or leaderboard
- HTML overlays (everything via Canvas API ctx)
- External game frameworks (no Phaser, no Pixi.js)

## 6. Business Concepts

| Concept | Description |
|---------|-------------|
| Player Cannon | Movable ship at the bottom of the screen, controlled by keyboard or touch |
| Alien Wave | 5×11 grid of aliens moving in unison left/right with periodic downward drops |
| Shields | 4 destructible barriers between cannon and aliens that absorb projectiles from both sides |
| Projectiles | Player missiles (upward) and alien fire (downward, random) |
| Score | Points earned per alien destroyed |
| Best Score | Highest score achieved, persisted in localStorage |
| Game State | State machine: menu → playing → game over / victory → restart |

## 7. Product Capabilities

- Player cannon movement (keyboard + touch)
- Alien wave (5×11 grid) with left/right/drop movement
- Dual projectile system (player missiles up, alien random fire down)
- 4 destructible shields with progressive degradation
- Scoring system
- Game state machine (menu → playing → game over/victory → restart)
- Best score persistence

## 8. High-Level Workflows

1. Player opens game → sees menu screen
2. Player starts game → enters playing state
3. Player controls cannon to destroy aliens (keyboard or touch)
4. Victory: all aliens destroyed → victory screen displayed
5. Game Over: cannon hit → game over screen displayed
6. Player can restart from victory or game over screen

## 9. Business Rules

1. Alien grid is 5 rows × 11 columns, rendered as a single sprite.
2. Wave moves left/right, dropping one row when a boundary is hit.
3. 4 shields positioned between cannon and aliens.
4. Shields absorb projectiles from both sides (player and alien).
5. Shields show progressive visual degradation on each impact.
6. A shield is destroyed after 10 impacts.
7. Player has 1 life — cannon hit = game over.
8. Score increments per alien destroyed.
9. Best score is persisted in localStorage.
10. Reload delay is configurable (default 0ms, max 5000ms).
11. Wave width ≈ 70% of canvas width on all screens.
12. Mobile touch zones: fire zone (top 80%), movement zone (bottom 20%).

## 10. Success Criteria

- All aliens destroyed triggers victory screen.
- Cannon hit triggers game over screen.
- Game responsive on all viewports.
- Best score persists across sessions.

## 11. Open Questions

None at this time.
