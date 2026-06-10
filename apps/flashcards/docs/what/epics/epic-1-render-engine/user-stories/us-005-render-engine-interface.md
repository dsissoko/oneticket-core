---
title: 'US-005 — RenderEngine Interface and Registry'
---

# US-005 — RenderEngine Interface and Registry

## Story

As a developer, I want a generic RenderEngine interface and engine registry so that card sides can be rendered by different implementations selected by ID.

## Expected Behavior

The RenderEngine interface defines render(data, target) for synchronous rendering and an optional precompute(data) method for async engines. The engine registry resolves implementations by renderEngineId string, defaulting to TextEngine when no ID is specified. A normalization helper converts legacy plain string card sides to the extended format { data: string, renderEngineId: 'text' }.

## Acceptance Criteria

- RenderEngine interface defined and documented with render(data, target) and optional precompute(data)
- Engine registry resolves by renderEngineId, defaults to TextEngine for unknown or missing IDs
- Normalization helper converts plain string → { data, renderEngineId: 'text' }
- Unit tests for registry resolution and normalization helper
- Build passes

## Related Epic

[Epic 1 — RenderEngine Refactoring](epic-1-render-engine/epic.md)

## Related Sprints

[Sprint 1 — RenderEngine Foundation](sprint-1-render-engine/sprint.md)
