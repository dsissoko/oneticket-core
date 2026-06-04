# US-003 — Timeline View

## Story

As a journaler, I want to toggle between list and timeline views of my thoughts, so that I can see my thoughts grouped by date for a chronological perspective.

## Expected Behavior

Users can switch between a list view (default) and a timeline view using a single toggle control. The timeline view groups thoughts by creation date with day separators and maintains chronological ordering. All active filters continue to apply to whichever view is selected.

## Acceptance Criteria

1. Thoughts are grouped by creation date with day separators (e.g., "June 4, 2026")
2. Timeline displays thoughts in reverse chronological order (most recent to oldest)
3. Each grouped thought shows title, tags (with colors), and truncated content
4. Single toggle control switches between list and timeline views
5. Active view mode persists in component state during the session
6. All active filters apply to timeline grouped results in real-time
7. Empty state message displays when timeline has no matching thoughts

## Related Epic

[Epic 0 — MonJournal MVP](epic.md)

## Related Slices

(To be populated by @architect)
