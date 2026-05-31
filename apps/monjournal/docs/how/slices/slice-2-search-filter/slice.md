# Slice 2 — Search & Filter by Tag

## Goal

Implement full-text search and tag-based filtering with a refined UI for filter controls and search input.

## Scope

- **Keyword search** — Filter thoughts by text content (case-insensitive)
- **Tag filtering** — Select one or multiple tags with AND logic
- **Search bar** — Input field with real-time filtering
- **Filter pills** — Visual tag selection interface
- **Clear filters** — Reset all filters and search in one action
- **Live updates** — Instant UI updates as filters change

## Related User Stories

- [US-005 — Filter by Tag](../../../../what/epics/epic-0-mvp/user-stories/us-005-filter-by-tag.md) — Filter by selected tags, AND logic
- [US-006 — Search Thoughts by Keyword](../../../../what/epics/epic-0-mvp/user-stories/us-006-search-thoughts.md) — Real-time keyword search

## Implementation Tasks

### 1. useFilters() Hook

**hooks/useFilters.ts:**

```typescript
export function useFilters(thoughts: Thought[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Calculate available tags from all thoughts
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    thoughts.forEach(t => t.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [thoughts])

  // Filter thoughts by search and selected tags
  const filteredThoughts = useMemo(() => {
    return thoughts.filter(thought => {
      // Search filter: match keyword in text
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!thought.text.toLowerCase().includes(query)) {
          return false
        }
      }

      // Tag filter: AND logic (thought must have ALL selected tags)
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every(tag => thought.tags.includes(tag))
        if (!hasAllTags) {
          return false
        }
      }

      return true
    })
  }, [thoughts, searchQuery, selectedTags])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedTags([])
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    availableTags,
    filteredThoughts,
    clearFilters,
  }
}
```

### 2. SearchBar Component

**components/SearchBar.tsx:**

```typescript
interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search thoughts...' }: SearchBarProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <TextInput
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{
          width: '100%',
          py: 2,
          px: 3,
          fontSize: 1,
        }}
        leadingVisual={SearchIcon}
      />
    </Box>
  )
}
```

### 3. FilterBar Component

**components/FilterBar.tsx:**

```typescript
interface FilterBarProps {
  availableTags: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onClearFilters: () => void
  showClearButton?: boolean
}

export function FilterBar({
  availableTags,
  selectedTags,
  onToggleTag,
  onClearFilters,
  showClearButton = true,
}: FilterBarProps) {
  if (availableTags.length === 0) {
    return null
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Text sx={{ fontSize: 0, fontWeight: 'bold', color: 'fg.muted' }}>
          Filter by Tag:
        </Text>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        {availableTags.map(tag => (
          <Button
            key={tag}
            size="small"
            variant={selectedTags.includes(tag) ? 'primary' : 'default'}
            onClick={() => onToggleTag(tag)}
          >
            {tag}
          </Button>
        ))}
      </Box>

      {showClearButton && selectedTags.length > 0 && (
        <Button
          size="small"
          variant="invisible"
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      )}
    </Box>
  )
}
```

### 4. Domain Logic (thoughtFilter.ts)

**domain/thoughtFilter.ts:**

```typescript
export function searchThoughts(thoughts: Thought[], query: string): Thought[] {
  if (!query.trim()) return thoughts

  const lowerQuery = query.toLowerCase()
  return thoughts.filter(thought =>
    thought.text.toLowerCase().includes(lowerQuery)
  )
}

export function filterByTags(thoughts: Thought[], selectedTags: string[]): Thought[] {
  if (selectedTags.length === 0) return thoughts

  // AND logic: thought must have ALL selected tags
  return thoughts.filter(thought =>
    selectedTags.every(tag => thought.tags.includes(tag))
  )
}

export function applyAllFilters(
  thoughts: Thought[],
  query: string,
  selectedTags: string[]
): Thought[] {
  let result = thoughts
  result = searchThoughts(result, query)
  result = filterByTags(result, selectedTags)
  return result
}
```

### 5. Update App.tsx

Integrate search and filter components:

```typescript
export function App() {
  const {
    thoughts,
    addThought,
    updateThought,
    deleteThought,
    editingId,
    setEditingId,
  } = useThoughts()

  const {
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    availableTags,
    filteredThoughts,
    clearFilters,
  } = useFilters(thoughts)

  const editingThought = thoughts.find(t => t.id === editingId)

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Header>
        <Heading as="h1">MonJournal</Heading>
      </Header>

      <Box sx={{ mb: 4 }}>
        <ThoughtForm
          onSubmit={(text, tags) => {
            if (editingThought) {
              updateThought(editingThought.id, text, tags)
            } else {
              addThought(text, tags)
            }
          }}
          initialText={editingThought?.text}
          initialTags={editingThought?.tags}
          isEditing={!!editingId}
        />
      </Box>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
      />

      <FilterBar
        availableTags={availableTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onClearFilters={clearFilters}
      />

      {selectedTags.length > 0 || searchQuery ? (
        <Box sx={{ mb: 3, fontSize: 0, color: 'fg.muted' }}>
          Showing {filteredThoughts.length} of {thoughts.length} thoughts
        </Box>
      ) : null}

      <ThoughtStream
        thoughts={filteredThoughts}
        onEdit={setEditingId}
        onDelete={deleteThought}
      />
    </Box>
  )
}
```

### 6. Integration Points

- **useFilters** updates whenever `thoughts` changes (new thought added/deleted)
- **SearchBar** updates search state in real-time
- **FilterBar** updates selected tags state
- **ThoughtStream** receives filtered thoughts and re-renders
- Clear filters button accessible in FilterBar

## Acceptance Criteria

- ✅ User can type keyword in search box
- ✅ Search is case-insensitive and matches substring
- ✅ Thought list updates in real-time as user types
- ✅ Available tags display dynamically based on current thoughts
- ✅ User can click tags to filter (button highlight shows selection)
- ✅ Multiple tags can be selected with AND logic (thought must have ALL)
- ✅ "Clear Filters" button resets search and tag selection
- ✅ Filtered count displays (e.g., "Showing 3 of 10 thoughts")
- ✅ Empty search field shows all thoughts
- ✅ If no thoughts match filters, message says so
- ✅ FilterBar doesn't show if no tags available

## Technical Notes

- Search is client-side (no API calls)
- Filtering is memoized for performance (useMemo)
- Tag toggle uses controlled button state
- AND logic for tags: filter(thought => selectedTags.every(tag => thought.tags.includes(tag)))
- SearchBar uses TextInput with search icon (Primer)

## Deliverables

1. useFilters() hook with full filtering logic
2. SearchBar component (text input)
3. FilterBar component (tag pills with toggle)
4. Domain logic functions (searchThoughts, filterByTags, applyAllFilters)
5. App integration with live-updating filtered stream
6. Real-time filtering without lag

## Dependencies

- Depends on: **Slice 0 — Foundation**, **Slice 1 — Thought CRUD**
- Can be parallelized with **Slice 3** if needed

## Estimated Effort

**1-2 days** (one developer)

---

**Next:** [Slice 3 — Surprise Button](../slice-3-surprise/slice.md)
