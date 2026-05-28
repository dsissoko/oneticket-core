# Slice 2 — Search and Period-Based Filtering

## Goal

Implement search functionality allowing users to filter journal entries by date range (start date and end date, inclusive). This slice provides a SearchPanel UI component, a useSearchEntries hook, and domain logic for fast date-range filtering. Enables users to rediscover entries from specific periods efficiently.

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-003 — Rechercher ses entrées par période](../../what/epics/epic-0-mvp/user-stories/us-003-search-by-period.md)

## Impacted Components

### Domain Layer (`src/domain/`)
- `SearchService.ts` — Pure function for filtering entries by date range

### Application Layer (`src/hooks/`)
- `useSearchEntries.ts` — Hook managing search state and results

### UI Layer (`src/components/`)
- `SearchPanel.tsx` — Presentational component with date range inputs and search button
- `SearchResults.tsx` — Display filtered entries in list or timeline format

## Interfaces

### Search Service
```typescript
interface SearchCriteria {
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
}

function filterByDateRange(
  entries: JournalEntry[],
  startDate: string,
  endDate: string
): JournalEntry[] {
  // Returns entries where date >= startDate AND date <= endDate
}
```

### Hook Contract
```typescript
const { results, search, isSearching, error, clearSearch } = useSearchEntries();

// Usage
search({ startDate: '2026-05-20', endDate: '2026-05-30' });
// results: JournalEntry[] matching date range
```

### Component Props
```typescript
interface SearchPanelProps {
  onSearch: (criteria: SearchCriteria) => Promise<void>;
  isSearching: boolean;
  error?: string | null;
}

interface SearchResultsProps {
  results: JournalEntry[];
  totalCount: number;
  onEntryClick: (entry: JournalEntry) => void;
  onClearSearch: () => void;
  isLoading: boolean;
}
```

## Data Changes

No new data structure. Uses existing `journal_entries` localStorage key with date filtering.

### Search Algorithm
- O(n) linear scan of all entries
- Compare date strings lexicographically (YYYY-MM-DD format)
- Inclusive bounds: `date >= startDate AND date <= endDate`

## Sequence Flow

### Search Initiation
1. User accesses SearchPanel component
2. User enters start date (calendar picker or manual input)
3. User enters end date (calendar picker or manual input)
4. User clicks "Search" button
5. useSearchEntries validates date range (startDate <= endDate)
6. Hook retrieves all entries from useJournalEntries (or repository)
7. SearchService.filterByDateRange applies filter
8. Results passed to consuming component
9. SearchResults component renders matching entries

### Empty Results Handling
1. Filter returns empty array
2. SearchResults displays "Aucune entrée trouvée" message
3. User can clear search to view all entries again
4. User can modify date range and retry

### Clear Search
1. User clicks "Réinitialiser" or "Voir tout" button
2. useSearchEntries clears search state
3. Full entry list displays
4. SearchPanel form reset to default state

### Performance with Large Dataset
1. User has 1000 entries in localStorage
2. Search initiated with date range
3. Linear filter completes in < 100ms
4. Results displayed without lag or freeze
5. UI remains responsive throughout

## Acceptance Criteria

- [ ] **SearchPanel Component** : Date range inputs (start/end) with calendar pickers
- [ ] **Search Button** : Triggers search, shows loading state
- [ ] **Validation** : Verify startDate <= endDate, both dates valid YYYY-MM-DD format
- [ ] **Filter Logic** : Returns entries where `date >= startDate AND date <= endDate`
- [ ] **Inclusive Bounds** : Both start and end dates included in results
- [ ] **Results Display** : Show count of matching entries ("N entrée(s) trouvée(s)")
- [ ] **Empty Results** : Display user-friendly message when no entries found
- [ ] **Clear Search** : "Réinitialiser" or "Voir tout" button returns to full list
- [ ] **Sort Order** : Results match timeline sort order (user preference: newest or oldest first)
- [ ] **Performance** : Search on 1000 entries completes in < 100ms
- [ ] **Error Handling** : Graceful handling of invalid dates, edge cases
- [ ] **Accessibility** : WCAG 2.1 AA — date inputs have labels, buttons accessible
- [ ] **Unit Tests** : Test filterByDateRange with edge cases (same date, large ranges, no results)
- [ ] **Integration Tests** : Test hook with real entry data, verify state updates

## MSW Handlers

No MSW handlers required (localStorage-only, no API calls). Future phase 2 may add `GET /entries/search?startDate=...&endDate=...` endpoint.

## Technical Notes

### Date String Comparison
- YYYY-MM-DD format allows lexicographic comparison
- Example: "2026-05-20" < "2026-05-25" < "2026-06-01"
- No need for date parsing for comparisons

### Timezone Handling
- All dates treated as local (user's timezone)
- No UTC conversion needed for date-only comparisons

### Input Validation
- Start date: required, valid YYYY-MM-DD, not future (optional constraint)
- End date: required, valid YYYY-MM-DD, >= start date
- Show validation error messages in real-time if needed

### State Management
- Search state local to component/hook
- Results not persisted (re-searched on every search action)
- Previous search cleared when user navigates away

### UI Patterns
- Use Primer DatePicker or native HTML5 date input
- Show search progress indicator during filtering
- Display "X entrée(s) trouvée(s)" header in results
- Enable "Voir tout" to clear and return to full timeline

## Implementation Sequence

1. Implement domain SearchService (pure function for filtering)
2. Implement useSearchEntries hook with state management
3. Create SearchPanel component with date inputs
4. Create SearchResults component for rendering results
5. Integrate SearchPanel into main app layout
6. Integrate SearchResults into main app layout
7. Wire hooks to components
8. Add date validation logic
9. Write unit tests for SearchService
10. Write integration tests for hook and components
11. Manual testing with various date ranges and entry counts

## Observability Impact

### Logging
- Log successful searches with date range and result count
- Log validation errors (invalid dates, invalid range)
- Log search performance metrics (time to filter)

### Error Messages
- "Dates invalides — Vérifiez le format YYYY-MM-DD"
- "La date de début doit être avant la date de fin"
- "Aucune entrée trouvée pour cette période"
- "Erreur lors de la recherche — Veuillez réessayer"

### Performance Metrics
- Mark/measure for search operation (FilterByDateRange)
- Monitor search time vs entry count correlation
- Warn if search takes > 100ms (performance regression indicator)

### Analytics (Future)
- Track searches performed (frequency, date ranges)
- Track result patterns (common search ranges)
- Track user navigation after search (click on entry, clear search, etc.)
