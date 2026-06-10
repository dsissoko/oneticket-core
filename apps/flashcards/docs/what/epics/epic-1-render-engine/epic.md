---
title: 'Epic 1 — RenderEngine Refactoring'
---

# Epic 1 — RenderEngine Refactoring

## Goal

Refactor the Flashcards app to introduce a generic RenderEngine mechanism so each card side references a renderEngineId selecting the rendering implementation. Existing themes must be migrated with zero visual regression.

## Business Value

Enables rich rendering (SVG scores, audio, markdown) via a clean extension point without breaking existing themes. The pluggable architecture allows future rendering engines to be added without modifying core session logic.

## Scope

- Define RenderEngine interface with render(data, target) and optional precompute(data) methods
- Implement TextEngine (plain text) and MarkdownEngine (markdown-to-HTML)
- Create engine registry that resolves by renderEngineId, defaults to TextEngine
- Implement normalization helper: plain string → { data, renderEngineId: 'text' }
- Migrate all 3 existing themes to extended CardSide format
- Implement precompute lifecycle in SessionScreen for future async engines
- Maintain backward compatibility with plain string card sides

## Related User Stories

[US-005 — RenderEngine Interface and Registry](us-005-render-engine-interface.md)

[US-006 — TextEngine and MarkdownEngine Implementations](us-006-text-markdown-engines.md)

[US-007 — SessionScreen Precompute Lifecycle](us-007-session-preload.md)

[US-008 — Dataset Migration to Extended CardSide Format](us-008-dataset-migration.md)

## Related Sprints

[Sprint 1 — RenderEngine Foundation](sprint-1-render-engine/sprint.md)
