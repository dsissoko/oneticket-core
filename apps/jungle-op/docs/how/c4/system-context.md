---
title: 'C4 System Context — Opération Jungle'
---

# C4 System Context — Opération Jungle

System context diagram for Opération Jungle, a browser-based arcade game.

```mermaid
C4Context
  title System Context — Opération Jungle

  Person(player, "Player", "Human playing the arcade game")
  System(jungle_op, "Opération Jungle", "Browser-based arcade game — keyboard/touch input, visual/audio feedback")

  Rel(player, jungle_op, "Plays via keyboard/touch input")
  Rel(jungle_op, player, "Renders visuals & plays audio feedback")

  UpdateLayoutConfig($c4ShapeInRow="2")
```

## Notes

- **Fully client-side** — no backend, no external services, no databases.
- The Player interacts with Opération Jungle through **keyboard** (desktop) or **touch** (mobile) input.
- The game responds with **visual rendering** and **audio feedback** directly in the browser.
- Status: **current** — this is the V1 architecture.
