# Slice 4 — Timeline Component & Chronological Navigation

## Goal

Build the timeline component that displays all entries in chronological order with visual date anchors and interactive filtering by date. This slice provides the primary view for discovering and navigating the journal, supporting 1000+ entries with smooth scrolling and responsive design (US-004).

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Voir, éditer et supprimer ses entrées](../../what/epics/epic-0-mvp/user-stories/us-002-view-edit-delete.md)
- [US-004 — Voir une timeline visuelle chronologique](../../what/epics/epic-0-mvp/user-stories/us-004-timeline-view.md)

## Impacted Components

### React Components (`src/components/`)
- **Timeline.tsx** : Main timeline container
  - Props : entries, onEntryClick, onDateClick, sortOrder
  - Renders vertical timeline with date groupings
  - Handles scroll performance

- **TimelineEntry.tsx** : Individual entry item
  - Props : entry, onEntryClick
  - Shows date badge and text preview
  - Clickable to view full entry

- **DateAnchor.tsx** : Visual date separator
  - Props : date, count (number of entries on this date)
  - Shows formatted date (e.g., "28 mai 2026")
  - Clickable to filter by date

- **TimelineSortToggle.tsx** : Toggle sort order
  - Props : sortOrder, onSortChange
  - Options : "Récentes d'abord" or "Anciennes d'abord"

- **EntryPreview.tsx** : Text preview for timeline item
  - Props : text (full entry text)
  - Shows first 150 characters with ellipsis
  - Full text visible in EntryDetail view

## Interfaces

### Components
```typescript
// src/components/Timeline.tsx
interface TimelineProps {
  entries: JournalEntry[];
  onEntryClick: (entry: JournalEntry) => void;
  onDateClick?: (date: string) => void;  // optional: filter by date
  sortOrder?: 'asc' | 'desc';            // default 'desc' (newest first)
  isLoading?: boolean;
}

// src/components/TimelineEntry.tsx
interface TimelineEntryProps {
  entry: JournalEntry;
  onEntryClick: (entry: JournalEntry) => void;
}

// src/components/DateAnchor.tsx
interface DateAnchorProps {
  date: string;                          // YYYY-MM-DD
  count: number;                         // entries on this date
  onClick?: (date: string) => void;
}

// src/components/TimelineSortToggle.tsx
interface TimelineSortToggleProps {
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
}

// src/components/EntryPreview.tsx
interface EntryPreviewProps {
  text: string;
  maxLength?: number;  // default 150
}
```

### Hooks
```typescript
// src/hooks/useTimelineState.ts (optional helper)
export const useTimelineState = () => {
  return {
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
    groupedByDate: Map<string, JournalEntry[]>;  // helper for rendering
  };
};
```

## Data Changes

### State Management
- **Timeline local state** : sortOrder preference
- **Grouped entries** : Map<date, JournalEntry[]> for rendering
- **Sorting** : Computed property (no new data, just rendering order)
- **localStorage** : Optionally persist sortOrder preference (phase 2)

### Rendering Model
- **Grouping** : Group entries by date, render date anchors
- **Within-date ordering** : Sort by createdAt ascending (oldest entry first within date)
- **Overall ordering** : By date descending (newest date first) or ascending

## Sequence Flow

### Timeline Display (US-004)
```
1. Page loads (home view)
2. App calls useJournalEntries()
3. Hook fetches all entries from localStorage
4. Hook sorts entries by date descending (default)
5. App renders Timeline component
6. Timeline receives entries as prop
7. Timeline groups entries by date:
   a. "2026-06-01": [entry1, entry2, ...]
   b. "2026-05-31": [entry3, ...]
8. Timeline renders vertically:
   a. DateAnchor("2026-06-01", count=3)
   b. TimelineEntry(entry1) → click opens EntryDetail
   c. TimelineEntry(entry2)
   d. TimelineEntry(entry3)
   e. DateAnchor("2026-05-31", count=1)
   f. TimelineEntry(entry4)
9. User scrolls timeline (smooth, 60fps)
10. All entries visible with proper spacing
```

### Click Date Anchor (Filter by Date)
```
1. User sees DateAnchor("28 mai 2026") with count=2
2. User clicks DateAnchor
3. onDateClick handler triggered
4. App filters entries to only those on 2026-05-28
5. Timeline re-renders with only those entries
6. Badge shows "Filtrée : 28 mai" at top
7. User sees "Voir tout" button
8. User clicks "Voir tout" → restore full timeline
```

### Click Entry
```
1. User sees TimelineEntry (text preview + date)
2. User clicks entry
3. onEntryClick handler triggered
4. App navigates to EntryDetail view
5. EntryDetail shows full entry (date, full text, timestamps)
6. User can click Edit or Delete from detail view
```

### Sort Order Toggle (Récentes vs Anciennes)
```
1. Timeline shows TimelineSortToggle button
2. User clicks "Anciennes d'abord"
3. onSortChange handler sets sortOrder = 'asc'
4. Timeline re-sorts entries (oldest date first)
5. Timeline re-renders in new order
6. Toggle now shows "Récentes d'abord" (to revert)
```

### Performance Scenario (1000 entries)
```
1. Load 1000 entries from localStorage (< 50ms)
2. Sort entries by date (< 50ms)
3. Group into date buckets (< 50ms)
4. React renders Timeline (< 1s total)
5. Browser paints (< 1s)
6. User scrolls, scroll is smooth (60 fps maintained)
7. Total page load: < 2s
```

## Observability Impact

### Rendering Metrics
- Log number of entries rendered
- Measure Timeline render time (target < 1s for 1000 entries)
- Measure scroll frame rate (target 60 fps)
- Log any render warnings/errors

### User Interactions
- Log when user clicks date anchor (filtering)
- Log sort order preference (if persisted)
- Log when user clicks entry (navigation)

### Performance Monitoring
- Measure initial Timeline render time
- Measure scroll performance (frame drops)
- Monitor for long paint times (> 16ms = frame drop)

### Error Cases
- Handle empty entries array gracefully (show "No entries" message)
- Handle date parsing errors (fallback to ISO format)
- Log any React warnings during rendering

## Testing Expectations

### Unit Tests
- Timeline groups entries by date correctly
- Timeline sorts by date (asc/desc) correctly
- DateAnchor displays formatted date
- EntryPreview truncates text at limit
- TimelineSortToggle toggles correctly

### Integration Tests
- Load 100 entries, render Timeline, verify all displayed
- Load 1000 entries, verify performance < 1s
- Click entry, verify onEntryClick called with correct entry
- Click date anchor, verify onDateClick called
- Toggle sort, verify entries re-ordered

### Component Tests
- Timeline renders with entries prop
- Empty entries shows "No entries" message
- Click entry item opens detail
- Click date anchor filters timeline
- Sort toggle changes order
- Responsive layout on mobile (vertical, no overflow)

### Accessibility Tests
- Date anchor is keyboard accessible (Tab, Enter)
- Entry item is keyboard accessible
- Screen reader announces entry count and dates
- Focus visible on interactive elements
- No WCAG color contrast issues

## Definition of Done

- [ ] Timeline component groups entries by date
- [ ] Timeline sorts entries (asc/desc configurable)
- [ ] DateAnchor component displays formatted dates
- [ ] TimelineEntry component shows text preview (150 chars)
- [ ] EntryPreview truncates long text with ellipsis
- [ ] Click entry navigates to EntryDetail
- [ ] Click date anchor filters by date (optional feature)
- [ ] TimelineSortToggle changes sort order
- [ ] Empty state message ("No entries") displayed
- [ ] Loading spinner during data fetch
- [ ] Mobile responsive (vertical layout, no overflow)
- [ ] 60 fps scroll performance maintained
- [ ] Keyboard accessible (Tab, Enter, Escape)
- [ ] Screen reader support for dates and entries
- [ ] Performance verified : < 1s render for 1000 entries
- [ ] Unit tests : 100% coverage of sorting and grouping logic
- [ ] Integration tests : full timeline flows with CRUD operations
- [ ] Component tests : rendering, interactions, accessibility
- [ ] Lighthouse performance score > 90

