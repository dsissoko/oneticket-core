---
title: 'US-011 — ScoreEngine VexFlow SVG Rendering'
---

# US-011 — ScoreEngine VexFlow SVG Rendering

## Story

As a learner, I want the question side of a solfège card to display a music score rendered as SVG so that I can practice reading musical notation visually.

## Expected Behavior

When a solfège card is shown on the question side, `ScoreEngine.render(data, target)` injects a valid VexFlow SVG into the target element. The SVG shows a treble or bass clef with the correct notes at the correct durations. Rendering is synchronous — no async required. The engine is registered under the ID `score` in the engine registry.

`ScoreData` is:
```typescript
interface ScoreData {
  clef: 'treble' | 'bass'
  notes: Array<{ note: string; duration: string }>
}
```

Note name mapping (FR → VexFlow):
- do → C4, ré → D4, mi → E4, fa → F4, sol → G4, la → A4, si → B4

Duration mapping:
- whole (ronde) → "w", half (blanche) → "h", quarter (noire) → "q"

## Acceptance Criteria

- `ScoreEngine` class implements `RenderEngine` interface
- `render(data: ScoreData, target: HTMLElement)` injects valid VexFlow SVG synchronously
- Engine registered as `score` in `main.tsx`
- VexFlow SVG is injected — not a canvas or other element
- Build passes with `npm run build`

## Related Epic

[Epic 3 — Solfège Theme](epic-3-solege-theme/epic.md)

## Related Sprints

[Sprint 3 — Solfège Theme](sprint-3-solege-theme/sprint.md)
