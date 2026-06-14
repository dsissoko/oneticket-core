---
title: 'Product Specification — Opération Jungle'
---

# Product Specification — Opération Jungle

Opération Jungle — sauvez les animaux des jets de feu de la boule rouge dans ce jeu d'arcade accessible clavier et tactile.

## 1. Vision

Opération Jungle is a browser-based 2D arcade game where players rescue animals from fire jets shot by a red ball. The game combines simple, intuitive controls with progressive difficulty to deliver a fun and accessible experience on both desktop and mobile platforms.

## 2. Users and Actors

| Actor | Description |
|---|---|
| Player (Desktop) | Uses keyboard arrow keys to move animals left-to-right across the jungle terrain to avoid fire jets. |
| Player (Mobile) | Uses touch drag gestures to move animals left-to-right across the jungle terrain to avoid fire jets. |

## 3. Problems to Solve

- Players want a fun, instantly playable arcade game that works in any modern browser without downloads.
- Players need a game that is equally enjoyable on desktop (keyboard) and mobile (touch) devices.
- Players seek progressive difficulty that keeps them engaged without feeling overwhelmed.
- Players enjoy a lighthearted animal rescue theme with clear feedback on their performance.

## 4. Product Goals

- Deliver a complete, playable arcade game in V1 with start screen, gameplay loop, and scoring.
- Support both keyboard and touch controls with responsive design.
- Provide adjustable difficulty via a speed slider for the red ball.
- Create a satisfying gameplay loop with clear win/lose conditions and score tracking.

## 5. Out of Scope (V1)

- Multiplayer or competitive modes.
- Leaderboards or online score persistence.
- Sound effects and music.
- Animated animal sprites (static or simple representations are sufficient for V1).
- Multiple levels or environments.
- Power-ups or special abilities.
- Account creation or user profiles.

## 6. Business Concepts

| Concept | Description |
|---|---|
| Animal | A rescueable creature that traverses the jungle terrain from left to right. Each animal type has a specific HP value. |
| Fire Jet | A projectile shot by the red ball in sprinkler-like patterns. Each hit removes 1 HP from the animal it contacts. |
| Red Ball | An automated enemy positioned at the top-center of the screen that continuously fires fire jets. |
| Jungle Terrain | The play area occupying the bottom 20% of the screen where animals move and fire jets land. |
| HP (Health Points) | A numeric value representing how many fire jet hits an animal can withstand before disappearing. |
| Score | Points earned when an animal reaches the right edge, equal to the animal's remaining HP. |
| Speed Slider | A control on the start screen that adjusts the red ball's fire rate from -2x to +2x normal speed. |

## 7. Product Capabilities

### 7.1 Start Screen
- Display game title and visual introduction.
- Provide a speed slider to adjust the red ball's fire rate from -2x to +2x normal speed.
- Offer a "Start" button to begin the game.
- Indicate control scheme (keyboard arrows for desktop, touch drag for mobile).

### 7.2 Red Ball & Fire Jets
- Red ball is positioned at the top-center of the screen.
- Automatically shoots fire jets in sprinkler-like patterns onto the jungle terrain.
- Fire rate is determined by the speed slider setting chosen at start.
- Fire jets travel downward and land on the jungle terrain (bottom 20% of screen).

### 7.3 Animal Movement & Rescue
- Animals appear successively from the left side of the jungle terrain.
- Player moves animals left-to-right across the jungle terrain.
- Desktop: movement controlled via keyboard arrow keys.
- Mobile: movement controlled via touch drag gestures.
- When an animal reaches the right edge, it is considered "saved" and the player earns points.

### 7.4 Scoring & Game End
- Points are awarded when an animal reaches the right edge, equal to its remaining HP.
- The next animal appears after the current one is saved or disappears.
- The game ends when all animals have either been saved or have disappeared.
- Final score is displayed at game end.

## 8. High-Level Workflows

### 8.1 Game Start Flow
1. Player opens the game in a browser.
2. Start screen is displayed with title, speed slider, and control instructions.
3. Player adjusts the speed slider to their preferred difficulty.
4. Player clicks/taps "Start" to begin the game.

### 8.2 Gameplay Loop
1. An animal appears on the left side of the jungle terrain.
2. The red ball continuously fires fire jets in sprinkler patterns.
3. Player moves the animal left-to-right to avoid fire jets.
4. Fire jet hits reduce the animal's HP by 1 per hit.
5. If HP reaches 0, the animal disappears and no points are awarded.
6. If the animal reaches the right edge, points equal to remaining HP are awarded.
7. The next animal appears, and the loop continues.

### 8.3 Game End Flow
1. All animals have been processed (saved or lost).
2. Final score is displayed to the player.
3. Option to restart the game is offered.

## 9. Business Rules

| Rule ID | Description |
|---|---|
| BR-001 | Animals appear successively from the left side of the jungle terrain. |
| BR-002 | Each animal type has a fixed HP value: Lion = 20, Mouse = 5, Girafe = 15, Elephant = 25. |
| BR-003 | Each fire jet hit removes exactly 1 HP from the contacted animal. |
| BR-004 | An animal disappears (is lost) when its HP reaches 0. |
| BR-005 | When an animal reaches the right edge of the screen, the player earns points equal to the animal's remaining HP. |
| BR-006 | The next animal appears only after the current animal is saved (reaches right edge) or disappears (HP = 0). |
| BR-007 | The game ends when all animals in the sequence have either been saved or have disappeared. |
| BR-008 | The red ball's fire rate is determined by the speed slider setting chosen on the start screen (-2x to +2x normal speed). |
| BR-009 | The jungle terrain occupies the bottom 20% of the screen. |
| BR-010 | The red ball is positioned at the top-center of the screen. |

## 10. Success Criteria

- The game loads and is playable in a modern browser within 3 seconds.
- Both keyboard and touch controls respond with less than 100ms latency.
- The speed slider correctly adjusts fire jet frequency across its full range.
- Scoring accurately reflects remaining HP when animals reach the right edge.
- The game is fully playable on both desktop and mobile viewports.
- Players can complete a full game session (all animals processed) without errors.

## 11. Open Questions

- What is the total number of animals in a game session? Is it fixed or infinite until the player chooses to stop?
- What is the order/sequence of animals? Random, fixed pattern, or difficulty-based progression?
- Should there be a visual indicator of remaining HP on each animal during gameplay?
- Is there a time limit per animal, or do they move at a constant speed until saved or destroyed?
- Should the fire jet patterns change over time to increase difficulty?
- What happens on game end — is there a simple score display, or a more detailed summary (animals saved vs. lost)?
