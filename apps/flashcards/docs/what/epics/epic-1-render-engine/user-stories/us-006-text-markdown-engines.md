---
title: 'US-006 — TextEngine and MarkdownEngine Implementations'
---

# US-006 — TextEngine and MarkdownEngine Implementations

## Story

As a learner, I want flashcard content to render correctly whether it is plain text or markdown so that I can study different types of content.

## Expected Behavior

TextEngine renders plain text content directly into the target HTMLElement. MarkdownEngine converts markdown syntax to HTML and renders the result into the target. Both implementations conform to the RenderEngine interface. Neither implements precompute — flip is always instant for these engines.

## Acceptance Criteria

- TextEngine implemented and handles plain text rendering into target HTMLElement
- MarkdownEngine implemented and handles markdown-to-HTML conversion and rendering
- Both engines registered in engine registry under 'text' and 'markdown' IDs respectively
- All existing tests pass without modification
- Build passes

## Related Epic

[Epic 1 — RenderEngine Refactoring](epic-1-render-engine/epic.md)

## Related Sprints

[Sprint 1 — RenderEngine Foundation](sprint-1-render-engine/sprint.md)
