# US-005 — Tag Colors

## Story

As a journaler, I want each tag to have a consistent, automatically assigned color derived from its name, so that I can visually distinguish tags across all my thoughts without choosing colors.

## Expected Behavior

Tags are automatically assigned a color based on a deterministic hash of their name. The same tag always renders in the same color throughout the application, including in thought cards, filter UI, and the add thought form.

## Acceptance Criteria

1. Color is assigned deterministically from tag name using a hash-based algorithm
2. Same tag always renders in the same color across all views and sessions
3. Fixed palette of 8–12 visually distinct colors is used for all tags
4. No user color picker or customization in MVP
5. Tag colors are displayed on tags in all views (list, timeline, filters, form)
6. New tags added during thought creation are automatically assigned a color from the palette

## Related Epic

[Epic 0 — MonJournal MVP](epic.md)

## Related Slices

- [Slice 1 — Data Foundation](../../how/slices/slice-1-data-foundation/slice.md)
