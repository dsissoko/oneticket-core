# Slice 4 — Surprise Feature (Random Entry Picker)

## Goal

Implement random entry selection feature allowing users to discover past entries in a playful, serendipitous manner. This slice provides a SurpriseView component, useSurpriseEntry hook, and uniform random selection logic. Enables users to rediscover forgotten moments and adds delight to the journaling experience.

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-005 — Découvrir une entrée aléatoire du passé avec le bouton "Surprise"](../../what/epics/epic-0-mvp/user-stories/us-005-surprise-feature.md)

## Impacted Components

### Domain Layer (`src/domain/`)
- `RandomSelector.ts` — Pure function for uniform random selection from array

### Application Layer (`src/hooks/`)
- `useSurpriseEntry.ts` — Hook managing surprise entry state and selection

### UI Layer (`src/components/`)
- `SurpriseView.tsx` — Main surprise view displaying entry with navigation buttons
- `SurpriseButton.tsx` — Button triggering surprise feature (visible in primary navigation)

## Interfaces

### Random Selector
```typescript
function selectRandom<T>(items: T[]): T | null {
  if (!items.length) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}
```

### Hook Contract
```typescript
const {
  surpriseEntry,           // Currently displayed entry | null
  getSurprise,             // Function to select new random entry
  nextSurprise,            // Alias for getSurprise
  goBack,                  // Function to return to timeline
  isLoading,               // Loading state (usually false for localStorage)
  error                    // Error state if no entries exist
} = useSurpriseEntry(entries);
```

### Component Props
```typescript
interface SurpriseViewProps {
  entry: JournalEntry | null;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string | null;
}

interface SurpriseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;  // "🎲 Surprise" or "🎲 Découvrir"
}
```

## Data Changes

No new localStorage structure. Uses existing `journal_entries` for reading only.

### Random Selection Algorithm
- Uniform distribution using `Math.floor(Math.random() * length)`
- No bias toward any particular entry
- O(1) time complexity

## Sequence Flow

### Surprise Feature Initiation
1. User clicks "Surprise" button in navigation or UI
2. useSurpriseEntry.getSurprise() called
3. RandomSelector.selectRandom() picks uniform random entry
4. SurpriseView component displays selected entry
5. Full entry text visible (date, text, timestamps if desired)
6. "Autre surprise" and "Retour" buttons displayed

### Successive Surprises
1. User reads surprise entry
2. User clicks "Autre surprise" button
3. useSurpriseEntry.getSurprise() called again
4. New random entry selected (may repeat with large datasets)
5. SurpriseView updates with new entry
6. Transition/animation optional for delight

### Return to Timeline
1. User clicks "Retour" button
2. useSurpriseEntry.goBack() clears surprise state
3. Timeline view restored
4. No entries modified (read-only operation)

### Empty State
1. User has 0 entries in localStorage
2. User clicks "Surprise" button
3. useSurpriseEntry detects no entries
4. SurpriseView displays "Aucune entrée trouvée" message
5. Button "Créer une entrée" navigates to EntryForm
6. User can create their first entry

### Performance with Large Dataset
1. User has 1000 entries
2. User clicks "Surprise"
3. Random selection completes in < 50ms
4. "Autre surprise" responds instantly to repeated clicks
5. No lag, freeze, or console errors

## Acceptance Criteria

- [ ] **Surprise Button** : Visible in main navigation/UI, clearly labeled
- [ ] **Random Selection** : selectRandom() uses uniform distribution algorithm
- [ ] **Uniform Distribution** : Each entry has equal probability of selection
- [ ] **Entry Display** : Full entry text, date, createdAt/updatedAt shown
- [ ] **Next Button** : "Autre surprise" selects new random entry, updates view
- [ ] **Back Button** : "Retour" returns to timeline/previous view
- [ ] **Empty State** : Display message + "Créer une entrée" button if no entries
- [ ] **Read-Only** : Surprise feature does not modify any entries
- [ ] **Performance** : Random selection < 50ms, even with 1000+ entries
- [ ] **Keyboard Access** : Tab to button, Enter/Space to trigger, Escape to back
- [ ] **Accessibility** : WCAG 2.1 AA — clear labels, focus management, screen reader support
- [ ] **Error Handling** : Graceful handling of corrupted entry data, empty arrays
- [ ] **Unit Tests** : Test selectRandom distribution (statistical test with seed)
- [ ] **Integration Tests** : Test hook with real entry data, state updates

## MSW Handlers

No MSW handlers required (localStorage-only, no API calls). Future phase 2 may add `GET /entries/random` endpoint.

## Technical Notes

### Random Distribution Testing
- Seeded random for deterministic testing (optional: override Math.random in tests)
- Run 1000 selections with 10 entries, verify each appears ~100 times (±20% acceptable)
- Use statistical tests (chi-squared) for robustness

### Seed-Based Testing (Optional)
```typescript
// Allow overridable random generator
function selectRandom<T>(items: T[], randomFn?: () => number): T | null {
  const rng = randomFn || Math.random;
  const index = Math.floor(rng() * items.length);
  return items[index];
}
```

### Empty State Handling
- Check array length before selecting
- Return null if no entries
- Hook detects null and shows empty state UI
- No error thrown (graceful)

### User Delight (Optional Enhancements)
- Smooth fade/slide transition between entries
- Confetti or celebration animation on first surprise
- Counter showing "You've discovered X entries" (Phase 2)
- "Surprise streak" (multiple surprises in a row)

### State Management
- Surprise state local to hook/component
- Not persisted to localStorage
- Fresh random selection on each trigger
- Dismissing surprise clears state

### Touch/Mobile Support
- Large touch targets (48px minimum)
- Buttons easy to tap on small screens
- Swipe gestures optional (Phase 2)

## Implementation Sequence

1. Implement RandomSelector pure function with unit tests
2. Implement useSurpriseEntry hook with state management
3. Create SurpriseView component (entry display + buttons)
4. Create SurpriseButton component (main navigation button)
5. Integrate SurpriseButton into main App component
6. Integrate SurpriseView into main App layout (modal or panel)
7. Wire hooks and event handlers
8. Implement keyboard navigation (Tab, Enter, Escape)
9. Add loading state (if localStorage access becomes async)
10. Handle edge cases (empty entries, null entry)
11. Write unit tests for selectRandom distribution
12. Write integration tests for hook and components
13. Manual testing with 1, 10, 100, 1000 entries
14. Performance testing and profiling

## Observability Impact

### Logging
- Log surprise button clicks (frequency, user engagement)
- Log successful random selections
- Log empty state encounters (no entries)
- Log "Autre surprise" repeated selections

### Error Messages
- "Aucune entrée trouvée — Créez votre première entrée pour utiliser la Surprise"
- "Erreur lors de la sélection aléatoire — Veuillez réessayer"

### Performance Metrics
- Mark/measure for random selection (< 50ms target)
- Monitor selection frequency (how often users use surprise feature)
- Track time spent in surprise view

### Analytics (Future)
- Track "Surprise" feature usage rate
- Track repeat usage (do users click "Autre surprise" multiple times?)
- Track surprise-to-detail or surprise-to-timeline flow
- A/B test button placement and label variations

### Delight Tracking (Future)
- Survey users: "Did the Surprise feature delight you?"
- Track emotional engagement (smile emoji reactions, if supported)
