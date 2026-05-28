# Slice 3 — Search & Filter by Date Range

## Goal

Implement the search functionality that allows users to filter entries by date range (start and end dates, inclusive). This slice provides fast O(n) filtering with < 100ms target performance, enabling users to discover entries from specific periods (US-003).

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-003 — Rechercher ses entrées par période](../../what/epics/epic-0-mvp/user-stories/us-003-search-by-period.md)

## Impacted Components

### Domain Layer (`src/domain/`)
- **SearchService.ts** : Pure function for date range filtering
  - filterByDateRange(entries, startDate, endDate) → JournalEntry[]
  - Performance : O(n) complexity, consistent < 100ms for 1000 entries

### Application Layer Hooks (`src/hooks/`)
- **useSearchEntries.ts** : Hook orchestrating search operations
  - Returns : { results, search, isSearching, error }
  - Signature : search(startDate: string, endDate: string) → Promise<void>
  - Manages loading state during search

### React Components (`src/components/`)
- **SearchPanel.tsx** : Form for date range input
  - Props : onSearch, onCancel, isSearching, error
  - Displays start date and end date inputs
  - Validates before submission

- **SearchResults.tsx** : Display search results in timeline
  - Props : results, onEntryClick, onBack
  - Shows count of results ("42 entrées trouvées")
  - Shows "Aucun résultat" message if empty

## Interfaces

### Domain Service
```typescript
// src/domain/SearchService.ts
export namespace SearchService {
  /**
   * Filter entries by date range (inclusive on both ends).
   * @param entries All entries to search
   * @param startDate YYYY-MM-DD format
   * @param endDate YYYY-MM-DD format
   * @returns Filtered entries, sorted by date descending
   */
  export function filterByDateRange(
    entries: JournalEntry[],
    startDate: string,
    endDate: string
  ): JournalEntry[] {
    return entries.filter(
      e => e.date >= startDate && e.date <= endDate
    );
  }
}
```

### Hook
```typescript
// src/hooks/useSearchEntries.ts
export const useSearchEntries = () => {
  return {
    results: JournalEntry[];
    search: (params: { startDate: string; endDate: string }) => Promise<void>;
    isSearching: boolean;
    error: Error | null;
    clearResults: () => void;
  };
};
```

### Components
```typescript
// src/components/SearchPanel.tsx
interface SearchPanelProps {
  onSearch: (startDate: string, endDate: string) => Promise<void>;
  onCancel: () => void;
  isSearching?: boolean;
  error?: string | null;
}

// src/components/SearchResults.tsx
interface SearchResultsProps {
  results: JournalEntry[];
  onEntryClick: (entry: JournalEntry) => void;
  onBack: () => void;
  onViewAll: () => void;
  isLoading?: boolean;
}
```

## Data Changes

### State Management
- **useSearchEntries** : Stores results in local state
- **App component** : Manages currentView (search vs timeline)
- **No localStorage changes** : Search reads only from existing entries

### Query Patterns
- **Inclusive range** : startDate <= entry.date <= endDate
- **Sorting** : Results maintain timeline order (newest first by default)
- **Empty results** : Return empty array, UI handles message

## Sequence Flow

### Search by Date Range (US-003)
```
1. User on home/timeline view
2. User clicks "Search" or "Rechercher par période"
3. SearchPanel displays with two date inputs
4. User selects start date (e.g., 2026-05-20)
5. User selects end date (e.g., 2026-06-01)
6. User clicks "Search"
7. SearchPanel validates dates:
   a. Both dates YYYY-MM-DD format
   b. startDate <= endDate
8. If invalid, show error inline, don't submit
9. If valid, call useSearchEntries({ startDate, endDate })
10. Hook validates again
11. Hook fetches all entries via repository.getAll()
12. Hook calls SearchService.filterByDateRange(entries, start, end)
13. Service filters O(n), returns matching entries
14. Hook sets isSearching = false, results = filtered array
15. Component renders SearchResults
16. SearchResults shows:
    a. Count: "X entrées trouvées"
    b. Timeline of results or "Aucun résultat"
    c. Button "Voir tout" to clear filter
17. User can click entry to view detail
18. User can click "Voir tout" to return to timeline
```

### Search with No Results
```
1. User enters date range with no matching entries
2. Hook calls SearchService.filterByDateRange()
3. Service returns empty array []
4. SearchResults component checks results.length === 0
5. Shows message: "Aucune entrée trouvée pour cette période"
6. Shows button "Réessayer" or "Voir tout"
```

### Performance Scenario (1000 entries)
```
1. Load 1000 entries from localStorage (< 50ms)
2. Call SearchService.filterByDateRange(1000 entries, start, end)
3. Iterate all 1000, filter by date (< 50ms)
4. Return ~10–100 matching entries
5. Render results (< 50ms)
6. Total: < 100ms (SLA met)
```

## Observability Impact

### Success Cases
- Log search parameters (startDate, endDate)
- Log result count ("Found 42 entries")
- Measure search execution time

### Error Cases
- Log validation errors (invalid date format)
- Log filter errors (shouldn't happen with pure function)
- Show user-friendly error message

### Performance Monitoring
- Measure SearchService.filterByDateRange() execution time
- Target : < 100ms for 1000 entries
- Log if exceeds target (helps identify performance issues)

### User Feedback
- Show loading spinner while fetching entries
- Show result count ("42 entrées trouvées")
- Show "Aucun résultat" if empty
- Show "Erreur lors de la recherche" on failure

## Testing Expectations

### Unit Tests
- SearchService.filterByDateRange() with various date ranges
- Inclusive boundary : start == entry.date, end == entry.date
- Empty results : no entries in range
- All entries : range covers all dates
- Performance : time < 100ms for 1000 entries

### Integration Tests
- Create multiple entries, search by date range, verify results
- Search with empty results, verify message
- Search with full range (all entries), verify all returned

### Component Tests
- SearchPanel renders with date inputs
- Form validates before submission
- SearchResults displays count and entries
- "Voir tout" button returns to timeline
- Click entry in results opens detail view

## Definition of Done

- [ ] SearchService.filterByDateRange() implemented (pure function)
- [ ] Filters entries by date range (inclusive on both ends)
- [ ] Returns entries sorted by date (descending)
- [ ] Performance verified : < 100ms for 1000 entries
- [ ] useSearchEntries hook manages search state and results
- [ ] SearchPanel component for date range input
- [ ] SearchResults component displays results or "no results" message
- [ ] Validation : startDate <= endDate, valid date format
- [ ] Error handling : invalid dates show inline error
- [ ] Loading spinner shows while searching
- [ ] Result count displayed ("X entrées trouvées")
- [ ] "Voir tout" button clears search and returns to timeline
- [ ] Unit tests : 100% coverage of SearchService
- [ ] Integration tests : full search cycles with various date ranges
- [ ] Component tests : form submission, validation, result display
- [ ] Performance profile : confirm < 100ms for 1000-entry searches

