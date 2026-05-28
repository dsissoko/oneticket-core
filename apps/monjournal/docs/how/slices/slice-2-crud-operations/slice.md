# Slice 2 — CRUD Operations & Validation Hooks

## Goal

Build the application layer hooks that handle CRUD (Create, Read, Update, Delete) operations with proper validation, error handling, and state management. This slice enables users to write new entries (US-001), modify and delete existing entries (US-002), and ensures all data operations are transactional and validated.

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Créer une nouvelle entrée de journal](../../what/epics/epic-0-mvp/user-stories/us-001-create-entry.md)
- [US-002 — Voir, éditer et supprimer ses entrées](../../what/epics/epic-0-mvp/user-stories/us-002-view-edit-delete.md)

## Impacted Components

### Application Layer Hooks (`src/hooks/`)
- **useJournalEntries.ts** : Load all entries, manage loading/error state
  - Returns : { entries, isLoading, error, refetch }
  - Side effects : Fetch on mount, handle errors gracefully

- **useCreateEntry.ts** : Create new entry with validation
  - Validates date (YYYY-MM-DD) and text (non-empty)
  - Returns : { createEntry, isCreating, error }
  - Signature : createEntry({ date: string, text: string }) → Promise<JournalEntry>

- **useEditEntry.ts** : Update existing entry
  - Validates updates (same rules as create)
  - Updates updatedAt timestamp (createdAt remains immutable)
  - Returns : { editEntry, isEditing, error }
  - Signature : editEntry(id: string, { date?, text? }) → Promise<JournalEntry>

- **useDeleteEntry.ts** : Delete entry with confirmation
  - Returns : { deleteEntry, isDeleting, error }
  - Signature : deleteEntry(id: string) → Promise<void>

### Domain Layer (`src/domain/`)
- **Validation.ts** : Pure validation functions
  - validateDate(date: string) → boolean
  - validateText(text: string) → boolean
  - validateDateRange(start: string, end: string) → boolean

### React Components (`src/components/`)
- **EntryForm.tsx** : Create/edit form with validation feedback
  - Props : initialEntry?, onSubmit, onCancel
  - Displays validation errors inline
  - Disables submit button during request

- **ConfirmDialog.tsx** (reusable) : Confirmation for destructive actions
  - Props : title, message, onConfirm, onCancel, isConfirming
  - Used by delete operations

## Interfaces

### Hooks
```typescript
// src/hooks/useJournalEntries.ts
export const useJournalEntries = () => {
  return {
    entries: JournalEntry[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
  };
};

// src/hooks/useCreateEntry.ts
export const useCreateEntry = () => {
  return {
    createEntry: (input: { date: string; text: string }) => Promise<JournalEntry>;
    isCreating: boolean;
    error: Error | null;
  };
};

// src/hooks/useEditEntry.ts
export const useEditEntry = () => {
  return {
    editEntry: (id: string, input: { date?: string; text?: string }) => Promise<JournalEntry>;
    isEditing: boolean;
    error: Error | null;
  };
};

// src/hooks/useDeleteEntry.ts
export const useDeleteEntry = () => {
  return {
    deleteEntry: (id: string) => Promise<void>;
    isDeleting: boolean;
    error: Error | null;
  };
};
```

### Validation Functions
```typescript
// src/domain/Validation.ts
export function validateDate(date: string): { valid: boolean; error?: string } {
  // Check YYYY-MM-DD format
  // Check date is not in future
  // Return { valid: true } or { valid: false, error: "..." }
}

export function validateText(text: string): { valid: boolean; error?: string } {
  // Check non-empty (trimmed)
  // Check reasonable length (no limit, but warn if > 10000 chars)
  // Return { valid: true } or { valid: false, error: "..." }
}

export function validateDateRange(
  startDate: string,
  endDate: string
): { valid: boolean; error?: string } {
  // Check both are valid dates
  // Check startDate <= endDate
  // Return { valid: true } or { valid: false, error: "..." }
}
```

### Components
```typescript
// src/components/EntryForm.tsx
interface EntryFormProps {
  initialEntry?: JournalEntry;
  onSubmit: (data: { date: string; text: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

// src/components/ConfirmDialog.tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;  // default "Confirm"
  cancelText?: string;   // default "Cancel"
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
  variant?: 'default' | 'danger';  // red for destructive actions
}
```

## Data Changes

### State Management
- **hooks/useJournalEntries** : Caches entries in state, refetch triggers reload
- **hooks/useCreateEntry** : Transient state (isCreating, error), cleared on success
- **hooks/useEditEntry** : Transient state (isEditing, error)
- **hooks/useDeleteEntry** : Transient state (isDeleting, error)
- **localStorage** : Persistently updated by hooks via repository

### Validation Rules (Domain)
- **Date** : YYYY-MM-DD format, past or present (not future)
- **Text** : Non-empty after trimming, no length limit
- **Edit** : Same validation as create; createdAt never changes
- **Delete** : No validation (immediate after confirmation)

## Sequence Flow

### Create Entry (US-001)
```
1. User accesses EntryForm
2. Form shows today's date as default
3. User fills date and text
4. User clicks "Save"
5. EntryForm validates input
   a. validateDate() → check format and not future
   b. validateText() → check non-empty
6. If invalid, show inline error, don't submit
7. If valid, call useCreateEntry({ date, text })
8. Hook validates again (defense in depth)
9. Hook calls repository.create()
10. Repository generates ID, timestamps, writes to localStorage
11. Hook updates state, returns success
12. Component shows success toast / message
13. Form resets or closes
14. Timeline/App state updates to show new entry
15. User sees entry in timeline
```

### Read All Entries
```
1. useJournalEntries hook mounts
2. Set isLoading = true
3. Call repository.getAll()
4. Repository reads from localStorage, parses JSON
5. Sort by date descending
6. Set entries, isLoading = false, error = null
7. Component receives entries via hook
8. Timeline renders all entries
```

### Edit Entry (US-002)
```
1. User clicks entry in timeline
2. EntryDetail shows entry with Edit button
3. User clicks "Edit"
4. EntryForm loads with initialEntry (pre-filled)
5. User modifies date/text
6. User clicks "Save"
7. Validate same as create (date, text)
8. If valid, call useEditEntry(entryId, { date, text })
9. Hook calls repository.update(id, updates)
10. Repository finds entry, merges updates, sets updatedAt = now
11. Repository writes back to localStorage
12. Hook returns updated entry
13. Component confirms success
14. Return to EntryDetail or Timeline with updated entry visible
```

### Delete Entry (US-002)
```
1. User clicks entry in timeline
2. EntryDetail shows entry with Delete button
3. User clicks "Delete"
4. ConfirmDialog appears : "Delete this entry? This action cannot be undone."
5. User clicks "Confirm" (or "Cancel" to abort)
6. On confirm, call useDeleteEntry(entryId)
7. Hook calls repository.delete(id)
8. Repository filters out entry, writes to localStorage
9. Hook returns void (success implicit)
10. Component confirms deletion
11. Return to Timeline, entry no longer visible
```

## Observability Impact

### Success Cases
- Log entry creation with ID and date
- Log entry updates with ID and timestamp
- Log entry deletion with ID

### Error Cases
- Log validation errors with input context
- Log repository errors (quota exceeded, etc.)
- Display user-friendly error messages in UI (toast/alert)

### Performance Monitoring
- Measure useCreateEntry execution time (should be < 50ms)
- Measure useEditEntry execution time (< 50ms)
- Measure useDeleteEntry execution time (< 50ms)
- Measure useJournalEntries initial load (< 50ms for 1000 entries)

### User Feedback
- Show loading spinner during operations
- Show success toast after create/edit/delete
- Show error toast if operation fails
- Disable submit button while submitting (prevent double-click)

## Testing Expectations

### Unit Tests
- Validation functions : valid dates, invalid dates, empty text, long text
- Hooks : mock repository, test state transitions (idle → loading → success/error)

### Integration Tests
- Create → Read : Create entry, verify in getAll()
- Create → Edit → Read : Verify updated entry
- Create → Delete → Read : Verify entry gone
- Validation : Reject invalid inputs before persistence

### Component Tests (React Testing Library)
- EntryForm renders with today's date
- Form submission validates and calls hook
- Success toast appears after creation
- Error message displays on validation failure
- ConfirmDialog for delete works as expected

## Definition of Done

- [ ] useJournalEntries hook loads all entries on mount
- [ ] useCreateEntry validates date (YYYY-MM-DD, not future) and text (non-empty)
- [ ] useEditEntry updates entry, preserves createdAt, updates updatedAt
- [ ] useDeleteEntry deletes entry from localStorage
- [ ] Validation functions (validateDate, validateText, validateDateRange) implemented
- [ ] EntryForm component renders with pre-filled date (today)
- [ ] ConfirmDialog component appears for destructive actions
- [ ] Error messages displayed to user on validation/network failure
- [ ] Loading states (isCreating, isEditing, isDeleting) show spinner
- [ ] Success feedback (toast/message) after each operation
- [ ] Unit tests : 100% coverage of validation and hook logic
- [ ] Integration tests : full CRUD cycles with localStorage round-trips
- [ ] Component tests : form submission, validation errors, confirmation dialogs
- [ ] Performance verified : all operations complete in < 50ms

