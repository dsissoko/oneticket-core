# US-005 — Tag Colors

## Story

As a journaler, I want each tag to have a consistent, automatically assigned color derived from its name, so that I can visually distinguish tags across all my thoughts without choosing colors.

## Expected Behavior

A tag is an object containing a name (user-provided) and a color (automatically assigned). Tags are automatically assigned a color on first creation, based on a deterministic hash of their name. The same tag name always renders in the same color throughout the application, including in thought cards, filter UI, and the add thought form. Users never directly choose or customize tag colors.

## Acceptance Criteria

1. A tag is an object with two properties: `name` (string) and `color` (hex code string)
2. Tag color is assigned deterministically from tag name using a hash-based algorithm on first tag creation
3. Same tag name always renders in the same color across all views and sessions
4. Fixed palette of 8–12 visually distinct colors is used for all tags
5. No user color picker or customization in MVP; users cannot override or customize tag colors
6. Tag colors are displayed on tags in all views (list, timeline, filters, form)
7. New tags added during thought creation are automatically assigned a color from the palette on save

## Related Epic

[Epic 0 — MonJournal MVP](epic.md)

## Related Slices

- [Slice 1 — Data Foundation](../../how/slices/slice-1-data-foundation/slice.md)
