---
title: 'Epic 0 — MVP Opération Jungle'
---

# Epic 0 — MVP Opération Jungle

## Goal

Deliver a playable arcade game where players rescue animals from fire jets shot by a red ball, with a complete gameplay loop: start screen, animal movement controls, health system, scoring, and animal sequence progression.

## Business Value

Engaging, accessible game with simple controls and clear scoring — works on both desktop and mobile. Provides an instantly playable browser-based arcade experience with progressive difficulty via a speed slider.

## Scope

- **Start Screen** — game title, speed slider (-2x to +2x fire rate), start button, control scheme instructions (keyboard arrows for desktop, touch drag for mobile).
- **Red Ball & Fire Jets** — red ball positioned at top-center, auto-firing fire jets in sprinkler-like patterns onto the jungle terrain (bottom 20% of screen). Fire rate controlled by speed slider.
- **Animal Movement Controls** — animals appear successively from the left. Keyboard arrow keys (desktop) and touch drag gestures (mobile) move animals left-to-right across the jungle terrain.
- **Animal Health System** — 4 animals with distinct HP values: Lion = 20, Mouse = 5, Girafe = 15, Elephant = 25. Each fire jet hit removes 1 HP. Animal disappears at 0 HP.
- **Scoring System** — points awarded when an animal reaches the right edge, equal to its remaining HP. Final score displayed at game end.
- **Animal Sequence Progression** — animals appear one at a time. Next animal appears after current one is saved or lost. Game ends when all animals have been processed.

## Related User Stories

- [US-001 — Game Start and Speed Configuration](us-001-game-start-and-speed.md)
- [US-002 — Red Ball Automatic Fire Jets](us-002-red-ball-fire-jets.md)
- [US-003 — Animal Movement Controls](us-003-animal-movement-controls.md)
- [US-004 — Animal Health and Scoring System](us-004-animal-health-and-scoring.md)
- [US-005 — Animal Sequence and Game Progression](us-005-animal-sequence-and-game-progression.md)

## Related Sprints

- [Sprint 1 — Jungle MVP](sprint-1-jungle-mvp/sprint.md)
