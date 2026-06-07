---
title: 'Product Specification — SpaceInvaders MVP'
---

# Product Specification — SpaceInvaders MVP

<!-- SITE_DESCRIPTION: SpaceInvaders is a responsive arcade game MVP with alien waves, shields, cannon controls, and persistent best score. -->

## 1. Vision

Deliver a playable Space Invaders MVP inside the AppShell scaffold with desktop and mobile interactions, clear win/lose states, and score tracking.

## 2. Users and Actors

- Player (desktop)
- Player (mobile)
- Browser localStorage (best score persistence)

## 3. Problems to Solve

- Provide a complete and responsive Space Invaders gameplay loop in the existing app shell.
- Keep controls usable across keyboard and touch devices without virtual buttons.
- Preserve a best score across sessions to support replay motivation.

## 4. Product Goals

- Ship a functional Space Invaders MVP with a 5×11 alien wave, cannon, shields, and missiles.
- Ensure consistent gameplay structure across desktop and mobile layouts.
- Display current score and persisted best score in the HUD.

## 5. Out of Scope

- UFO bonus ship
- Multiple high scores
- Leaderboard

## 6. Business Concepts

- Alien wave: 5 rows × 11 columns using a single alien sprite.
- Cannon: player entity at the bottom line.
- Missile: projectile from cannon or aliens.
- Shield: defensive block with durability and progressive degradation.
- Score: current session points.
- Best score: highest score stored in localStorage.

## 7. Product Capabilities

- Wave movement pattern: horizontal sweep, edge bounce, row drop, direction switch.
- Random downward alien shooting.
- Cannon movement and fire with configurable reload delay (default 0ms, max 5000ms).
- Four shields between cannon and aliens, each with 10 impact durability.
- Missile destruction on shield impact.
- End states:
  - Game Over on cannon hit by alien missile.
  - Game Over when aliens reach cannon line.
  - Victory when all aliens are destroyed.
- End screen displays final score and Restart action.
- HUD with current score (top-left) and best score (top-right).

## 8. High-Level Workflows

1. Player starts a run.
2. Wave advances and aliens randomly fire.
3. Player moves cannon and shoots.
4. Missiles collide with aliens, shields, or cannon.
5. Score updates during play; best score updates when surpassed.
6. On victory or game over, final score is shown and player can restart.

## 9. Business Rules

- Alien grid is always 5×11.
- Wave width remains approximately 70% of screen width across formats.
- Cannon can fire multiple simultaneous missiles.
- Reload delay is configurable with bounds [0ms, 5000ms].
- Exactly 4 shields are present.
- Each shield supports 10 total impacts from either side.
- Shield hit always destroys the impacting missile.
- No virtual mobile buttons: touch gestures only.
- Canvas fills available GameScreen area inside AppShell.

## 10. Success Criteria

- Player can complete full game loop (start, play, win/lose, restart).
- Desktop controls (←, →, Space) work as expected.
- Mobile zones work as expected: top 80% tap to fire, bottom 20% drag to move.
- HUD always shows current score and persisted best score.
- Responsive behavior preserves 5×11 wave and proportional sizing.

## 11. Open Questions

- What scoring values apply per alien destroyed?
- What are default movement speed and fire frequency values for initial balancing?
- Should restart preserve or reset any runtime difficulty variables beyond score?
