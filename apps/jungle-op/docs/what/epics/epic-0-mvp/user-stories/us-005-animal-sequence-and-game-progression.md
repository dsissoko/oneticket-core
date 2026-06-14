---
title: 'US-005 — Animal Sequence and Game Progression'
---

# US-005 — Animal Sequence and Game Progression

## Story

As a player, I want animals to appear one after another in sequence, so that there is a clear progression through all animals to save.

## Expected Behavior

Animals appear in a fixed sequence from the left: Lion → Mouse → Girafe → Elephant. Each new animal appears only after the previous one has either been saved (reached right edge) or disappeared (0 HP). The game tracks which animals have been saved vs failed. The game ends when all 4 animals have been processed.

## Acceptance Criteria

- Given the game has started, When the first animal appears, Then it is the Lion on the left side
- Given the Lion has been saved or disappeared, When the next animal appears, Then it is the Mouse
- Given all 4 animals have been processed, When the game ends, Then a summary screen shows saved vs failed animals and total score
- Given I am playing, When I check the current animal, Then I can see which animal is next in the sequence

## Related Epic

[Epic 0 — MVP Opération Jungle](epic-0-mvp/epic.md)

## Related Sprints

