# US-005 — Tag Colors

## Story

As a journaler, I want each tag to have a consistent, automatically assigned color derived from its name, so that I can visually distinguish tags across all my thoughts without choosing colors.

## Expected Behavior

A tag is an object containing a name (user-provided) and a color (automatically assigned). Tags are automatically assigned a color on first creation, based on a **deterministic hash** of their name—meaning the color is computed from the tag name itself, not randomly chosen. The same tag name always renders in the same color throughout the application, including in thought cards, filter UI, and the add thought form. Users never directly choose, customize, or influence tag color selection.

**Mechanism**: When a new tag (tag name not yet seen before) is first used and saved:
1. The system hashes the tag name string
2. Maps the hash to one of the colors in the fixed palette (8–12 distinct colors)
3. Stores the tag name + color pair in the thought's tag data
4. On any subsequent use of that tag name, the same color is always retrieved and displayed

**Note on terminology**: This is **deterministic**, not **random**. The color for a tag name is always the same because it's derived from the tag name itself via a consistent algorithm.

## Acceptance Criteria

1. A tag is an object with two properties: `name` (string) and `color` (hex code string)
2. Tag color is assigned **deterministically** on first use of a tag name—computed via hash function, not random selection
3. Hash algorithm: `hash(tagName) % paletteSize` maps the tag name to a specific color in the fixed palette
4. Same tag name always renders in the same color across all views and sessions (no variance, no randomness)
5. Fixed palette of 8–12 visually distinct colors is used for all tags; palette is immutable
6. No user color picker or customization in MVP; users cannot override, customize, or randomize tag colors
7. Tag colors are displayed on tags in all views (list, timeline, filters, form)
8. New tags added during thought creation are automatically assigned a color from the palette on save
9. When a thought is loaded from storage, its tag colors are always consistent with the stored color (no recomputation needed)

## Related Epic

[Epic 0 — MonJournal MVP](epic.md)

## Related Slices

- [Slice 1 — Data Foundation](../../how/slices/slice-1-data-foundation/slice.md)
