# Slice 5 — Surprise Feature & Random Selection

## Goal

Implement the random entry selector (Surprise feature) that allows users to discover entries from their past in a fun, unexpected way. This slice provides uniform random selection with < 50ms performance, enabling users to rediscover forgotten moments (US-005).

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-005 — Découvrir une entrée aléatoire du passé](../../what/epics/epic-0-mvp/user-stories/us-005-surprise-feature.md)

## Impacted Components

### Domain Layer (`src/domain/`)
- **RandomSelector.ts** : Pure function for uniform random selection
  - selectRandom<T>(items: T[]) → T | null
  - Performance : O(1) complexity, < 50ms even with 1000 entries
  - Distribution : Each item has equal probability

### Application Layer Hooks (`src/hooks/`)
- **useSurpriseEntry.ts** : Orchestrate random entry selection
  - Returns : { surpriseEntry, getSurprise, error }
  - Signature : getSurprise() → Promise<void>
  - Manages selected entry state

### React Components (`src/components/`)
- **SurpriseButton.tsx** : Trigger button for surprise feature
  - Props : onClick, disabled, isLoading
  - Icon : 🎲 or dice emoji
  - Text : "Surprise" or "Découvrir"

- **SurpriseView.tsx** : Display selected random entry
  - Props : entry, onNext, onBack, isLoading, error
  - Shows "Surprise du jour" header
  - Full entry (date + text)
  - "Autre surprise" button and "Retour" button

- **NoEntriesMessage.tsx** : Show when no entries exist
  - Props : onCreateClick
  - Message : "Aucune entrée trouvée"
  - Button : "Créer une entrée"

## Interfaces

### Domain Service
```typescript
// src/domain/RandomSelector.ts
export namespace RandomSelector {
  /**
   * Select one item uniformly at random from array.
   * @param items Array of items to choose from
   * @returns One item or null if empty
   */
  export function selectRandom<T>(items: T[]): T | null {
    if (!items.length) return null;
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }
}
```

### Hook
```typescript
// src/hooks/useSurpriseEntry.ts
export const useSurpriseEntry = () => {
  return {
    surpriseEntry: JournalEntry | null;
    getSurprise: () => Promise<void>;
    isLoading: boolean;
    error: Error | null;
  };
};
```

### Components
```typescript
// src/components/SurpriseButton.tsx
interface SurpriseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

// src/components/SurpriseView.tsx
interface SurpriseViewProps {
  entry: JournalEntry | null;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}

// src/components/NoEntriesMessage.tsx
interface NoEntriesMessageProps {
  onCreateClick: () => void;
}
```

## Data Changes

### State Management
- **useSurpriseEntry** : Stores selected entry in state
- **SurpriseView** : Local UI state (entry transitions smoothly)
- **No localStorage changes** : Read-only operation

### Random Distribution
- **Requirement** : Uniform selection (each entry has 1/n probability)
- **Implementation** : Math.floor(Math.random() * length) is sufficient for MVP
- **No bias** : All entries equally likely, no "favorites" or weighted selection

## Sequence Flow

### Access Surprise Feature (US-005)
```
1. User on home/timeline view
2. User clicks "Surprise" button or "🎲 Découvrir"
3. onClick handler triggered
4. App calls useSurpriseEntry()
5. Hook fetches all entries via repository.getAll()
6. Hook verifies entries.length > 0
7. If empty:
   a. Hook sets surpriseEntry = null, error = "No entries"
   b. App renders NoEntriesMessage
   c. User can click "Créer une entrée"
8. If entries exist:
   a. Hook calls RandomSelector.selectRandom(entries)
   b. Selector picks random index: Math.floor(Math.random() * entries.length)
   c. Selector returns entries[index]
   d. Hook sets surpriseEntry, isLoading = false
   e. App renders SurpriseView
   f. SurpriseView shows entry (date + full text)
   g. Buttons visible: "Autre surprise", "Retour"
```

### Select Another Surprise
```
1. User on SurpriseView
2. User clicks "Autre surprise" button
3. onNext handler triggered
4. useSurpriseEntry.getSurprise() called again
5. RandomSelector picks another random entry
6. Could be same entry as before (random, not excluding previous)
7. SurpriseView updates with new entry
8. User can click multiple times rapidly
9. Each click: < 50ms performance
```

### Return from Surprise
```
1. User on SurpriseView
2. User clicks "Retour" or presses Escape
3. onBack handler triggered
4. App navigates back to timeline/home
5. SurpriseView closes
6. Entry not modified (read-only view)
```

### Performance Scenario (1000 entries)
```
1. Load 1000 entries from localStorage (< 50ms)
2. Call RandomSelector.selectRandom(1000)
3. Math.floor(Math.random() * 1000) → instant O(1)
4. Return entries[index] → instant O(1)
5. Hook updates state, component renders (< 50ms)
6. Total: < 100ms (well within SLA)
7. Rapid clicks ("Autre surprise" spam): each < 50ms
```

### Distribution Verification (Testing)
```
1. Run 1000 trials of RandomSelector.selectRandom([a, b, c])
2. Count occurrences of each item
3. Each should be ~333 (within ±5% variance)
4. No item should be consistently favored or excluded
```

## Observability Impact

### Success Cases
- Log when surprise button clicked
- Log selected entry ID
- Measure selection time (should be < 1ms for O(1) operation)

### Error Cases
- Log when no entries available
- Show user-friendly message "Aucune entrée trouvée"

### User Feedback
- Disable button during loading (if async)
- Show loading spinner (typically not needed, but for consistency)
- Display selected entry instantly
- Smooth transition to new entry on "Autre surprise"

### Performance Monitoring
- Measure RandomSelector execution time (should be < 1ms)
- Verify uniform distribution across 1000 trials

## Testing Expectations

### Unit Tests
- RandomSelector.selectRandom() with empty array → null
- RandomSelector with 1 item → returns that item
- RandomSelector with 10 items → returns one of the 10
- Distribution test : 1000 trials should be uniformly distributed (within ±5%)

### Integration Tests
- Create 5 entries, click Surprise 50 times, verify all 5 appear roughly equally
- Call getSurprise() multiple times, verify different entries selected
- Verify previously selected entry can be selected again (not excluded)

### Component Tests
- SurpriseButton renders and is clickable
- SurpriseView displays entry with date and text
- "Autre surprise" button calls onNext
- "Retour" button calls onBack
- NoEntriesMessage shows when no entries
- Click "Créer une entrée" navigates to EntryForm

### Accessibility Tests
- Button is keyboard accessible (Tab, Enter)
- Screen reader announces "Surprise button" and selected entry
- Escape key closes SurpriseView (optional but good UX)
- Focus managed properly (modal focus trapping if desired)

## Definition of Done

- [ ] RandomSelector.selectRandom() implemented as pure O(1) function
- [ ] Uniform distribution verified (each item equally probable)
- [ ] useSurpriseEntry hook fetches all entries and selects random
- [ ] SurpriseButton component renders with icon/text
- [ ] SurpriseView component displays selected entry
- [ ] "Autre surprise" button selects new random entry (< 50ms)
- [ ] "Retour" button closes SurpriseView, returns to timeline
- [ ] NoEntriesMessage shows when no entries exist
- [ ] "Créer une entrée" link navigates to EntryForm
- [ ] Performance verified : < 50ms per selection (even with 1000 entries)
- [ ] Distribution tested : 1000 trials show uniform probability
- [ ] Keyboard accessible (Tab, Enter, Escape)
- [ ] Screen reader support for entry content
- [ ] Unit tests : 100% coverage of RandomSelector
- [ ] Distribution tests : verify uniform random selection
- [ ] Integration tests : multiple selections from various entry counts
- [ ] Component tests : button clicks, navigation, empty state
- [ ] Accessibility tests : keyboard, screen reader, focus management

