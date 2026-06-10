---
title: 'Sprint 3 — Solfège Theme'
---

# Sprint 3 — Solfège Theme

This sprint introduces the bilingual solfège flashcard theme: a `ScoreEngine` that renders VexFlow SVG music notation on the question side, a `ScoreAudioEngine` that renders the same SVG and plays the notes via Tone.js on the answer side, a 21-card bilingual dataset (7 notes × 3 durations), and full ThemePicker integration. Dependencies `vexflow ^4.2.2` and `tone ^15.0.4` are installed.

This sprint directly depends on Epic 1 (RenderEngine Refactoring, issue #1125) — the precompute lifecycle in `SessionScreen` is already in place.

## Cross-references

- Epic: [Epic 3 — Solfège Theme](epic-3-solege-theme/epic.md)
- US-011 — [US-011 — ScoreEngine VexFlow SVG Rendering](us-011-score-engine.md) — pending
- US-012 — [US-012 — ScoreAudioEngine Tone.js Audio Playback](us-012-score-audio-engine.md) — pending
- US-013 — [US-013 — Solfège Dataset: 21 Cards Bilingual](us-013-solege-dataset.md) — pending
- US-014 — [US-014 — Solfège Theme Integration in ThemePicker](us-014-solege-theme-picker.md) — pending
- ADR: [ADR-001 — VexFlow for SVG Music Score Rendering](adr-001-vexflow-svg-rendering.md)
- ADR: [ADR-002 — Tone.js for Browser Audio Playback](adr-002-tonejs-audio-playback.md)

---

## Technical Notes

### Architecture Decisions

This sprint introduces two new RenderEngines — `ScoreEngine` and `ScoreAudioEngine` — that extend the pluggable RenderEngine architecture established in Sprint 1 (Epic 1, issue #1125).

Two ADRs govern the technical choices for this sprint:

- **[ADR-001 — VexFlow for SVG Music Score Rendering](../adr-001-vexflow-svg-rendering.md)** — VexFlow `^4.2.2` is selected for synchronous SVG injection. Its `render(data, target)` contract aligns directly with `RenderEngine.render()`. No canvas, no async.
- **[ADR-002 — Tone.js for Browser Audio Playback](../adr-002-tonejs-audio-playback.md)** — Tone.js `^15.0.4` is selected for Web Audio API abstraction. `precompute` pre-schedules the note sequence; `render` starts Transport. The flip tap constitutes the required user gesture.

Both dependencies are already declared in `apps/flashcards/app/package.json`.

---

### ScoreEngine — Implementation Guidance (US-011)

**File:** `apps/flashcards/app/src/engine/ScoreEngine.ts`

`ScoreEngine` implements `RenderEngine` synchronously — no `precompute` needed.

**VexFlow 4.x API recipe:**

```typescript
import { Renderer, Stave, Voice, Formatter, StaveNote } from 'vexflow';

class ScoreEngine implements RenderEngine {
  render(data: ScoreData, target: HTMLElement): void {
    // 1. Clear previous content
    target.innerHTML = '';

    // 2. Create Renderer with SVG backend
    const renderer = new Renderer(target, Renderer.Backends.SVG);
    renderer.resize(300, 150);
    const context = renderer.getContext();

    // 3. Create a Stave (staff with clef)
    const stave = new Stave(10, 20, 280);
    stave.addClef(data.clef);
    stave.setContext(context).draw();

    // 4. Build StaveNote array from ScoreData
    const staveNotes = data.notes.map(
      ({ note, duration }) =>
        new StaveNote({ keys: [noteToVexKey(note)], duration })
    );

    // 5. Create a Voice and add notes
    const voice = new Voice({ num_beats: staveNotes.length, beat_value: 4 });
    voice.addTickables(staveNotes);

    // 6. Format and render
    new Formatter().joinVoices([voice]).format([voice], 260);
    voice.draw(context, stave);
  }
}
```

**`ScoreData` interface** (defined in `apps/flashcards/app/src/engine/ScoreEngine.ts` and re-exported):

```typescript
interface ScoreData {
  clef: 'treble' | 'bass'
  notes: Array<{ note: string; duration: string }>
}
```

Note names use VexFlow format: `C4`, `D4`, `E4`, `F4`, `G4`, `A4`, `B4`.
Duration values: `"w"` (whole/ronde), `"h"` (half/blanche), `"q"` (quarter/noire).

VexFlow key format requires a `/` separator: `noteToVexKey("C4")` → `"c/4"`.

**Clearing and re-injecting SVG:** Always set `target.innerHTML = ''` before calling `new Renderer(target, ...)`. VexFlow appends an `<svg>` element into the target — clearing first prevents duplicate SVG elements on re-render.

---

### ScoreAudioEngine — Implementation Guidance (US-012)

**File:** `apps/flashcards/app/src/engine/ScoreAudioEngine.ts`

`ScoreAudioEngine` implements both `render` and `precompute`.

**`precompute(data)` — pre-schedule the Tone.js sequence:**

```typescript
import * as Tone from 'tone';

async precompute(data: ScoreData): Promise<void> {
  // Idempotency: stop and reset Transport before re-scheduling
  Tone.getTransport().stop();
  Tone.getTransport().cancel();

  // Build time-offset note array for Tone.Part
  const notes = data.notes.map((n, i) => ({
    time: i * Tone.Time(durationToTone(n.duration)).toSeconds(),
    note: n.note,         // e.g. "C4"
    duration: durationToTone(n.duration),  // e.g. "1n", "2n", "4n"
  }));

  // Schedule via Tone.Part (idempotent — previous Transport.cancel() cleared it)
  const synth = new Tone.Synth().toDestination();
  const part = new Tone.Part((time, value) => {
    synth.triggerAttackRelease(value.note, value.duration, time);
  }, notes);
  part.start(0);

  this._synth = synth;
  this._part = part;
}
```

Duration mapping for Tone.js: `"w"` → `"1n"`, `"h"` → `"2n"`, `"q"` → `"4n"`.

**`render(data, target)` — inject SVG and start audio:**

```typescript
render(data: ScoreData, target: HTMLElement): void {
  // 1. Inject VexFlow SVG (same as ScoreEngine)
  this._scoreEngine.render(data, target);

  // 2. Unlock AudioContext — MUST be called inside a user gesture handler
  Tone.start();  // resolves suspended AudioContext

  // 3. Start Transport — the flip IS the user gesture
  Tone.getTransport().start();
}
```

**Key rules:**
- `Tone.start()` inside `render()` — this is the user gesture unlock. Never call it inside `precompute()`.
- `Tone.getTransport().stop()` + `Tone.getTransport().cancel()` in `precompute()` ensures idempotency — safe to call multiple times for the same card.
- Audio NEVER plays inside `precompute()` — this is a hard contract constraint (see ADR-002).
- `ScoreAudioEngine` can delegate SVG rendering to an internal `ScoreEngine` instance to avoid code duplication.

---

### Engine Registration in main.tsx (US-011, US-012)

Add two engine registrations in `main()` in `apps/flashcards/app/src/main.tsx`, after the existing `text` and `markdown` registrations:

```typescript
import { ScoreEngine } from '@/engine/ScoreEngine';
import { ScoreAudioEngine } from '@/engine/ScoreAudioEngine';

// Inside main():
engineRegistry.register('score', ScoreEngine);
engineRegistry.register('score-audio', ScoreAudioEngine);
```

The `engineRegistry` is already instantiated and used for `text` and `markdown` — no structural changes needed.

---

### Dataset Structure — solfege.json (US-013)

**File:** `apps/flashcards/app/src/data/themes/solfege.json`

The dataset contains exactly 21 cards: 7 notes × 3 durations. All cards are in treble clef.

Card ID pattern: `<note-fr>-<duration-en>` — e.g. `do-whole`, `re-half`, `si-quarter`.

Note FR → VexFlow mapping: `do→C4`, `ré→D4`, `mi→E4`, `fa→F4`, `sol→G4`, `la→A4`, `si→B4`.

Duration EN → VexFlow duration: `whole→"w"`, `half→"h"`, `quarter→"q"`.

Example card structure:
```json
{
  "id": "do-whole",
  "front": {
    "renderEngineId": "score",
    "data": { "clef": "treble", "notes": [{ "note": "C4", "duration": "w" }] }
  },
  "back": {
    "renderEngineId": "score-audio",
    "data": { "clef": "treble", "notes": [{ "note": "C4", "duration": "w" }] }
  }
}
```

Front and back `data` objects are identical — same clef, same notes. The engine IDs differ: `"score"` (question, SVG only) vs `"score-audio"` (answer, SVG + audio).

---

### Bilingual Note Display (US-013, US-014)

The card front renders a VexFlow SVG (via `ScoreEngine`). The bilingual label — e.g. `do / C`, `ré / D`, `mi / E` — is not part of the SVG itself. It is stored as supplementary metadata in the dataset and displayed by `FlashcardDisplay` as a text subtitle beneath the SVG.

The `ScoreData` object does not carry the label — the card object carries it at the root level or as a `label` field alongside `front`/`back`. Implementation options:

1. Add a top-level `"label": "do / C"` field to each card in `solfege.json` — `FlashcardDisplay` reads it and renders below the engine output.
2. Encode the label inside `ScoreData` as an optional `label` field — `ScoreEngine.render()` appends a `<text>` SVG element.

**Recommended approach:** Option 1 (top-level `label` field) — keeps `ScoreData` focused on notation data and requires no changes to the engine contract.

Full FR/EN bilingual mapping for labels:
`do / C`, `ré / D`, `mi / E`, `fa / F`, `sol / G`, `la / A`, `si / B`

---

### ThemePicker Registration (US-014)

**File:** `apps/flashcards/app/src/hooks/useTheme.ts`

Import `solfege.json` and add it to the `themes` array:

```typescript
import solfegeTheme from '@/data/themes/solfege.json';

// Inside useTheme — add to themes array:
const themes = [...existingThemes, solfegeTheme];
```

The theme name displayed in `ThemePicker` comes from the top-level `"name"` field in `solfege.json`. Use `"Solfège"` for both FR and EN (consistent bilingual label as specified in US-014).

---

### Existing Tests — No Changes Required

All existing test files in `apps/flashcards/app/src/` are unaffected by this sprint:
- `useTheme.test.ts` — no modifications needed; the test suite validates existing themes, new theme adds to the array without breaking existing assertions
- `SessionScreen.test.tsx` — the `precompute` lifecycle is already tested; `ScoreAudioEngine` plugs in without changes to `SessionScreen`
- No test files for other themes should be modified

New test files to create (not modify): `ScoreEngine.test.ts`, `ScoreAudioEngine.test.ts` — these are new files owned by `@leaddev`/`@dev`.

---

### Related Architecture Links

- [architecture.md — RenderEngine Architecture](../architecture.md#renderengine-architecture)
- [architecture.md — ScoreData Interface](../architecture.md#scoredata-interface)
- [architecture.md — ScoreAudioEngine Audio Lifecycle](../architecture.md#scoreaudioengine--audio-lifecycle)
- [ADR-001 — VexFlow for SVG Music Score Rendering](../adr-001-vexflow-svg-rendering.md)
- [ADR-002 — Tone.js for Browser Audio Playback](../adr-002-tonejs-audio-playback.md)
