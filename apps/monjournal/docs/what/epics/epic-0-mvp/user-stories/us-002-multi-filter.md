# US-002 — Multi-Filter

## Story

As a journaler, I want to filter thoughts by title/content (text search), date range, selected tags, and randomly select one thought, so that I can find specific thoughts and explore my journal.

## Expected Behavior

Users can apply multiple filters simultaneously to refine their view of thoughts. Filters work together in an AND/OR logical combination, updating results in real-time. A surprise filter allows users to discover a random thought from the current filtered set.

## Acceptance Criteria

1. Text search filters both title and content with case-insensitive substring matching
2. Date picker allows selection of start and end dates, showing only thoughts within range (inclusive)
3. Multi-select tag filter allows users to select multiple tags; shows thoughts containing at least one selected tag
4. Surprise filter randomly selects and highlights one thought from the current filtered results
5. All filters are composable and work together to refine results
6. Filters apply to the list view in real-time as selections change
7. Empty results show a friendly message when no thoughts match filter criteria

## Related Epic

[Epic 0 — MonJournal MVP](epic.md)

## Related Slices

- [Slice 1 — Data Foundation](../../how/slices/slice-1-data-foundation/slice.md)
- [Slice 3 — Filtering & Search](../../how/slices/slice-3-filtering-search/slice.md)
