# Slice 3 — Timeline Visualization and Navigation

## Goal

Implement chronological timeline view displaying all journal entries with date anchors, click handlers for filtering by date, and responsive navigation. This slice delivers the primary entry navigation interface, supporting smooth scrolling with 1000+ entries, mobile responsiveness, and visual date grouping.

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-004 — Voir une timeline visuelle chronologique de ses entrées](../../../what/epics/epic-0-mvp/user-stories/us-004-timeline-view.md)

## Impacted Components

### Application Layer (`src/hooks/`)
- `useTimelineSort.ts` — Hook managing sort order (newest/oldest first) and filtering

### UI Layer (`src/components/`)
- `Timeline.tsx` — Main timeline component rendering chronological entries
- `TimelineItem.tsx` — Individual entry card with date, text preview, click handler
- `TimelineAnchor.tsx` — Date anchor/divider component grouping entries by date
- `SortToggle.tsx` — Component for switching sort order

## Interfaces

### Timeline Props
```typescript
interface TimelineProps {
  entries: JournalEntry[];
  onEntryClick: (entry: JournalEntry) => void;
  onDateClick: (date: string) => void;
  sortOrder?: 'desc' | 'asc';           // 'desc' = newest first (default)
  onSortChange?: (order: 'desc' | 'asc') => void;
  isLoading?: boolean;
}
```

### Timeline Item Props
```typescript
interface TimelineItemProps {
  entry: JournalEntry;
  onEntryClick: (entry: JournalEntry) => void;
  textPreviewLength?: number;           // Characters to show (default: 150)
}
```

### Timeline Anchor Props
```typescript
interface TimelineAnchorProps {
  date: string;                         // YYYY-MM-DD
  entryCount: number;                   // Number of entries for this date
  onClick?: () => void;                 // Filter by this date
}
```

### Hook Contract
```typescript
const { 
  displayEntries,           // Sorted entries for current view
  sortOrder,
  setSortOrder,
  filterByDate,            // Filter entries to single date
  clearDateFilter,
  dateFilter               // Current date filter or null
} = useTimelineSort(entries);
```

## Data Changes

No new localStorage changes. Uses existing `journal_entries` with client-side sorting and filtering.

### Grouping Algorithm
- Group entries by date
- Within each date, sort by createdAt (earliest first)
- Order groups by date (descending or ascending per user preference)

## Sequence Flow

### Timeline Initialization
1. useJournalEntries reads all entries from localStorage
2. Timeline component receives entries array
3. useTimelineSort groups and sorts by date
4. displayEntries computed from all entries and current sort order
5. Timeline renders date anchors and entry items
6. Component displays immediately with no lag

### Date Anchor Click
1. User clicks on date anchor (e.g., "25 mai 2026")
2. useTimelineSort.filterByDate(date) called
3. displayEntries filtered to show only that date's entries
4. Visual indicator ("Filtrée : 25 mai") appears
5. "Voir tout" button displayed to clear filter

### Entry Item Click
1. User clicks on entry card
2. onEntryClick callback fired with entry object
3. Parent component (App) routes to EntryDetail view
4. Entry details displayed (full text, edit/delete buttons)

### Sort Order Toggle
1. User clicks sort toggle ("Récent → Ancien" or vice versa)
2. setSortOrder('asc' | 'desc') called
3. useTimelineSort recalculates displayEntries in new order
4. Timeline component re-renders with new ordering
5. Sort preference persisted to localStorage (optional)

### Performance with Large Dataset
1. Timeline renders 1000 entries
2. Virtual scrolling or pagination used if needed (MVP: simple map)
3. Render completes in < 1 second
4. Scroll remains at 60 fps
5. No console errors or warnings

## Acceptance Criteria

- [ ] **Timeline Display** : All entries shown chronologically with date anchors
- [ ] **Default Sort** : Newest first (descending by date)
- [ ] **Sort Toggle** : Ability to switch to oldest first
- [ ] **Date Grouping** : Entries grouped by date visually
- [ ] **Date Anchor** : Clickable date displays all entries for that date
- [ ] **Entry Click** : Clicking entry navigates to detail view
- [ ] **Text Preview** : Entry card shows text preview (≈150 chars) with ellipsis
- [ ] **Multiple Entries Same Date** : All displayed, sorted by createdAt within date
- [ ] **Filter Indicator** : "Filtrée : 25 mai" badge appears when filtered by date
- [ ] **Clear Filter** : "Voir tout" button clears date filter and shows all entries
- [ ] **Empty State** : "Aucune entrée" message if no entries exist
- [ ] **Responsive Mobile** : Timeline vertical on mobile, date anchors compact and readable
- [ ] **Performance** : 1000+ entries render in < 1 second, 60 fps scroll
- [ ] **Accessibility** : WCAG 2.1 AA — keyboard navigation (Tab, Arrow keys, Enter)
- [ ] **Unit Tests** : Test sort order, grouping, filtering logic
- [ ] **Integration Tests** : Test with real entry data, click handlers

## MSW Handlers

No MSW handlers required (localStorage-only, no API calls).

## Technical Notes

### Virtual Scrolling
- MVP: Render all entries with simple map()
- Phase 2: Optimize with react-window or similar if scroll performance degrades
- Monitor: Track render time and scroll frame rate

### Date Display Format
- Show localized date (e.g., "25 mai 2026" in French)
- Use `Intl.DateTimeFormat` for locale-aware formatting
- Store internally as YYYY-MM-DD (ISO 8601)

### Text Preview
- Truncate to ~150 characters with "…" suffix
- Avoid cutting mid-word if possible
- Show full text on click (EntryDetail)

### Mobile Responsiveness
- Vertical timeline on all screen sizes (primary layout)
- Horizontal swipe optional Phase 2 feature
- Date anchors compact on mobile (show date only, not full day name if space)
- Touch-friendly click targets (48px minimum height)

### Keyboard Navigation
- Tab: move focus between entries and anchors
- Arrow Up/Down: navigate between entries
- Enter: open entry detail
- Escape: close date filter (if filtering)

### Sort Persistence (Optional MVP)
- Store user's sort preference in localStorage under `journal_sort_order`
- Default to 'desc' (newest first) on first visit
- Restore preference on page reload

### Performance Optimization
- Memoize sorted array computation using useCallback/useMemo
- Avoid re-computing sort on every render
- Lazy render if needed (render only visible + buffer zone)

## Implementation Sequence

1. Implement useTimelineSort hook for sorting/filtering logic
2. Create TimelineAnchor component (visual date divider)
3. Create TimelineItem component (individual entry card)
4. Create Timeline component (main container)
5. Create SortToggle component (sort order selector)
6. Integrate Timeline into main App component
7. Wire hooks and event handlers
8. Implement keyboard navigation
9. Add mobile responsiveness with CSS media queries
10. Test with 100+ entries, then 1000+ entries
11. Performance profiling and optimization
12. Unit tests for sorting and filtering
13. Integration tests with real entry data

## Observability Impact

### Logging
- Log sort order changes
- Log date filter application/clearance
- Log entry click navigation
- Track scroll performance metrics (FPS, render time)

### Error Handling
- Handle empty entry array gracefully
- Handle malformed dates in entry array
- Show error toast if sorting fails

### Performance Metrics
- Mark/measure for sort computation
- Mark/measure for render (especially 1000+ entries)
- Monitor scroll frame rate via requestAnimationFrame
- Warn if render takes > 1 second or scroll FPS drops below 30

### Analytics (Future)
- Track most common sort order (ascending vs descending)
- Track date filter usage (users filtering by specific dates)
- Track click-through rate to EntryDetail view
