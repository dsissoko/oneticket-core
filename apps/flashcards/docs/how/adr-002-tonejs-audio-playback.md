---
title: 'ADR-002 — Tone.js for Browser Audio Playback'
---

# ADR-002 — Tone.js for Browser Audio Playback

The Solfège theme answer side must play the rendered notes in the browser. A library decision is needed for Web Audio API abstraction that integrates with the `precompute`/`render` lifecycle of the `RenderEngine` interface.

## Options Considered

### Option A — Tone.js (`tone ^15.0.4`)
| Pros | Cons |
|------|------|
| High-level Web Audio API abstraction | Adds ~100KB to bundle |
| Supports pre-scheduling note sequences (fits `precompute` contract) | AudioContext requires user gesture (browser constraint — not a library limitation) |
| Active maintenance, TypeScript types included | |
| `Part` / `Sequence` API enables idempotent note pre-scheduling | |
| Used by thousands of music browser apps | |

### Option B — Web Audio API (native)
| Pros | Cons |
|------|------|
| Zero external dependency | Very verbose API for note scheduling |
| Full control | Timing precision requires manual scheduling |
| | No high-level note/duration abstraction |

### Option C — Howler.js
| Pros | Cons |
|------|------|
| Simple audio playback API | Requires pre-recorded audio files (not synthesis) |
| Wide browser support | No note synthesis — incompatible with dynamic data |

## Decision

**Option A — Tone.js** — Tone.js provides the cleanest fit for the `precompute`/`render` contract: `precompute` pre-schedules the Tone.js `Part`, and `render` triggers `Tone.Transport.start()`. The idempotent pre-scheduling aligns with the session preload lifecycle already implemented in `SessionScreen`. The Web Audio `AudioContext` user-gesture constraint is handled naturally by the flip gesture triggering `render()`.

## Consequences

- `tone ^15.0.4` added to `apps/flashcards/app/package.json`
- `ScoreAudioEngine.precompute(data)` pre-schedules the Tone.js sequence — idempotent
- `ScoreAudioEngine.render(data, target)` triggers audio playback — MUST be called after a user gesture (flip tap)
- Audio does NOT play inside `precompute()` — this is a hard constraint
- `TextEngine` and `MarkdownEngine` are unaffected — Tone.js is only imported by `ScoreAudioEngine`
- Tree-shaking ensures Tone.js is not bundled for non-solfège sessions
