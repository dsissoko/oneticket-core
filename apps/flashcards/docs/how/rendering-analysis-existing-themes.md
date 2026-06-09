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
- **Rendering**: Simple text, no special formatting

### 2. Multiplication Tables
- **Front**: Multiplication question (single line) — e.g., "7 × 8 = ?"
- **Back**: Answer (single line) — e.g., "56"
- **Rendering**: Simple text, no special formatting

### 3. Conjugaisons Françaises
- **Front**: Verb + tense (single line) — e.g., "Aimer — présent"
- **Back**: Full conjugation (**multi-line** with `\n` breaks) — e.g., "j'aime\ntu aimes\nil/elle aime\nnous aimons\nvous aimez\nils/elles aiment"
- **Rendering**: Text with line-break support (must render `\n` as actual line breaks)

---

## Rendering Contract — What to Code

Each theme's cards are rendered through **two functions**:

### `renderQuestion(card: Card) → ReactNode`
- Renders `card.front` as styled text
- All 3 existing themes: single-line text → straightforward `<Text>` component

### `renderAnswer(answer: ComputedAnswer) → ReactNode`
- Dispatches based on `answer.type`
- For existing themes: handles `type: 'text'` only
- **Must handle two cases**:
  1. **Single-line text** (World Capitals, Multiplication Tables)
  2. **Multi-line text** with `\n` breaks (Conjugaisons FR) → split by `\n` and render each line

### Renderer Stubs (for future Solfège)
- **SVG renderer stub** (`type: 'svg'`): renders a placeholder div — ready for VexFlow integration
- **Audio renderer stub** (`type: 'audio'`): renders a play button placeholder — ready for Tone.js integration

---

## Implementation Sequence

### Phase 1: Existing Themes (Epic 3 — US-019)
1. Create `renderQuestion(card)` — renders `card.front` as text
2. Create `renderAnswer(answer)` — dispatches by type, implements text renderer
3. Text renderer handles single-line and multi-line content
4. Create SVG and audio renderer stubs (placeholders only)
5. Wire into `FlashcardDisplay` component
6. Validate: all 3 themes display identically to before (no visual regression)

### Phase 2: Solfège (Epic 1)
1. Replace SVG stub with VexFlow `renderScore()` implementation
2. Replace audio stub with Tone.js `playScore()` implementation
3. Implement `ScoreRenderEngine` for computed answers
4. Bilingual FR/EN note name support

---

## Why This Order?

| Reason | Explanation |
|---|---|
| **Architecture validation** | Confirms the rendering contract works with real data before adding complexity |
| **Backward compatibility** | Proves existing themes work unchanged through the new rendering layer |
| **Clean separation** | Text rendering is simple — isolates any bugs to the contract itself, not VexFlow/Tone.js |
| **Solfège becomes simpler** | When implementing Solfège, you only add SVG + audio renderers — the contract is already proven |
| **Test confidence** | Existing tests pass unchanged → the framework is non-breaking |

---

## Key Decisions

1. **Multi-line support is mandatory** — Conjugaisons FR uses `\n` for line breaks; the text renderer must split and render each line separately
2. **Renderer stubs are required** — SVG and audio stubs must exist (even as placeholders) so the type dispatch is complete and type-safe
3. **No visual regression** — All 3 existing themes must look identical before and after the rendering layer is introduced
4. **Rendering is separate from RenderEngine** — `RenderEngine` computes the answer; rendering layer displays it. These are two distinct concerns.

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
