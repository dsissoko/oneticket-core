---
title: Epic 3 — Theme ResponseEngine Framework
---

# Epic 3 — Theme ResponseEngine Framework

## Goal

Introduce a generic `ResponseEngine` contract that allows themes to compute answers dynamically rather than relying solely on static `{ front, back }` card data. Migrate all existing themes to this framework, validating that the new mechanism is transparent for themes that require no computation, while enabling computed responses for themes like Solfège.

## Business Value

Currently, flashcard answers are pre-baked as raw strings in JSON files. This works for simple Q&A (capitals, multiplication tables) but blocks any theme where the answer must be **computed** — such as rendering a music score, generating audio, or deriving a response from context.

The `ResponseEngine` framework unlocks computed themes while preserving backward compatibility: existing themes continue to work unchanged, and new themes gain the ability to define `computeNextResponse()` logic.

## Scope

- Define the `ResponseEngine` interface: `computeNextResponse(card, context) → computedAnswer`
- Introduce a default `IdentityEngine` that returns `card.back` as-is (backward-compatible)
- Define the rendering contract: `renderQuestion(card)` and `renderAnswer(answer)` with type-based dispatch
- Implement text renderer for existing themes (handles single-line and multi-line content)
- Create SVG and audio renderer stubs — placeholders ready for VexFlow and Tone.js integration
- Migrate existing themes (World Capitals, Multiplication Tables, Conjugaisons FR) to use `IdentityEngine`
- Wire the `ResponseEngine` into the session flow so that card answers are resolved through the engine
- Ensure existing tests pass without modification
- Prepare the contract so that Solfège can later implement its own `ScoreResponseEngine`

## Out of Scope

- Implementing the Solfège `ScoreResponseEngine` — covered by Epic 1 (Solfège Bilingual Score Cards)
- Animated score rendering — covered by Epic 2 (Animated Score Learning)

## Related User Stories

<!-- @analyst fills this section — write filename only, no relative path, no ../
     US files are always in user-stories/ subfolder — never flat in the epic directory
     The build script resolves the correct path automatically.
     Example: [US-001 — Skeleton Setup](us-001-skeleton-setup.md) -->

- [US-014 — Define ResponseEngine Interface](us-014-response-engine-interface.md)
- [US-015 — Implement IdentityEngine for Static Themes](us-015-identity-engine.md)
- [US-016 — Migrate Existing Themes to ResponseEngine Contract](us-016-migrate-existing-themes.md)
- [US-017 — Wire ResponseEngine into Session Flow](us-017-wire-response-engine-session.md)
- [US-018 — Validate Existing Tests Pass Unchanged](us-018-validate-existing-tests.md)
- [US-019 — Define and Implement Rendering Contract for Questions and Answers](us-019-rendering-contract.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->

- [Slice 8 — ResponseEngine Framework](slice-8-response-engine-framework/slice.md)
- [Slice 14 — Rendering Engine Implementation](slice-14-rendering-engine/slice.md)

## Related Epics

- [Epic 0 — MVP Flashcard App](epic-0-mvp/epic.md)
- [Epic 1 — Solfège Bilingual Score Cards](epic-1-solfege/epic.md)
- [Epic 2 — Animated Score Learning](epic-2-animated-score/epic.md)
