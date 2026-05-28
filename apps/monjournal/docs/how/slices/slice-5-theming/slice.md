# Slice 5 — Theme Switching and Primer Design System Integration

## Goal

Implement light/dark mode theming with automatic system preference detection and manual user selection. Integrate GitHub Primer design system CSS variables across all components. This slice provides a ThemeSelector component, useTheme hook, and theme persistence layer. Ensures visual consistency, accessibility, and a cohesive user experience across the application.

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

As theme switching is a transversal feature supporting all user stories, this slice does not directly map to a single user story but enhances UX across:
- US-001 through US-005 (all user stories benefit from consistent theming)

## Impacted Components

### Application Layer (`src/hooks/`)
- `useTheme.ts` — Hook managing theme state and persistence

### UI Layer (`src/components/`)
- `ThemeSelector.tsx` — Component for manual theme switching
- `App.tsx` — Root component injecting theme CSS variables

### Styles (`src/styles/`)
- `theme.css` — Primer CSS variables and custom theme overrides
- `index.css` — Global styles with theme-aware selectors

### Infrastructure Layer (`src/infrastructure/`)
- `ThemeService.ts` — Service for reading/writing theme preference to localStorage

## Interfaces

### Theme Type
```typescript
type Theme = 'light' | 'dark';

interface ThemeConfig {
  theme: Theme;
  systemPreference: boolean;  // Use system preference (true) or manual (false)
}
```

### Hook Contract
```typescript
const {
  theme,                      // Current theme: 'light' | 'dark'
  setTheme,                   // Function to set theme manually
  systemPreference,           // Is system preference enabled?
  setSystemPreference,        // Enable/disable system preference
  toggleTheme                 // Quick toggle function
} = useTheme();
```

### Component Props
```typescript
interface ThemeSelectorProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  showSystemPreference?: boolean;  // Show option to use system preference
}

interface ThemeProviderProps {
  children: React.ReactNode;
}
```

## Data Changes

### localStorage Schema
**Key:** `journal_theme`  
**Value:** JSON object

```json
{
  "theme": "dark",
  "systemPreference": false
}
```

**Default:** `{ theme: "light", systemPreference: true }` (respect system preference on first visit)

## Sequence Flow

### Application Initialization
1. App component mounts
2. useTheme hook initializes
3. Reads `journal_theme` from localStorage (or defaults to system preference)
4. Detects system preference via `prefers-color-scheme` media query
5. Determines effective theme (manual override or system preference)
6. CSS variables injected into document root
7. All Primer components inherit theme automatically

### Manual Theme Selection
1. User clicks ThemeSelector button (sun/moon icon)
2. Theme menu/dropdown appears with options: "Light", "Dark", "System"
3. User selects "Light" or "Dark"
4. setTheme() called with new theme
5. useTheme updates state and writes to localStorage
6. CSS variables re-applied
7. All components instantly switch appearance (no page reload)
8. Selection persisted for next visit

### System Preference Change
1. User changes OS theme (e.g., switches to dark mode at sunset)
2. prefers-color-scheme media query triggers
3. useTheme detects change (if systemPreference enabled)
4. Effective theme updates automatically
5. CSS variables re-applied
6. UI updates in real-time (if CSS variables reactive)

### CSS Variable Injection
```typescript
// Example: setTheme('dark')
document.documentElement.setAttribute('data-color-mode', 'dark');
document.documentElement.style.colorScheme = 'dark';
// Primer CSS picks up CSS variables automatically
```

### Component Rendering
1. EntryForm, Timeline, SearchPanel, SurpriseView all render
2. Components use Primer components (@primer/react)
3. Primer components read CSS variables for colors
4. All text, backgrounds, borders inherit theme colors
5. No component-level theme logic needed (centralized)

## Acceptance Criteria

- [ ] **Theme Toggle** : Button in header/navigation for manual theme selection
- [ ] **System Preference** : Detect `prefers-color-scheme` on first visit
- [ ] **Persistence** : Theme choice saved to localStorage under `journal_theme` key
- [ ] **Auto-Switch** : If system preference enabled, theme updates when OS theme changes
- [ ] **CSS Variables** : All colors use Primer CSS variables (--color-canvas-default, etc.)
- [ ] **Instant Switch** : No page reload on theme change
- [ ] **Primer Integration** : All @primer/react components respect theme
- [ ] **Custom Styling** : Custom CSS uses Primer color variables
- [ ] **Contrast** : WCAG 2.1 AA color contrast in both light and dark modes
- [ ] **Focus Indicators** : Focus rings visible in both themes
- [ ] **Accessibility** : prefers-reduced-motion respected (no unnecessary animations)
- [ ] **Mobile** : Theme toggle accessible and touch-friendly on mobile
- [ ] **Documentation** : README explains theme customization
- [ ] **Unit Tests** : Test localStorage read/write, system preference detection
- [ ] **Integration Tests** : Test theme switching, CSS variable injection

## MSW Handlers

No MSW handlers required (client-side theme state only).

## Technical Notes

### Primer CSS Variables
Primer provides comprehensive CSS variable set:
- `--color-canvas-default` : Main background
- `--color-canvas-overlay` : Modal/overlay background
- `--color-canvas-inset` : Secondary background
- `--color-border-default` : Border color
- `--color-text-primary` : Primary text
- `--color-text-secondary` : Secondary text
- `--color-success-fg` : Success state
- `--color-danger-fg` : Danger state
- Full list: [Primer Design Tokens](https://primer.style/design/foundations/color)

### System Preference Detection
```typescript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const listener = (e: MediaQueryListEvent) => {
  if (systemPreference && e.matches) {
    setTheme('dark');
  } else if (systemPreference && !e.matches) {
    setTheme('light');
  }
};
prefersDark.addListener(listener);
```

### localStorage Persistence
- Key: `journal_theme`
- Format: JSON object with theme and systemPreference flags
- Default: Respect system preference on first visit
- Graceful: If corrupted, fall back to system preference

### Fallback for Old localStorage
- Check for legacy `journal_dark_mode` boolean key
- Migrate to new format if found
- Delete old key after migration

### Transition Animations (Optional)
- Smooth fade or color transition on theme switch
- Respect `prefers-reduced-motion` for accessibility
- Duration: 150-300ms

### Testing Theme Switch
- Seed localStorage with known theme value
- Override window.matchMedia in tests
- Verify CSS variables applied to document root
- Verify Primer components render correctly

## Implementation Sequence

1. Create ThemeService for localStorage I/O
2. Implement useTheme hook with state management
3. Create ThemeSelector component (toggle button + menu)
4. Create theme.css with Primer variable overrides
5. Integrate useTheme into App root component
6. Inject CSS variables on mount and theme change
7. Set up system preference detection
8. Integrate ThemeSelector into header/navigation
9. Test manual theme switching
10. Test system preference detection
11. Verify all components render correctly in both themes
12. Accessibility testing (contrast, focus indicators)
13. Mobile testing (touch targets, layout)
14. Unit tests for useTheme hook
15. Integration tests with Primer components

## Observability Impact

### Logging
- Log theme initialization (system preference vs manual)
- Log theme changes (user action)
- Log system preference changes
- Log CSS variable injection status

### Error Handling
- Graceful fallback if localStorage unavailable
- Handle corrupted theme JSON
- Handle missing CSS variables (browser compatibility)

### Performance Metrics
- Mark/measure for CSS variable injection time (should be < 50ms)
- Monitor theme switch responsiveness (perceived lag)

### Analytics (Future)
- Track theme preference distribution (% light vs dark users)
- Track system preference adoption rate
- Track theme switch frequency (user engagement with feature)
- Track time spent in each theme

### Browser Support Metrics
- Verify CSS variable support in target browsers
- Fallback styles for older browsers
- Polyfill if necessary

## Primer Design System Resources

- [Primer Color System](https://primer.style/design/foundations/color)
- [Primer React Components](https://primer.style/react)
- [Primer CSS Variables](https://github.com/primer/primitives)
- [GitHub Dark Mode](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-user-account-settings/managing-your-theme-settings)

## Customization Examples

### Custom Color Overrides
```css
/* theme.css */
:root[data-color-mode='dark'] {
  --color-canvas-default: #0d1117;  /* GitHub dark background */
  --color-text-primary: #c9d1d9;    /* GitHub dark text */
}

:root[data-color-mode='light'] {
  --color-canvas-default: #ffffff;  /* Light background */
  --color-text-primary: #24292f;    /* Light text */
}
```

### Using Variables in Components
```typescript
// Entry card with theme-aware styles
const EntryCard = styled.div`
  background-color: var(--color-canvas-overlay);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
  padding: 16px;
`;
```

## Accessibility Considerations

- **Color Contrast** : Verify 4.5:1 ratio (normal text) in both themes
- **Focus Indicators** : Ensure visible focus rings (--color-focus-outlineColor)
- **Motion** : Respect `prefers-reduced-motion` in transitions
- **Text Size** : No text smaller than 12px in either theme
- **Color Blindness** : Test with colorblind simulators (Protanopia, Deuteranopia, Tritanopia)
