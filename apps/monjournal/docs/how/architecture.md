# Journal Personnel — Architecture

## 1. Architecture Principles

1. **Zero Backend** — All data persists in browser localStorage; no server infrastructure required
2. **Layered Hexagonal Architecture** — Clear separation between domain logic, application layer, adapters, and infrastructure
3. **Type Safety** — Full TypeScript coverage across all layers
4. **Component Isolation** — React components are stateless presenters delegating all logic to hooks and domain layer
5. **Performance First** — All operations on localStorage complete in <50ms; timeline renders 1000+ entries fluidly
6. **Accessibility by Default** — WCAG 2.1 AA compliance built into component design
7. **Primer Design System** — All UI primitives inherit GitHub Primer visual language (colors, spacing, typography)
8. **Dark/Light Mode Native** — System preference detection + manual theme selector using Primer CSS variables

## 2. System Overview

Journal Personnel is a single-page application (SPA) for personal journaling. Users write, search, and rediscover their journal entries entirely on the client side using localStorage as the persistence layer. The architecture supports:

- **User journeys** : Create → Read → Edit → Delete → Search → Surprise → Timeline
- **Technical scope** : React 18 + Vite + TypeScript + Primer React + MSW (for future API mocking) + localStorage
- **Deployment** : Static GitHub Pages (no build backend needed)

The system is designed as a hexagon: a domain core surrounded by application services, adapters (React components, MSW), and an infrastructure layer (localStorage).

## 3. Architectural Style

**Hexagonal Architecture (Ports & Adapters)** — adapted for a frontend SPA:

```
┌─────────────────────────────────────┐
│       React Components (UI)         │  ← Adapter: Presentation Layer
│       (EntryForm, Timeline, etc)    │
├─────────────────────────────────────┤
│  Custom React Hooks (Business Logic)│  ← Application Layer
│  (useJournalEntry, useSearch, etc)  │
├─────────────────────────────────────┤
│   Domain Entities & Rules           │  ← Domain Layer
│   (JournalEntry, BusinessRules)     │
├─────────────────────────────────────┤
│  Adapters: localStorage, MSW        │  ← Infrastructure Layer
│  (EntryRepository, API Simulation)  │
└─────────────────────────────────────┘
```

**Rationale** :
- **Domain (Core)** : Pure business logic, zero dependencies on React or infrastructure
- **Application** : Orchestrates domain logic via hooks; manages local state and side effects
- **Adapters** : React components (UI), MSW handlers (mock API for testing)
- **Infrastructure** : localStorage persistence, date utilities, browser APIs

**Benefits** :
- Testable domain logic without React dependencies
- Easy to swap localStorage with an API layer in phase 2
- Clear responsibility boundaries reduce bugs and onboarding time

## 4. Main Technical Boundaries

### Domain Layer (`src/domain/`)
- **JournalEntry** entity : `{ id, date, text, createdAt, updatedAt }`
- **EntryRepository interface** : contract for CRUD operations
- **Search algorithm** : date range filtering, O(n) complexity
- **Random selector** : uniform selection from entry collection

### Application Layer (`src/hooks/`)
- **useJournalEntries()** : reads all entries from repository
- **useCreateEntry(date, text)** : validates, creates, persists
- **useEditEntry(id, updates)** : modifies existing entry, updates timestamp
- **useDeleteEntry(id)** : removes entry with confirmation state
- **useSearchEntries(startDate, endDate)** : filters by date range
- **useSurpriseEntry()** : selects random entry uniformly
- **useTheme()** : manages light/dark mode state

### Adapter Layer (`src/components/`, `src/api/`)
- **React Components** : EntryForm, EntryList, Timeline, SearchPanel, SurpriseView, ThemeSelector
- **MSW Handlers** : mock handlers for future API endpoints (GET /entries, POST /entries, etc.)
- **Event handlers** : click, submit, keyboard navigation

### Infrastructure Layer (`src/infrastructure/`)
- **LocalStorageRepository** : implements EntryRepository using browser localStorage
- **DateUtils** : ISO 8601 parsing, formatting, comparison
- **UUIDGenerator** : deterministic entry IDs

## 5. Key Components

### 1. Entry Entity (Domain)
```typescript
type JournalEntry = {
  id: string;                    // UUID
  date: string;                  // YYYY-MM-DD
  text: string;                  // Free-form text
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp (mutable)
  index?: number;               // Position if multiple entries same date
};
```

**Invariants** :
- `date` must be valid (YYYY-MM-DD format)
- `text` must be non-empty
- `createdAt` is immutable after creation
- `updatedAt` updates on each modification

### 2. useJournalEntries Hook (Application)
Reads all entries from localStorage, returns sorted array.

**Contract** :
```typescript
const { entries, isLoading, error } = useJournalEntries();
// entries: JournalEntry[], sorted by date descending (newest first)
// isLoading: boolean (typically false for localStorage)
// error: null | Error
```

### 3. useCreateEntry Hook (Application)
Validates input, creates entry, persists to localStorage, triggers UI update.

**Contract** :
```typescript
const { createEntry, isCreating, error } = useCreateEntry();
await createEntry({ date: '2026-05-28', text: 'My thoughts...' });
// Returns: { id, createdAt, updatedAt, ...rest }
```

### 4. useSearchEntries Hook (Application)
Filters entries by date range (inclusive).

**Contract** :
```typescript
const { results, search, isSearching, error } = useSearchEntries();
search({ startDate: '2026-05-20', endDate: '2026-06-01' });
// results: JournalEntry[] matching [startDate, endDate]
```

### 5. useSurpriseEntry Hook (Application)
Selects one entry uniformly at random.

**Contract** :
```typescript
const { surpriseEntry, getSurprise, error } = useSurpriseEntry();
getSurprise(); // selects random entry, updates state
// surpriseEntry: JournalEntry | null
```

### 6. Timeline Component (Adapter)
Renders chronological list of entries with date anchors.

**Props** :
```typescript
interface TimelineProps {
  entries: JournalEntry[];
  onEntryClick: (entry: JournalEntry) => void;
  onDateClick: (date: string) => void;
  sortOrder?: 'desc' | 'asc'; // 'desc' = newest first
}
```

### 7. EntryForm Component (Adapter)
Allows user to create or edit an entry.

**Props** :
```typescript
interface EntryFormProps {
  initialEntry?: JournalEntry;
  onSubmit: (data: { date: string; text: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string | null;
}
```

### 8. SearchPanel Component (Adapter)
Date range selector with "Search" button.

**Props** :
```typescript
interface SearchPanelProps {
  onSearch: (startDate: string, endDate: string) => Promise<void>;
  isSearching: boolean;
  error?: string | null;
}
```

### 9. SurpriseView Component (Adapter)
Displays random entry with "Next Surprise" and "Back" buttons.

**Props** :
```typescript
interface SurpriseViewProps {
  entry: JournalEntry | null;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string | null;
}
```

### 10. ThemeSelector Component (Adapter)
Light/dark mode toggle with Primer CSS variable injection.

**Props** :
```typescript
interface ThemeSelectorProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}
```

## 6. Key Interfaces

### EntryRepository (Port)
Defines contract for entry persistence (localStorage, future API).

```typescript
interface IEntryRepository {
  getAll(): Promise<JournalEntry[]>;
  getById(id: string): Promise<JournalEntry | null>;
  create(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry>;
  update(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry>;
  delete(id: string): Promise<void>;
}
```

### LocalStorageRepository (Adapter)
Implements IEntryRepository using browser localStorage.

**Key methods** :
- `getAll()` : deserialize JSON from `journal_entries` key, return array
- `create()` : generate ID, timestamps, serialize, store
- `update()` : merge fields, update `updatedAt`, serialize, store
- `delete()` : remove from array, serialize, store
- Error handling : graceful degradation if localStorage is full or unavailable

### SearchService (Application)
Pure function for date range filtering.

```typescript
function filterByDateRange(
  entries: JournalEntry[],
  startDate: string,
  endDate: string
): JournalEntry[] {
  return entries.filter(e => e.date >= startDate && e.date <= endDate);
}
```

### RandomSelector (Application)
Pure function for uniform random selection.

```typescript
function selectRandom<T>(items: T[]): T | null {
  if (!items.length) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}
```

## 7. Data Architecture

### localStorage Schema
**Key** : `journal_entries`  
**Value** : JSON array of JournalEntry objects

```json
[
  {
    "id": "uuid-1",
    "date": "2026-05-28",
    "text": "Today's thoughts...",
    "createdAt": "2026-05-28T14:30:00Z",
    "updatedAt": "2026-05-28T14:30:00Z"
  },
  {
    "id": "uuid-2",
    "date": "2026-05-28",
    "text": "Evening reflection...",
    "createdAt": "2026-05-28T20:00:00Z",
    "updatedAt": "2026-05-28T20:00:00Z"
  }
]
```

### Data Flow
1. **Write** : App → Hook → Domain validation → Repository.create() → localStorage
2. **Read** : localStorage → Repository.getAll() → Hook → Component render
3. **Update** : App → Hook → Domain validation → Repository.update() → localStorage
4. **Delete** : App → Hook → Confirmation dialog → Repository.delete() → localStorage
5. **Search** : Hook → SearchService.filterByDateRange() → Component render
6. **Random** : Hook → RandomSelector.selectRandom() → Component render

### Size & Limits
- **localStorage quota** : ~5–10 MB per domain (varies by browser)
- **Typical entry** : 500 bytes (200 chars text + metadata)
- **Safe capacity** : ~10,000 entries before quota risk
- **Overflow handling** : Show error toast if write fails; do not corrupt existing data

## 8. Security Architecture

### In-Scope
- **No authentication required** : Single user, local-only data
- **No encryption** : localStorage is accessible to any script on same domain
- **XSS Protection** : React auto-escapes JSX expressions; sanitize if pasting rich HTML (future)
- **localStorage isolation** : Scoped to single domain; other domains cannot read

### Out-of-Scope (Phase 2)
- Cloud sync / backup
- End-to-end encryption
- Multi-device synchronization
- Authentication / authorization

### Browser Security Assumptions
- User controls their own browser; no shared-user scenarios
- localStorage persists across tab closes (intentional — feature, not bug)
- Same-origin policy enforces isolation from other sites

## 9. Deployment Strategy

### Hosting
- **GitHub Pages** : Static file serving, no build backend
- **Domain** : `https://{username}.github.io/journal-personnel/` (or custom domain via CNAME)
- **Branch** : Deployed from `main` or `gh-pages` branch

### Build Pipeline (GitHub Actions)
1. Run `npm install` in `apps/monjournal/`
2. Run `npm run build` (Vite) → produces `dist/` folder
3. Deploy `dist/` to GitHub Pages
4. Verify via `https://{repo}/journal-personnel/`

### Environment
- **No .env files** : Static app requires no secrets
- **Base path** : Set `vite.config.ts` base to `/journal-personnel/` (or root if custom domain)

### Bundle Size Targets
- **Total gzipped** : < 500 KB
- **React 18** : ~42 KB gzipped
- **Vite build** : Tree-shaking, code-splitting, minification enabled
- **Primer React** : CSS-in-JS, import only used components

## 10. Observability Strategy

### Development
- **Console logging** : Non-blocking debug info for localStorage ops, searches, random selection
- **Error boundaries** : Catch React render errors, display graceful fallback
- **Vite DevTools** : Source maps, hot module replacement

### Production
- **Error logging** : Silently log to localStorage (circular buffer) for bug reports (phase 2)
- **Performance metrics** : Mark/measure for search, random selection, timeline render (via browser DevTools)
- **User-facing errors** : Toast notifications for localStorage quota, validation failures

### Monitoring (Out-of-Scope MVP)
- Analytics (users, features used, error rates)
- Crash reporting (Sentry, etc.)
- Performance monitoring (Web Vitals)

## 11. Related C4 Views

- [System Context](../c4/system-context.md)
- [Containers](../c4/containers.md)
- [Components](../c4/components.md)
- [Deployment](../c4/deployment.md)

## 12. Related Implementation Slices

See [how/slices/](../slices/) for all implementation slices derived from this architecture.

Expected slices (to be produced in next task):
1. **Slice 1 — Entry Data Model & localStorage Adapter** : Domain entity, repository interface, localStorage implementation
2. **Slice 2 — CRUD Operations** : Create, read, update, delete hooks with validation
3. **Slice 3 — Search & Filter** : Date range search, sorted results
4. **Slice 4 — Timeline Component** : Chronological view, date anchors, click handlers
5. **Slice 5 — Surprise Feature** : Random selector, uniform distribution
6. **Slice 6 — Theme Switcher & Primer Integration** : Light/dark mode, CSS variables
7. **Slice 7 — E2E Workflows & Deployment** : End-to-end tests, GitHub Pages validation

## 13. Technical Constraints

### Frontend Stack
- **React** : 18.x (Hooks: useState, useEffect, useCallback, useContext)
- **Vite** : Build tool, dev server with HMR
- **TypeScript** : Strict mode, no `any` types
- **Primer React** : `@primer/react` for components, `@primer/primitives` for design tokens
- **MSW** : Mock Service Worker v2 for API simulation (inactive MVP; ready for phase 2)

### Data Constraints
- **Date format** : YYYY-MM-DD (ISO 8601) for all date fields
- **Timestamps** : ISO 8601 (e.g., `2026-05-28T14:30:00Z`)
- **Entry ID** : UUID v4
- **Text limit** : No programmatic limit (localStorage quota is the constraint)

### Performance Targets
- **Create/Edit/Delete** : < 50 ms per operation
- **Search (1000 entries)** : < 100 ms
- **Timeline render (1000 entries)** : < 1 second, 60 fps scroll
- **Random selection** : < 50 ms
- **Page load** : < 2 seconds (on 4G)

### Accessibility Standards
- **WCAG 2.1** : Level AA minimum
- **Color contrast** : 4.5:1 for text, 3:1 for large text
- **Keyboard navigation** : Full keyboard support (Tab, Shift+Tab, Enter, Escape)
- **Screen readers** : Semantic HTML, ARIA labels, announcements for state changes
- **Focus management** : Visible focus indicators, modal focus trapping

### Browser Support
- **Modern browsers** : Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- **ES version** : ES2020 (Vite default) — async/await, spread operator, nullish coalescing
- **Mobile** : iOS 13+, Android Chrome/Firefox

## 14. Open Questions

1. **localStorage Quota Management** :
   - What happens when the ~5–10 MB limit is reached?
   - Proposed answer: Show error toast, suggest export (phase 2)

2. **Date Format Display** :
   - Should dates be shown in user's locale (e.g., "28 mai 2026") or ISO (2026-05-28)?
   - Proposed answer: Locale-aware formatting via `Intl.DateTimeFormat`

3. **Multiple Entries per Date** :
   - Should we display them with time of creation as a secondary sort?
   - Proposed answer: Sort by `createdAt` within the same date, show as separate items in timeline

4. **Search Results Sorting** :
   - Should search results preserve timeline order or be chronological?
   - Proposed answer: Match timeline sort order (user preference: newest or oldest first)

5. **Deletion Confirmation** :
   - Modal dialog, inline confirmation, or both?
   - Proposed answer: Modal dialog with clear warning + "Confirm" button (no undo)

6. **Theme Persistence** :
   - Should user's theme choice be saved to localStorage?
   - Proposed answer: Yes, under `journal_theme` key; default to system preference on first visit

7. **Empty State UX** :
   - How should the app appear when no entries exist?
   - Proposed answer: Friendly message with "Create First Entry" button prominently displayed

8. **Performance Optimization** :
   - Should we virtualize the timeline (render only visible items) for 1000+ entries?
   - Proposed answer: Use React windowing library (react-window) in phase 2 if needed; MVP uses simple map()

9. **Mobile Responsiveness** :
   - Should timeline be horizontal swipe or vertical scroll on mobile?
   - Proposed answer: Vertical scroll (more accessible on mobile); swipe gesture optional in phase 2

10. **Error Recovery** :
    - If localStorage becomes corrupted, should we offer a "recover" or "reset" option?
    - Proposed answer: Graceful error boundary; suggest manual browser cache clear; add recovery UI in phase 2
