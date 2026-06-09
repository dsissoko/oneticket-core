<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

# Slice 3 — Filtering & Search

## Overview

This slice implements the filtering and search capability for MonJournal. It enables users to refine their view of thoughts by applying multiple filter criteria simultaneously: text search (title + content), date range selection, multi-select tag filtering, and a surprise filter for random thought discovery.

Slice 3 depends on **Slice 1 (Data Foundation)** which provides the data models, hooks, and filter logic, and **Slice 2 (Thought List Display)** which provides the display components. This slice builds the UI layer for filtering and orchestrates how filters are applied to both list and timeline views.

The slice implements:
1. **FilterPanel component** — unified filter UI with text search, date range picker, tag multi-select, and surprise button
2. **Filter state management** — local component state (useState) in the Home container to manage filter selections
3. **Filter application logic** — applies filters to thought list and timeline views in real-time
4. **Text search** — case-insensitive substring matching on title and content
5. **Date range filtering** — inclusive filtering based on thought `createdAt` timestamp
6. **Tag filtering** — displays all available tags; shows thoughts matching any selected tag
7. **Surprise filter** — randomly selects one thought from current filtered results and highlights it

This slice is **user-facing** and directly implements the exploration and discovery experience of MonJournal.

## Technical Scope

### Components

#### 1. FilterPanel
- **Purpose**: Unified UI container for all filtering controls
- **Props**:
  - `existingTags: Tag[]` — array of all available tags (derived from Slice 1)
  - `onFilterChange: (filters: FilterState) => void` — callback when filter state changes
  - `onSurpriseClick: () => void` — callback when user clicks surprise button
- **Rendering**:
  - **Text search input**: Single text input field with placeholder "Search title and content"
    - Real-time update on input change
  - **Date range picker**: Two date input fields (start and end dates)
    - Allows selection of date range (inclusive bounds)
    - Both fields optional
  - **Tag multi-select**: Checkbox list or dropdown with selected badges
    - Shows all available tags from `existingTags`
    - Multiple selection allowed
    - Visual indication of selected tags
  - **Surprise button**: Button to trigger random thought selection
    - Label: "Surprise!" or similar
    - Disabled if no filtered results exist
  - **Optional clear/reset button**: Clears all filters to default state
- **Local state**: Manages `text`, `dateStart`, `dateEnd`, `selectedTags` internally
- **Styling**: Responsive layout (vertical stack on mobile, horizontal on desktop if space permits)

#### 2. DateRangePicker (sub-component of FilterPanel)
- **Purpose**: Encapsulate date range selection logic
- **Props**:
  - `dateStart: number | null` — start date timestamp or null
  - `dateEnd: number | null` — end date timestamp or null
  - `onChange: (start: number | null, end: number | null) => void`
- **Rendering**:
  - Two HTML `<input type="date">` fields
  - Labels: "From:" and "To:"
  - Allow clearing dates (empty field = null)
- **Validation**: Ensure start date ≤ end date if both are set; optionally warn user

#### 3. TagMultiSelect (sub-component of FilterPanel)
- **Purpose**: Encapsulate tag selection UI
- **Props**:
  - `availableTags: Tag[]` — all available tags
  - `selectedTags: string[]` — currently selected tag names
  - `onChange: (selectedTags: string[]) => void`
- **Rendering**:
  - List of checkboxes or toggle buttons, one per tag
  - Each tag shows colored chip or indicator (from Slice 1 `getTagColor()`)
  - Selected state clearly indicated (checked, highlighted)
  - Layout: flex wrap or grid to handle many tags
- **Interaction**: Click to toggle selection

### Filter State Management

#### FilterState Type (from Slice 1, reused here)

```typescript
interface FilterState {
  text?: string;                    // text search query (case-insensitive)
  dateStart?: number;               // timestamp in ms, or null
  dateEnd?: number;                 // timestamp in ms, or null
  selectedTags?: string[];          // array of selected tag names (empty = no filter)
}
```

#### Filter State Lifecycle

- **Initialization**: `Home` component initializes filter state with `useState({})`
  - All filters are optional and default to "no filter applied"
- **Updates**: `FilterPanel` calls `onFilterChange(newFilterState)` on each user interaction
- **Application**: `Home` receives updated state and calls `filterThoughts(filterState)` from Slice 1
- **Rendering**: Filtered thoughts passed to `ThoughtList` or `TimelineView` (Slice 2)
- **Persistence**: Filters are **NOT** persisted across page reloads (ephemeral session state)

### Filter Application Logic

#### Text Search: `matchesTextSearch(thought, query: string) -> boolean`

- **Implementation**: from Slice 1's `filterLogic.ts`
- **Behavior**:
  - Case-insensitive substring matching
  - Matches against both `thought.title` and `thought.content`
  - Empty query matches all thoughts
  - Example: query "deadline" matches title="Work deadline" or content="...approaching deadline..."

#### Date Range Filtering: `matchesDateRange(thought, start, end) -> boolean`

- **Implementation**: from Slice 1's `filterLogic.ts`
- **Behavior**:
  - Inclusive bounds: `start ≤ thought.createdAt ≤ end`
  - Missing start: only check `thought.createdAt ≤ end`
  - Missing end: only check `start ≤ thought.createdAt`
  - Both missing: match all thoughts (no filter)
  - Example: start="2026-06-01", end="2026-06-30" matches all June thoughts

#### Tag Filtering: `matchesTags(thought, selectedTags[]) -> boolean`

- **Implementation**: from Slice 1's `filterLogic.ts`
- **Behavior**:
  - **OR logic**: thought matches if it contains ANY of the selected tags
  - Empty `selectedTags`: match all thoughts (no filter)
  - Example: if user selects tags ["work", "personal"], a thought with tags ["work", "morning"] matches
  - Comparison: case-sensitive exact string match of tag names

#### Surprise Filter: `selectRandomThought(filteredThoughts[]) -> Thought`

- **Implementation**: in `Home` component or utility
- **Behavior**:
  - Select random index from filtered results: `Math.floor(Math.random() * filteredThoughts.length)`
  - Return the thought at that index
  - Highlight or scroll into view in the current display (list or timeline)
  - Disabled button if `filteredThoughts.length === 0`
- **Visual feedback**: Highlight the selected thought (e.g., border highlight, background color, animation)

#### Composite Filter Application: `applyFilters(thoughts, filterState) -> Thought[]`

- **Implementation**: from Slice 1's `filterLogic.ts`
- **Composition**: All filters combined with **AND logic**
  - A thought must match ALL active filters to appear in results
  - Each filter is optional; if not set, it doesn't exclude any thoughts
- **Algorithm**:
  ```
  filtered = thoughts
  if (filterState.text) {
    filtered = filtered.filter(t => matchesTextSearch(t, filterState.text))
  }
  if (filterState.dateStart || filterState.dateEnd) {
    filtered = filtered.filter(t => matchesDateRange(t, filterState.dateStart, filterState.dateEnd))
  }
  if (filterState.selectedTags?.length > 0) {
    filtered = filtered.filter(t => matchesTags(t, filterState.selectedTags))
  }
  return filtered
  ```

### Integration with Home Component

The `Home` component orchestrates the entire filtering flow:

1. **Initialize filter state**: `const [filterState, setFilterState] = useState({})`
2. **Initialize view mode**: `const [viewMode, setViewMode] = useState('list')`
3. **Fetch thoughts**: `const { thoughts } = useThoughts()`
4. **Apply filters**: `const filteredThoughts = applyFilters(thoughts, filterState)`
5. **Render FilterPanel**:
   - Pass `existingTags` (from `useThoughts().getTags()`)
   - Pass `onFilterChange` handler that updates `filterState`
   - Pass `onSurpriseClick` handler that selects random thought
6. **Render view**:
   - If `viewMode === 'list'`: render `ThoughtList` with `filteredThoughts`
   - If `viewMode === 'timeline'`: render `TimelineView` with `filteredThoughts`
7. **View toggle**: Include `ViewModeToggle` to switch between list/timeline

### Empty State

- **When**: No thoughts match current filter criteria
- **Display**: Friendly message: "No thoughts match your filters. Try adjusting your search or date range."
- **Rendered in**: Both `ThoughtList` and `TimelineView` (Slice 2) already handle this

## Implementation Steps

1. **Create FilterPanel component** (`src/components/FilterPanel.tsx`)
   - Render text input, date inputs, tag multi-select, buttons
   - Manage local state for all filter fields
   - Call `onFilterChange()` on each field change
   - Call `onSurpriseClick()` on surprise button click

2. **Create DateRangePicker sub-component** (`src/components/DateRangePicker.tsx`)
   - Two `<input type="date">` fields
   - Handle date parsing and null values
   - Validate that start ≤ end if both are set

3. **Create TagMultiSelect sub-component** (`src/components/TagMultiSelect.tsx`)
   - Render checkbox or toggle button for each tag
   - Use `TagDisplay` from Slice 2 for colored visual representation
   - Track selected state, call `onChange()` with updated selection

4. **Update Home component** (`src/pages/Home.tsx`)
   - Import `FilterPanel` from Slice 3
   - Initialize `filterState` with `useState({})`
   - Add `onFilterChange` handler that updates `filterState`
   - Call `applyFilters(thoughts, filterState)` from Slice 1 to get filtered results
   - Add `onSurpriseClick` handler that:
     - Selects random index from `filteredThoughts`
     - Highlights the selected thought (e.g., ref to DOM element or scroll into view)
     - Manages highlight state (optional: clear on scroll or filter change)
   - Render components in order: `FilterPanel`, `ViewModeToggle`, then `ThoughtList` or `TimelineView`

5. **Verify filter logic** (from Slice 1)
   - Ensure `matchesTextSearch()` is case-insensitive and matches title OR content
   - Ensure `matchesDateRange()` is inclusive and handles null bounds correctly
   - Ensure `matchesTags()` uses OR logic (any selected tag matches)
   - Ensure `applyFilters()` combines with AND logic

## Acceptance Criteria

1. ✅ FilterPanel component displays text search input
2. ✅ Text search filters both title and content with case-insensitive substring matching
3. ✅ FilterPanel displays date range picker with start and end date fields
4. ✅ Date range filtering shows only thoughts within range (inclusive)
5. ✅ FilterPanel displays multi-select tag filter with all available tags
6. ✅ Tag filter shows thoughts containing ANY selected tag (OR logic)
7. ✅ FilterPanel displays surprise button to select random thought from filtered results
8. ✅ Surprise button is disabled when no filtered results exist
9. ✅ Filters are composable: all active filters work together with AND logic
10. ✅ Filters apply to list view in real-time as selections change
11. ✅ Filters apply to timeline view in real-time as selections change
12. ✅ Empty results show friendly message when no thoughts match filter criteria
13. ✅ Filter state is managed locally in Home component (not persisted)
14. ✅ ViewModeToggle allows switching between list and timeline views with active filters applied
15. ✅ Tag colors in multi-select match those in thought cards (consistent with Slice 1)

## Testing Strategy

- **Unit tests**:
  - `matchesTextSearch()`: case-insensitive, title/content matching, empty query
  - `matchesDateRange()`: inclusive bounds, null handling, date comparisons
  - `matchesTags()`: OR logic, exact match, empty selection
  - `applyFilters()`: AND composition, ordering of filter application

- **Component tests**:
  - `FilterPanel`: renders all controls, calls `onFilterChange()` on input change
  - `DateRangePicker`: parses dates, validates bounds, handles null
  - `TagMultiSelect`: renders all tags, toggles selection, calls `onChange()`
  - `Home`: initializes filter state, applies filters, updates display

- **Integration tests**:
  - Full filter flow: change text → see results update
  - Date range filter → filtered results correct
  - Tag filter with multiple selections → OR logic verified
  - Filters combine (AND logic): apply text + date + tag → correct intersection
  - Surprise button: randomly selects from filtered results, highlights
  - Switch views (list ↔ timeline) → filters still applied

- **Visual/E2E tests**:
  - FilterPanel layout responsive on mobile/desktop
  - Tag chips display with correct colors
  - Empty state message appears when no results
  - Surprise highlight is visually clear
  - Filter controls are accessible and keyboard-navigable

- **Edge cases**:
  - Empty filter state (no filters applied) → all thoughts shown
  - All filters applied simultaneously
  - No thoughts match any filter combination → empty state
  - Start date > end date (validation/warning)
  - Very long search query → performance
  - Many tags available (100+) → UI layout
  - Surprise button with 1 thought in results (select it)
  - Clear filters → back to all thoughts

## Dependencies

- **Slice 1 (Data Foundation)**: Provides `useThoughts`, `Thought`, `Tag`, `FilterState`, `applyFilters()`, `matchesTextSearch()`, `matchesDateRange()`, `matchesTags()`
- **Slice 2 (Thought List Display)**: Provides `ThoughtList`, `TimelineView`, `TagDisplay`, `ViewModeToggle`
- **React**: useState, useEffect hooks
- **AppShell**: CSS base styles, responsive design utilities

## Related Epics

- [Epic 0 — MonJournal MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-002 — Multi-Filter](../../../what/epics/epic-0-mvp/user-stories/us-002-multi-filter.md)