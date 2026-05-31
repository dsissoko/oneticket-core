# Slice 3 — Surprise Button & Random Selection

## Goal

Implement the surprise feature: a button that displays a random thought from the currently filtered set, allowing users to rediscover their thoughts in an unexpected way.

## Scope

- **Surprise button** — Visible button to trigger random thought display
- **Random selection** — Pick one random thought from filtered list
- **Surprise modal/view** — Display single thought in highlighted way
- **Respects filters** — Random selection only from thoughts matching current search/tag filters
- **Repeat random** — "Next surprise" button shows another random thought
- **Close surprise** — Button to return to full filtered list view
- **Empty state handling** — Graceful message if no thoughts available

## Related User Stories

- [US-007 — Random Surprise Button](../../../../what/epics/epic-0-mvp/user-stories/us-007-random-surprise.md) — Random thought discovery with filter respect

## Implementation Tasks

### 1. useSurprise() Hook

**hooks/useSurprise.ts:**

```typescript
export function useSurprise(filteredThoughts: Thought[]) {
  const [showSurprise, setShowSurprise] = useState(false)
  const [surpriseThought, setSurpriseThought] = useState<Thought | null>(null)

  const pickSurprise = useCallback(() => {
    if (filteredThoughts.length === 0) {
      return
    }

    const randomIndex = Math.floor(Math.random() * filteredThoughts.length)
    const thought = filteredThoughts[randomIndex]
    setSurpriseThought(thought)
    setShowSurprise(true)
  }, [filteredThoughts])

  const closeSurprise = useCallback(() => {
    setShowSurprise(false)
    setSurpriseThought(null)
  }, [])

  const nextSurprise = useCallback(() => {
    pickSurprise()
  }, [pickSurprise])

  return {
    showSurprise,
    surpriseThought,
    pickSurprise,
    closeSurprise,
    nextSurprise,
  }
}
```

### 2. SurpriseButton Component

**components/SurpriseButton.tsx:**

```typescript
interface SurpriseButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function SurpriseButton({ onClick, disabled = false }: SurpriseButtonProps) {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      disabled={disabled}
      sx={{
        backgroundColor: disabled ? 'var(--color-btn-inactive-bg)' : 'var(--color-btn-primary-bg)',
      }}
    >
      🎲 Surprise Me!
    </Button>
  )
}
```

### 3. SurpriseModal Component

**components/SurpriseModal.tsx:**

```typescript
interface SurpriseModalProps {
  show: boolean
  thought: Thought | null
  onClose: () => void
  onNext: () => void
}

export function SurpriseModal({ show, thought, onClose, onNext }: SurpriseModalProps) {
  if (!show || !thought) {
    return null
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          backgroundColor: 'canvas.default',
          borderRadius: 2,
          p: 4,
          maxWidth: 600,
          width: '90%',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Heading as="h2" sx={{ fontSize: 3, mb: 2 }}>
            ✨ A Random Thought
          </Heading>
        </Box>

        <Box sx={{ mb: 4, p: 3, backgroundColor: 'canvas.subtle', borderRadius: 1 }}>
          <Box sx={{ fontSize: 2, mb: 2, lineHeight: 1.6 }}>
            <ReactMarkdown>{thought.text}</ReactMarkdown>
          </Box>

          <Box sx={{ fontSize: 0, color: 'fg.muted', mb: 2 }}>
            {new Date(thought.createdAt).toLocaleString()}
          </Box>

          {thought.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {thought.tags.map(tag => (
                <Label key={tag} variant="secondary">{tag}</Label>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="default" onClick={onClose}>
            Back to List
          </Button>
          <Button variant="primary" onClick={onNext}>
            Another Surprise 🎲
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
```

### 4. Update App.tsx

Integrate surprise feature:

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

  const {
    showSurprise,
    surpriseThought,
    pickSurprise,
    closeSurprise,
    nextSurprise,
  } = useSurprise(filteredThoughts)

  const editingThought = thoughts.find(t => t.id === editingId)

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Header>
        <Heading as="h1">MonJournal</Heading>
      </Header>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <SurpriseButton
          onClick={pickSurprise}
          disabled={filteredThoughts.length === 0}
        />
      </Box>

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

      {!showSurprise && (
        <ThoughtStream
          thoughts={filteredThoughts}
          onEdit={setEditingId}
          onDelete={deleteThought}
        />
      )}

      <SurpriseModal
        show={showSurprise}
        thought={surpriseThought}
        onClose={closeSurprise}
        onNext={nextSurprise}
      />
    </Box>
  )
}
```

### 5. Integration Points

- **Surprise button** positioned near search/controls for easy access
- **Disabled state** when no thoughts available or filtered list is empty
- **Modal overlay** prevents interaction with main content
- **"Another Surprise"** picks random again from same filtered set
- **"Back to List"** returns to stream view and closes modal
- **Random selection** respects current filters (search + tags)

### 6. Edge Cases

- **No thoughts:** Button disabled, show disabled state
- **No filtered results:** Button disabled
- **Single thought:** Still works, always shows same thought on "Another Surprise"
- **Thought deleted while surprise open:** Close surprise to refresh (graceful degradation)

## Acceptance Criteria

- ✅ Surprise button is visible and clickable
- ✅ Button disabled when no thoughts available
- ✅ Click opens modal showing single random thought
- ✅ Modal displays thought text, date, tags (same as stream view)
- ✅ Random selection only from thoughts matching current filters
- ✅ "Another Surprise" button picks different random (or same if only 1)
- ✅ "Back to List" returns to filtered stream view
- ✅ Modal can be closed by X or clicking background
- ✅ Markdown in surprise thought renders correctly
- ✅ Surprise modal is visually distinct (larger text, highlight)

## Technical Notes

- Random selection: `Math.floor(Math.random() * filteredThoughts.length)`
- Modal is overlay with semi-transparent background
- Modal respects current filter state (search + tags)
- No changes to thought data when using surprise
- Surprise state isolated in useSurprise() hook

## Deliverables

1. useSurprise() hook with random selection logic
2. SurpriseButton component
3. SurpriseModal component with full UI
4. App integration with modal display logic
5. Disabled state handling when no thoughts
6. Fully functional surprise feature

## Dependencies

- Depends on: **Slice 0 — Foundation**, **Slice 1 — Thought CRUD**, **Slice 2 — Search & Filter**
- Final slice; completes all features

## Estimated Effort

**1-2 days** (one developer)

---

## All Slices Complete!

This is the final feature slice. Once all slices are delivered, MonJournal MVP is complete with:

✅ Thought CRUD (create, read, edit, delete)  
✅ localStorage persistence  
✅ Tag management & filtering  
✅ Full-text search  
✅ Random surprise discovery  
✅ Responsive design  
✅ Markdown rendering  

Next steps: Testing, deployment, and future enhancements documented in [Architecture Open Questions](../../architecture.md#13-open-questions--future-decisions).
