---
title: 'US-008 — Dataset Migration to Extended CardSide Format'
---

# US-008 — Dataset Migration to Extended CardSide Format

## Story

As a developer, I want all existing themes to adopt explicit renderEngineId per side so that the new rendering architecture works with zero visual regression.

## Expected Behavior

All 3 existing themes migrate to the extended CardSide format where each side is { data: string, renderEngineId: 'text' } for plain text content. The Conjugaisons theme back side uses renderEngineId: 'markdown' for multiline content. The plain string format remains fully supported for backward compatibility — any plain string is automatically normalized to { data: string, renderEngineId: 'text' }. SessionScreen and FlashcardDisplay are wired to use the resolved engine for rendering.

## Acceptance Criteria

- All 3 existing themes migrated to extended CardSide format with explicit renderEngineId
- Conjugaisons back side uses 'markdown' engine for multiline content
- Plain string format remains backward compatible (auto-normalized to TextEngine)
- SessionScreen and FlashcardDisplay wired to use resolved engine
- All existing tests pass without modification
- Build passes

## Related Epic

[Epic 1 — RenderEngine Refactoring](epic-1-render-engine/epic.md)

## Related Sprints

[Sprint 1 — RenderEngine Foundation](sprint-1-render-engine/sprint.md)
