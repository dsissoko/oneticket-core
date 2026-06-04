# US-001 — Thought List

## Story

As a journaler, I want to see all my thoughts in a list ordered by most recent first, so that I can quickly review my recent reflections.

## Expected Behavior

Users can access the home screen and view all stored thoughts as compact cards displayed in chronological order (newest first). Empty states are handled gracefully with a friendly message.

## Acceptance Criteria

1. Compact cards display title, truncated content (approximately 100 characters), creation date, and tags
2. Thoughts are ordered by `createdAt` in descending order (most recent first)
3. Empty list shows a friendly message when no thoughts exist
4. Tags are displayed with their assigned colors on each card

## Related Epic

[Epic 0 — MonJournal MVP](epic.md)

## Related Slices

- [Slice 1 — Data Foundation](../../how/slices/slice-1-data-foundation/slice.md)
- [Slice 2 — Thought List Display](../../how/slices/slice-2-thought-list-display/slice.md)
