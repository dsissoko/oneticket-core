---
title: Rendering Analysis — Existing Themes Before Solfège
---

# Rendering Analysis — What to Code for Existing Themes

## Context

This document answers: **What rendering should be coded for existing themes before working on Solfège?**

**Answer: YES — rendering must be implemented for existing themes first.** This validates the architecture with simple text rendering before adding VexFlow/Tone.js complexity.

---

## Existing Themes — Rendering Requirements

### 1. World Capitals
- **Front**: Country name (single line) — e.g., "France"
- **Back**: Capital city (single line) — e.g., "Paris"
- **Rendering**: `renderEngineId: "text"`, plain text rendering

### 2. Multiplication Tables
- **Front**: Multiplication question (single line) — e.g., "7 × 8 = ?"
- **Back**: Answer (single line) — e.g., "56"
- **Rendering**: `renderEngineId: "text"`, plain text rendering

### 3. Conjugaisons Françaises
- **Front**: Verb + tense (single line) — e.g., "Aimer — présent"
- **Back**: Full conjugation (**multi-line** with `\n` breaks) — e.g., "j'aime\ntu aimes\nil/elle aime\nnous aimons\nvous aimez\nils/elles aiment"
- **Rendering**: `renderEngineId: "text"`, text with line-break support (must render `\n` as actual line breaks)

---

## Rendering Contract — What to Code

Each card side uses the `CardSide` contract with a `renderEngineId` that selects the engine:

### `RenderEngine.render(data, target) → void`
- Renders the card side data into the DOM target
- All 3 existing themes: `renderEngineId: "text"` → `TextEngine` renders styled text
- **Must handle two cases**:
  1. **Single-line text** (World Capitals, Multiplication Tables)
  2. **Multi-line text** with `\n` breaks (Conjugaisons FR) → split by `\n` and render each line

### Engine Stubs (for future Solfège)
- **MarkdownEngine** (`renderEngineId: "markdown"`): stub — ready for markdown-to-HTML integration
- **ScoreEngine** (`renderEngineId: "score"`): stub — ready for VexFlow integration
- **ScoreAudioEngine** (`renderEngineId: "score-audio"`): stub — ready for VexFlow + Tone.js integration; implements `precompute()`

---

## Implementation Sequence

### Phase 1: Existing Themes (Epic 3 — US-019)
1. Create `TextEngine.render(data, target)` — renders text into DOM target
2. TextEngine handles single-line and multi-line content
3. Create MarkdownEngine, ScoreEngine, ScoreAudioEngine stubs (placeholders only)
4. Wire into `FlashcardDisplay` component via `renderEngineId` resolution
5. Update theme JSON to use `CardSide` contract
6. Validate: all 3 themes display identically to before (no visual regression)

### Phase 2: Solfège (Epic 1)
1. Implement `ScoreEngine.render()` with VexFlow `renderScore()`
2. Implement `ScoreAudioEngine.render()` with Tone.js `playScore()`
3. Implement `ScoreAudioEngine.precompute()` for async pre-computation
4. Bilingual FR/EN note name support

---

## Why This Order?

| Reason | Explanation |
|---|---|
| **Architecture validation** | Confirms the rendering contract works with real data before adding complexity |
| **Backward compatibility** | Proves existing themes work unchanged through the new rendering layer |
| **Clean separation** | Text rendering is simple — isolates any bugs to the contract itself, not VexFlow/Tone.js |
| **Solfège becomes simpler** | When implementing Solfège, you only add SVG + audio engines — the contract is already proven |
| **Test confidence** | Existing tests pass unchanged → the framework is non-breaking |

---

## Key Decisions

1. **Multi-line support is mandatory** — Conjugaisons FR uses `\n` for line breaks; the TextEngine must split and render each line separately
2. **Engine stubs are required** — MarkdownEngine, ScoreEngine, and ScoreAudioEngine stubs must exist (even as placeholders) so the engine registry is complete and type-safe
3. **No visual regression** — All 3 existing themes must look identical before and after the rendering layer is introduced
4. **Unified RenderEngine** — A single `RenderEngine` contract handles both rendering (`render(data, target)`) and optional pre-computation (`precompute?(data)`). Each card side references a `renderEngineId` that selects the engine.

---

## Related Artifacts

- **US-019**: Define and Implement Rendering Contract for Questions and Answers
- **US-016**: Migrate Existing Themes to RenderEngine Contract
- **Epic 3**: Theme RenderEngine Framework
- **Architecture.md**: RenderEngine Contract section

---

## What to Validate Visually

After Phase 1 implementation:
- [ ] World Capitals: country → capital displays correctly (single line)
- [ ] Multiplication Tables: question → answer displays correctly (single line)
- [ ] Conjugaisons FR: verb tense → full conjugation displays with proper line breaks
- [ ] Card flip animation works unchanged
- [ ] Session scoring works unchanged
- [ ] No console errors
