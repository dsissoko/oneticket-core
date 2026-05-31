# Slice 1 — Thought CRUD & List

## Goal

Implement complete CRUD operations for thoughts: create, read, update, delete, and display the thought stream with proper persistence to localStorage.

## Scope

- **Create thoughts** — Form validation, timestamp generation, storage
- **Read/list thoughts** — Display all thoughts sorted by date (newest first)
- **Edit thoughts** — Modify text and tags, preserve creation timestamp
- **Delete thoughts** — Permanent removal with confirmation dialog
- **Persistence** — All operations sync to localStorage
- **Real-time updates** — UI reflects state changes immediately

## Related User Stories

- [US-001 — Create Thought](../../../../what/epics/epic-0-mvp/user-stories/us-001-create-thought.md) — Create thought with markdown text (max 200 chars)
- [US-002 — List Thoughts Stream](../../../../what/epics/epic-0-mvp/user-stories/us-002-list-thoughts.md) — Display thoughts sorted newest first
- [US-003 — Edit and Delete a Thought](../../../../what/epics/epic-0-mvp/user-stories/us-003-edit-delete-thought.md) — Edit/delete with confirmation
- [US-004 — Tag Thoughts](../../../../what/epics/epic-0-mvp/user-stories/us-004-tag-thoughts.md) — Add tags during create/edit (partial, full tagging UI in later slice)

## Implementation Tasks

### 1. Complete storage/storageAdapter.ts

**Implement all CRUD methods:**

```typescript
export class StorageAdapter {
  private readonly KEY = 'monjournal_thoughts'

  loadThoughts(): Thought[] {
    try {
      const data = localStorage.getItem(this.KEY)
      return data ? JSON.parse(data) : []
    } catch {
      console.warn('Failed to load thoughts from storage')
      return []
    }
  }

  saveThoughts(thoughts: Thought[]): void {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(thoughts))
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded')
      }
    }
  }

  addThought(thought: Thought): void {
    const thoughts = this.loadThoughts()
    thoughts.push(thought)
    this.saveThoughts(thoughts)
  }

  updateThought(id: string, updates: Partial<Thought>): void {
    const thoughts = this.loadThoughts()
    const index = thoughts.findIndex(t => t.id === id)
    if (index !== -1) {
      thoughts[index] = { ...thoughts[index], ...updates, id }
      this.saveThoughts(thoughts)
    }
  }

  deleteThought(id: string): void {
    const thoughts = this.loadThoughts()
    const filtered = thoughts.filter(t => t.id !== id)
    this.saveThoughts(filtered)
  }
}
```

### 2. Implement useThoughts() Hook

**hooks/useThoughts.ts:**

```typescript
export function useThoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [editingId, setEditingId] = useState<string | undefined>()

  // Load on mount
  useEffect(() => {
    const loaded = storage.loadThoughts()
    setThoughts(loaded)
  }, [])

  // Sorted getter (newest first)
  const sortedThoughts = useMemo(
    () => [...thoughts].sort((a, b) => b.createdAt - a.createdAt),
    [thoughts]
  )

  const addThought = useCallback((text: string, tags: string[]) => {
    // Validation: max 200 chars
    if (text.length > 200 || text.length === 0) return false

    const thought: Thought = {
      id: nanoid(),
      text,
      tags: tags.map(t => t.toLowerCase().trim()).filter(Boolean),
      createdAt: Date.now(),
    }

    setThoughts(prev => [...prev, thought])
    storage.addThought(thought)
    return true
  }, [])

  const updateThought = useCallback((id: string, text: string, tags: string[]) => {
    if (text.length > 200 || text.length === 0) return false

    const updates = {
      text,
      tags: tags.map(t => t.toLowerCase().trim()).filter(Boolean),
      updatedAt: Date.now(),
    }

    setThoughts(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    )
    storage.updateThought(id, updates)
    setEditingId(undefined)
    return true
  }, [])

  const deleteThought = useCallback((id: string) => {
    setThoughts(prev => prev.filter(t => t.id !== id))
    storage.deleteThought(id)
  }, [])

  return {
    thoughts: sortedThoughts,
    addThought,
    updateThought,
    deleteThought,
    editingId,
    setEditingId,
  }
}
```

### 3. ThoughtForm Component

**components/ThoughtForm.tsx:**

```typescript
interface ThoughtFormProps {
  onSubmit: (text: string, tags: string[]) => void
  initialText?: string
  initialTags?: string[]
  isEditing?: boolean
}

export function ThoughtForm({ onSubmit, initialText = '', initialTags = [], isEditing = false }: ThoughtFormProps) {
  const [text, setText] = useState(initialText)
  const [tags, setTags] = useState(initialTags.join(', '))
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (text.length === 0) {
      setError('Thought cannot be empty')
      return
    }
    if (text.length > 200) {
      setError('Thought must be 200 characters or less')
      return
    }

    onSubmit(text, tags.split(',').map(t => t.trim()).filter(Boolean))
    setText('')
    setTags('')
    setError('')
  }

  return (
    <Box as="form" onSubmit={e => { e.preventDefault(); handleSubmit() }}>
      <FormGroup>
        <FormGroup.Label>Your Thought</FormGroup.Label>
        <TextInput
          as="textarea"
          value={text}
          onChange={e => setText(e.target.value.slice(0, 200))}
          placeholder="What's on your mind? (max 200 characters)"
          maxLength={200}
        />
        <FormGroup.Caption>{text.length}/200</FormGroup.Caption>
      </FormGroup>

      <FormGroup>
        <FormGroup.Label>Tags (comma-separated)</FormGroup.Label>
        <TextInput
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="e.g. happiness, nature, work"
        />
      </FormGroup>

      {error && <Box sx={{ color: 'danger.fg', mb: 2 }}>{error}</Box>}

      <Button variant="primary" onClick={handleSubmit}>
        {isEditing ? 'Update Thought' : 'Create Thought'}
      </Button>
    </Box>
  )
}
```

### 4. ThoughtStream Component

**components/ThoughtStream.tsx:**

```typescript
interface ThoughtStreamProps {
  thoughts: Thought[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  selectedThoughts?: string[]
}

export function ThoughtStream({ thoughts, onEdit, onDelete }: ThoughtStreamProps) {
  if (thoughts.length === 0) {
    return <Box sx={{ textAlign: 'center', py: 4 }}>No thoughts yet. Create your first one!</Box>
  }

  return (
    <Stack direction="vertical" gap={2}>
      {thoughts.map(thought => (
        <ThoughtItem
          key={thought.id}
          thought={thought}
          onEdit={() => onEdit(thought.id)}
          onDelete={() => onDelete(thought.id)}
        />
      ))}
    </Stack>
  )
}
```

### 5. ThoughtItem Component

**components/ThoughtItem.tsx:**

```typescript
interface ThoughtItemProps {
  thought: Thought
  onEdit: () => void
  onDelete: () => void
}

export function ThoughtItem({ thought, onEdit, onDelete }: ThoughtItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete()
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <Box sx={{ border: '1px solid', borderColor: 'border.default', p: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
          {new Date(thought.createdAt).toLocaleString()}
        </Text>
      </Box>

      <Box sx={{ mb: 2, fontSize: 1 }}>
        <ReactMarkdown>{thought.text}</ReactMarkdown>
      </Box>

      {thought.tags.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {thought.tags.map(tag => (
            <Label key={tag} sx={{ mr: 1 }}>{tag}</Label>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button size="small" onClick={onEdit}>Edit</Button>
        <Button
          size="small"
          variant={confirmDelete ? 'danger' : 'default'}
          onClick={handleDelete}
        >
          {confirmDelete ? 'Confirm Delete?' : 'Delete'}
        </Button>
      </Box>
    </Box>
  )
}
```

### 6. Update App.tsx

Integrate form, stream, and state:

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

  const editingThought = thoughts.find(t => t.id === editingId)

  return (
    <ThoughtsProvider>
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

        <ThoughtStream
          thoughts={thoughts}
          onEdit={setEditingId}
          onDelete={deleteThought}
        />
      </Box>
    </ThoughtsProvider>
  )
}
```

### 7. Domain Logic (thoughtValidator.ts, thoughtSort.ts)

**domain/thoughtValidator.ts:**
```typescript
export function validateThought(text: string): { valid: boolean; error?: string } {
  if (text.length === 0) return { valid: false, error: 'Thought cannot be empty' }
  if (text.length > 200) return { valid: false, error: 'Thought must be 200 chars or less' }
  return { valid: true }
}

export function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map(t => t.toLowerCase().trim()).filter(Boolean))]
}
```

## Acceptance Criteria

- ✅ User can create a thought (max 200 chars) via form submission
- ✅ New thought appears at top of stream with auto-timestamp
- ✅ All thoughts display in reverse chronological order (newest first)
- ✅ Each thought shows text, date, and tags
- ✅ Markdown in thought text is rendered properly
- ✅ User can edit a thought (text and tags)
- ✅ User can delete a thought with confirmation
- ✅ All changes persist to localStorage immediately
- ✅ Thoughts load from localStorage on app restart
- ✅ Form validation prevents invalid submissions
- ✅ UI updates in real-time after CRUD operations

## Technical Notes

- localStorage quota error handling (show warning, prevent save)
- Timestamps in milliseconds (Date.now())
- Tags normalized to lowercase
- Markdown rendering via react-markdown
- Confirmation before delete (visual feedback, 3-second timeout)

## Deliverables

1. Full CRUD implementation for thoughts
2. localStorage persistence fully functional
3. ThoughtForm, ThoughtStream, ThoughtItem components complete
4. useThoughts() hook with all methods
5. Type-safe implementation with TypeScript
6. All validation rules enforced
7. No runtime errors or console warnings

## Dependencies

- Depends on: **Slice 0 — Foundation**
- Can be parallelized with other feature slices once foundation is done

## Estimated Effort

**2-3 days** (one developer)

---

**Next:** [Slice 2 — Search & Filter by Tag](../slice-2-search-filter/slice.md)
