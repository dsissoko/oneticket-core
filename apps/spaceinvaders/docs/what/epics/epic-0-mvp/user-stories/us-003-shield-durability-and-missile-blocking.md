---
title: 'US-003 — Shield Durability and Missile Blocking'
---

# US-003 — Shield Durability and Missile Blocking

## Story

As a player, I want shields that absorb damage and degrade visually, so that I can use tactical protection during the wave.

## Expected Behavior

- Exactly 4 shields are placed between cannon and alien wave.
- Each shield withstands 10 impacts from either cannon or alien missiles.
- Shield visuals degrade progressively with damage.
- Any missile hitting a shield is destroyed on impact.

## Acceptance Criteria

```gherkin
Scenario: Shield count and placement
  Given a new game starts
  Then exactly 4 shields are present between cannon and aliens

Scenario: Durability and destruction behavior
  Given a shield has remaining durability
  When a cannon or alien missile collides with it
  Then the missile is destroyed
  And shield durability decreases by 1

Scenario: Visual degradation
  Given a shield has taken multiple impacts
  Then its rendered state reflects progressive damage
```

## Related Epic

- [Epic 0 — SpaceInvaders MVP Gameplay Loop](epic-0-mvp/epic.md)

## Related Slices

To be linked during slicing.
