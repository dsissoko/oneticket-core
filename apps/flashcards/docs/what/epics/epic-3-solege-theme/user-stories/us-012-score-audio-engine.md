---
title: 'US-012 — ScoreAudioEngine Tone.js Audio Playback'
---

# US-012 — ScoreAudioEngine Tone.js Audio Playback

## Story

As a learner, I want the answer side of a solfège card to display the music score AND play the notes in the browser so that I can hear the sound while seeing the notation.

## Expected Behavior

When the learner flips a solfège card, `ScoreAudioEngine.render(data, target)` injects the same VexFlow SVG as `ScoreEngine` AND triggers Tone.js audio playback. The flip tap constitutes the required user gesture to start the Web Audio API `AudioContext`.

`precompute(data)` is called by `SessionScreen` after question display and pre-schedules the Tone.js sequence in the background. It is idempotent — calling it multiple times for the same data has no side effects. Audio playback is NOT triggered inside `precompute` — only inside `render`.

The engine is registered under the ID `score-audio` in the engine registry.

```typescript
class ScoreAudioEngine implements RenderEngine {
  render(data: ScoreData, target: HTMLElement): void  // SVG injection + triggers audio play
  precompute(data: ScoreData): Promise<void>          // pre-schedules notes, idempotent
}
```

## Acceptance Criteria

- `ScoreAudioEngine` class implements `RenderEngine` interface
- `render(data, target)` injects VexFlow SVG AND plays notes via Tone.js
- `precompute(data)` pre-schedules the Tone.js sequence; idempotent
- Audio playback starts inside `render()` — NOT inside `precompute()`
- Engine registered as `score-audio` in `main.tsx`
- `SessionScreen` precompute lifecycle compatible — no changes to SessionScreen required
- Build passes with `npm run build`

## Related Epic

[Epic 3 — Solfège Theme](epic-3-solege-theme/epic.md)

## Related Sprints

[Sprint 3 — Solfège Theme](sprint-3-solege-theme/sprint.md)
