---
title: Epic 3 — Theme ResponseEngine Framework
---

# Epic 3 — Theme ResponseEngine Framework

## Goal

Introduce a generic `ResponseEngine` contract and migrate all existing themes to this framework, ensuring full backward compatibility. The `IdentityEngine` returns `card.back` as-is so that existing themes (World Capitals, Multiplication Tables, Conjugaisons FR) continue to work unchanged.

## Business Value

Currently, flashcard answers are pre-baked as raw strings in JSON files. This works for simple Q&A but couples the session flow directly to static card data. The `ResponseEngine` framework decouples answer resolution from card storage through a clean interface with a default identity implementation. Existing themes remain fully functional with zero behavioral change, while the architecture is ready for future computed-answer themes.

## Scope

- Define the `ResponseEngine` interface: `computeNextResponse(card, context) → computedAnswer`
- Introduce a default `IdentityEngine` that returns `card.back` as-is (backward-compatible)
- Define the rendering contract: `renderQuestion(card)` and `renderAnswer(answer)` with type-based dispatch
- Implement text renderer for existing themes (handles single-line and multi-line content)
- Migrate existing themes (World Capitals, Multiplication Tables, Conjugaisons FR) to use `IdentityEngine`
- Wire the `ResponseEngine` into the session flow so that card answers are resolved through the engine
- Ensure existing tests pass without modification

## Out of Scope

- Computed-answer engines for future themes (e.g. score rendering, audio generation) — covered by their respective epics
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
