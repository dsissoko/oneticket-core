# Slice 1 — Entry CRUD Operations

## Goal

Implement complete Create, Read, Update, Delete (CRUD) operations for journal entries, including domain entity definition, localStorage persistence adapter, and React hooks for managing entry lifecycle. This slice establishes the foundational data model and persistence layer that all other slices depend upon.

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Créer une nouvelle entrée de journal](../../../what/epics/epic-0-mvp/user-stories/us-001-create-entry.md)
- [US-002 — Voir, éditer et supprimer ses entrées de journal](../../../what/epics/epic-0-mvp/user-stories/us-002-view-edit-delete.md)

## Impacted Components

### Domain Layer (`src/domain/`)
- `Entry.ts` — TypeScript type definition for JournalEntry entity
- `IEntryRepository.ts` — Port interface defining repository contract

### Application Layer (`src/hooks/`)
- `useJournalEntries.ts` — Hook to read all entries from repository
- `useCreateEntry.ts` — Hook to create new entry with validation
- `useEditEntry.ts` — Hook to modify existing entry
- `useDeleteEntry.ts` — Hook to delete entry with confirmation state

### Infrastructure Layer (`src/infrastructure/`)
- `LocalStorageRepository.ts` — Adapter implementing IEntryRepository using browser localStorage
- `UUIDGenerator.ts` — Utility for generating deterministic entry IDs
- `DateUtils.ts` — Utilities for ISO 8601 date parsing and validation

### UI Layer (`src/components/`)
- `EntryForm.tsx` — Presentational component for creating/editing entries
- `EntryDetail.tsx` — Presentational component for viewing entry details

## Interfaces

### Domain Entity
```typescript
type JournalEntry = {
  id: string;                    // UUID v4
  date: string;                  // YYYY-MM-DD format
  text: string;                  // Free-form text, non-empty
  createdAt: string;            // ISO 8601 timestamp (immutable)
  updatedAt: string;            // ISO 8601 timestamp (mutable)
  index?: number;               // Position if multiple entries same date
};
```

### Repository Port
```typescript
interface IEntryRepository {
  getAll(): Promise<JournalEntry[]>;
  getById(id: string): Promise<JournalEntry | null>;
  create(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry>;
  update(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry>;
  delete(id: string): Promise<void>;
}
```

### Hook Contracts
```typescript
// useJournalEntries
const { entries, isLoading, error } = useJournalEntries();

// useCreateEntry
const { createEntry, isCreating, error } = useCreateEntry();
await createEntry({ date: '2026-05-28', text: 'My thoughts...' });

// useEditEntry
const { editEntry, isEditing, error } = useEditEntry();
await editEntry(entryId, { text: 'Updated text' });

// useDeleteEntry
const { deleteEntry, isDeleting, error, confirmDelete } = useDeleteEntry();
await confirmDelete(entryId);
```

## Data Changes

### localStorage Schema
**Key:** `journal_entries`  
**Value:** JSON array of JournalEntry objects

```json
[
  {
    "id": "uuid-1",
    "date": "2026-05-28",
    "text": "Today's thoughts...",
    "createdAt": "2026-05-28T14:30:00Z",
    "updatedAt": "2026-05-28T14:30:00Z"
  }
]
```

### Invariants
- `date` must be valid YYYY-MM-DD format (past or present)
- `text` must be non-empty
- `createdAt` is immutable after creation
- `updatedAt` updates on each modification
- `id` is unique UUID v4

## Sequence Flow

### Create Entry Flow
1. User opens EntryForm with default today's date
2. User enters text and optional date
3. User clicks "Save"
4. useCreateEntry validates input (date format, text non-empty)
5. Repository generates ID and timestamps
6. Repository serializes to JSON and writes to localStorage
7. Hook triggers re-render with new entry
8. Success toast displayed, form reset

### Read All Entries Flow
1. useJournalEntries hook mounts on component
2. Hook reads `journal_entries` key from localStorage
3. JSON deserialized into typed JournalEntry[]
4. Array sorted by date descending (newest first)
5. Entries passed to consuming component
6. Component renders entry list/timeline

### Edit Entry Flow
1. User views EntryDetail with existing entry
2. User clicks "Edit" button
3. EntryForm displays pre-filled with existing data
4. User modifies text and/or date
5. User clicks "Save"
6. useEditEntry validates input
7. Repository updates entry with new values
8. updatedAt timestamp updated automatically
9. createdAt remains unchanged
10. Component re-renders with updated entry

### Delete Entry Flow
1. User clicks "Delete" button on EntryDetail
2. Confirmation dialog appears
3. User confirms deletion
4. useDeleteEntry removes entry from localStorage
5. Hook triggers re-render
6. Entry disappears from all views
7. Success toast displayed

## Acceptance Criteria

- [ ] **Entry Type** : `JournalEntry` type exported from `src/domain/Entry.ts`
- [ ] **Repository Pattern** : `IEntryRepository` interface and `LocalStorageRepository` implementation
- [ ] **Create Hook** : `useCreateEntry` validates date/text, generates ID and timestamps, persists to localStorage
- [ ] **Read Hook** : `useJournalEntries` reads all entries, sorted by date descending
- [ ] **Edit Hook** : `useEditEntry` updates entry, preserves `createdAt`, updates `updatedAt`
- [ ] **Delete Hook** : `useDeleteEntry` removes entry with confirmation state
- [ ] **UI Components** : `EntryForm` and `EntryDetail` presentational components
- [ ] **Validation** : Date format validation (YYYY-MM-DD), text non-empty
- [ ] **Performance** : All CRUD operations complete in < 50ms
- [ ] **Error Handling** : Graceful handling of localStorage quota exceeded, parse errors, invalid IDs
- [ ] **localStorage Persistence** : Data survives page reload and browser close
- [ ] **Multiple Entries** : Multiple entries for same date coexist with correct indexing
- [ ] **Unit Tests** : Test repository CRUD, validation logic, hook behavior
- [ ] **TypeScript** : No `any` types, full type coverage

## MSW Handlers

No MSW handlers required for this slice (localStorage-only, no API calls).

## Technical Notes

### localStorage Quota Management
- Safe capacity: ~10,000 entries before quota risk (~5-10 MB per domain)
- Error handling: Show error toast if write fails, do not corrupt existing data
- Overflow: Graceful degradation, user informed to delete old entries

### Date Format
- Always YYYY-MM-DD for comparisons and storage
- ISO 8601 for timestamps (2026-05-28T14:30:00Z)
- Display formatting handled by consuming components

### UUID Generation
- Use `crypto.randomUUID()` or uuid library for v4 generation
- Ensure deterministic within single session for testing

### Timestamps
- Always UTC (Z suffix)
- createdAt set once, never modified
- updatedAt updated on every modification

### Error Recovery
- Wrap localStorage access in try-catch
- Fall back to empty array if deserialization fails
- Log errors for debugging but show user-friendly messages

## Implementation Sequence

1. Define domain entity (`src/domain/Entry.ts`)
2. Define repository interface (`src/domain/IEntryRepository.ts`)
3. Implement localStorage adapter (`src/infrastructure/LocalStorageRepository.ts`)
4. Create utility functions (UUID, date validation)
5. Implement hooks (useJournalEntries, useCreateEntry, useEditEntry, useDeleteEntry)
6. Create presentational components (EntryForm, EntryDetail)
7. Integrate hooks into components
8. Write unit tests for domain logic and repository
9. Add integration tests for hook behavior
10. Manual testing of full CRUD workflow

## Observability Impact

### Logging
- Log successful CRUD operations (create, update, delete) to console in development
- Log localStorage serialization/deserialization errors
- Track operation timing to ensure < 50ms performance target

### Error Boundaries
- Catch localStorage errors and display graceful fallback
- Show error toast for validation failures
- Console warn for unexpected state

### Performance Metrics
- Mark/measure for create operation timing
- Mark/measure for read operation timing (especially with 1000+ entries)
- Monitor localStorage quota usage via DevTools
