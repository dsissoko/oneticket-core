# Slice 1 — Entry Data Model & localStorage Adapter

## Goal

Establish the foundation for all data persistence by implementing the JournalEntry domain entity, the IEntryRepository port, and the LocalStorageRepository adapter. This slice ensures that all entry data can be reliably read, created, and stored in browser localStorage with proper error handling and type safety.

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Créer une nouvelle entrée de journal](../../what/epics/epic-0-mvp/user-stories/us-001-create-entry.md)
- [US-002 — Voir, éditer et supprimer ses entrées](../../what/epics/epic-0-mvp/user-stories/us-002-view-edit-delete.md)
- [US-003 — Rechercher ses entrées par période](../../what/epics/epic-0-mvp/user-stories/us-003-search-by-period.md)
- [US-004 — Voir une timeline visuelle](../../what/epics/epic-0-mvp/user-stories/us-004-timeline-view.md)
- [US-005 — Découvrir une entrée aléatoire](../../what/epics/epic-0-mvp/user-stories/us-005-surprise-feature.md)

## Impacted Components

### Domain Layer (`src/domain/`)
- **JournalEntry.ts** : TypeScript type definition for entry entity
  - Properties : id, date, text, createdAt, updatedAt
  - Validation rules : non-empty text, valid date format (YYYY-MM-DD), immutable timestamps

### Infrastructure Layer (`src/infrastructure/`)
- **IEntryRepository.ts** : Interface defining the contract for entry persistence
  - Methods : getAll(), getById(), create(), update(), delete()
  - Return types : Promise<JournalEntry[]>, Promise<JournalEntry>, Promise<void>
  - Error handling : throws descriptive errors on failure

- **LocalStorageRepository.ts** : Implementation of IEntryRepository using browser localStorage
  - Serialization : JSON.stringify / JSON.parse
  - localStorage key : "journal_entries"
  - Fallback : graceful handling if localStorage unavailable or quota exceeded

### Utilities (`src/infrastructure/`)
- **UUIDGenerator.ts** : Generate and validate UUID v4 for entry IDs
- **DateUtils.ts** : Parse, format, and compare dates in YYYY-MM-DD format
  - Functions : parseDate(), formatDate(), isValidDate(), compareDates()
- **StorageManager.ts** : Safe read/write wrapper around localStorage
  - Error handling : quota exceeded, corrupted data, missing key

## Interfaces

### Domain
```typescript
// src/domain/JournalEntry.ts
export type JournalEntry = {
  id: string;                    // UUID v4
  date: string;                  // YYYY-MM-DD
  text: string;                  // Non-empty, free-form text
  createdAt: string;            // ISO 8601 timestamp (immutable)
  updatedAt: string;            // ISO 8601 timestamp (mutable)
};

export type CreateEntryInput = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEntryInput = Partial<Omit<JournalEntry, 'id' | 'createdAt'>>;
```

### Port (Interface)
```typescript
// src/infrastructure/ports/IEntryRepository.ts
export interface IEntryRepository {
  getAll(): Promise<JournalEntry[]>;
  getById(id: string): Promise<JournalEntry | null>;
  create(input: CreateEntryInput): Promise<JournalEntry>;
  update(id: string, input: UpdateEntryInput): Promise<JournalEntry>;
  delete(id: string): Promise<void>;
}
```

### Adapter (Implementation)
```typescript
// src/infrastructure/adapters/LocalStorageRepository.ts
export class LocalStorageRepository implements IEntryRepository {
  private readonly storageKey = 'journal_entries';

  async getAll(): Promise<JournalEntry[]> {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return [];
    try {
      const entries = JSON.parse(data) as JournalEntry[];
      return entries.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('Failed to parse entries from localStorage', error);
      return [];
    }
  }

  async getById(id: string): Promise<JournalEntry | null> {
    const entries = await this.getAll();
    return entries.find(e => e.id === id) ?? null;
  }

  async create(input: CreateEntryInput): Promise<JournalEntry> {
    const entry: JournalEntry = {
      ...input,
      id: UUIDGenerator.generate(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const entries = await this.getAll();
    entries.push(entry);
    this.saveToStorage(entries);
    return entry;
  }

  async update(id: string, input: UpdateEntryInput): Promise<JournalEntry> {
    const entries = await this.getAll();
    const index = entries.findIndex(e => e.id === id);
    if (index === -1) throw new Error(`Entry ${id} not found`);
    
    entries[index] = {
      ...entries[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(entries);
    return entries[index];
  }

  async delete(id: string): Promise<void> {
    const entries = await this.getAll();
    const filtered = entries.filter(e => e.id !== id);
    this.saveToStorage(filtered);
  }

  private saveToStorage(entries: JournalEntry[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        throw new Error('localStorage quota exceeded');
      }
      throw error;
    }
  }
}
```

## Data Changes

### localStorage Schema
**Key** : `journal_entries`  
**Type** : JSON array  
**Initial state** : Empty array `[]`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2026-05-28",
    "text": "Today's journal entry",
    "createdAt": "2026-05-28T14:30:00.000Z",
    "updatedAt": "2026-05-28T14:30:00.000Z"
  }
]
```

### Migration & Compatibility
- **Version 1 (MVP)** : Simple flat array, no versioning scheme
- **Future versions** : Versioned schema with migration helpers (phase 2)

## Sequence Flow

### Create Entry Flow
```
User fills EntryForm → onSubmit()
  ↓
Hook: useCreateEntry({ date, text })
  ↓
Repository.create(input)
  ↓
Generate UUID + timestamps
  ↓
Read existing entries from localStorage
  ↓
Append new entry
  ↓
Write JSON to localStorage
  ↓
Return created entry
  ↓
Hook updates React state
  ↓
Component re-renders with new entry
```

### Read All Entries Flow
```
Component mounts or requests entries
  ↓
Hook: useJournalEntries()
  ↓
Repository.getAll()
  ↓
Read value from localStorage['journal_entries']
  ↓
JSON.parse() → array
  ↓
Sort by date descending
  ↓
Return entries
  ↓
Hook updates React state
  ↓
Timeline component renders
```

### Update Entry Flow
```
User clicks Edit → submits form
  ↓
Hook: useEditEntry(id, { text })
  ↓
Repository.update(id, updates)
  ↓
Read all entries
  ↓
Find entry by id
  ↓
Merge updates, set updatedAt to now
  ↓
Write back to localStorage
  ↓
Return updated entry
  ↓
Hook updates state
  ↓
Component re-renders
```

### Delete Entry Flow
```
User clicks Delete → confirms
  ↓
Hook: useDeleteEntry(id)
  ↓
Repository.delete(id)
  ↓
Read all entries
  ↓
Filter out entry by id
  ↓
Write remaining entries to localStorage
  ↓
Return void
  ↓
Hook triggers UI update
  ↓
Timeline removes entry from view
```

## Observability Impact

### Logging Points
- **Create** : Log entry ID and date on success, log errors with context
- **Read** : Log count of entries loaded, log parse errors if localStorage corrupted
- **Update** : Log ID and updatedAt timestamp
- **Delete** : Log ID of deleted entry

### Error Scenarios
- **Corrupted JSON** : Log error, return empty array (graceful degradation)
- **Quota exceeded** : Throw error with helpful message, suggest exporting data
- **Entry not found** : Throw error with ID context
- **Invalid input** : Validate before persistence, reject with validation error

### Performance Metrics (Phase 2)
- Measure time for getAll() — should be < 50ms for 1000 entries
- Measure JSON.parse time — profile if > 10ms
- Measure write time — should be < 50ms including serialization

### Testing Expectations
- Unit tests for UUIDGenerator, DateUtils, validation functions
- Integration tests for LocalStorageRepository (mock localStorage)
- Happy path : create, read, update, delete cycles
- Error cases : corrupted JSON, quota exceeded, missing entries
- Edge cases : empty array, single entry, large text (5000+ chars)

## Definition of Done

- [ ] JournalEntry type defined with proper TypeScript constraints
- [ ] IEntryRepository interface defined with all CRUD methods
- [ ] LocalStorageRepository implements interface with error handling
- [ ] UUIDGenerator produces valid UUID v4 identifiers
- [ ] DateUtils parses, formats, and compares YYYY-MM-DD dates correctly
- [ ] StorageManager wraps localStorage with quota and corruption handling
- [ ] Unit tests pass : 100% coverage of repository methods
- [ ] Integration tests pass : round-trip create/read/update/delete cycles
- [ ] localStorage schema documented in code comments
- [ ] Error handling tested : quota exceeded, corrupted JSON, missing entries
- [ ] Performance verified : all operations complete in < 50ms

