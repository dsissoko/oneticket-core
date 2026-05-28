# Slice 6 — Theme Switcher & Primer Design System Integration

## Goal

Implement light/dark theme switching using GitHub Primer design system CSS variables. Users can toggle between light and dark modes, with automatic detection of system preference on first visit and persistent user preference in localStorage. This slice ensures the entire UI is cohesive and accessible across all components.

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- Implicit in all user stories : Theme applies to entire UI (Primer design system requirement)
- No dedicated user story, but mentioned in epic acceptance criteria

## Impacted Components

### Application Layer Hooks (`src/hooks/`)
- **useTheme.ts** : Manage theme state and persistence
  - Returns : { theme, setTheme }
  - Signature : setTheme('light' | 'dark') → void (persists to localStorage)
  - Effect : Applies CSS custom properties to root element

### React Components (`src/components/`)
- **ThemeSelector.tsx** : UI toggle for theme switching
  - Props : theme, onThemeChange
  - Displays : Sun icon (light) / Moon icon (dark)
  - Clickable toggle or dropdown

- **App.tsx** (root) : Apply theme globally
  - Calls useTheme on mount
  - Applies CSS classes to root (data-theme attribute)
  - All children inherit theme via CSS variables

### Design System (`src/styles/`)
- **colors.css** : CSS custom properties for light/dark themes
  - `--color-bg` : background color (white / dark gray)
  - `--color-text` : text color (dark gray / white)
  - `--color-border` : border color (light gray / medium gray)
  - `--color-accent` : primary accent (GitHub blue)

- **theme-light.css** : Light mode theme variables
- **theme-dark.css** : Dark mode theme variables
- **globals.css** : Apply theme globally, set defaults

- **Primer React integration** : Use @primer/react components with theme tokens

## Interfaces

### Hook
```typescript
// src/hooks/useTheme.ts
export const useTheme = () => {
  return {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
  };
};
```

### Component
```typescript
// src/components/ThemeSelector.tsx
interface ThemeSelectorProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}
```

### CSS Variables
```css
/* Light theme */
:root[data-theme='light'] {
  --color-bg: #ffffff;
  --color-fg: #24292e;
  --color-border: #d1d5da;
  --color-link: #0366d6;
  --color-accent: #28a745;
  /* ... more variables */
}

/* Dark theme */
:root[data-theme='dark'] {
  --color-bg: #0d1117;
  --color-fg: #c9d1d9;
  --color-border: #30363d;
  --color-link: #58a6ff;
  --color-accent: #3fb950;
  /* ... more variables */
}
```

## Data Changes

### State Management
- **useTheme hook** : Stores theme in React state
- **localStorage['journal_theme']** : Persists user's choice
- **System preference detection** : Uses `prefers-color-scheme` media query on first visit
- **Root element attribute** : `<html data-theme="light">` or `<html data-theme="dark">`

### Theme Selection Logic
```
1. Check localStorage['journal_theme']
2. If set, use stored preference
3. If not set, check system preference:
   - matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
4. Apply theme
5. Save to localStorage['journal_theme']
```

## Sequence Flow

### App Startup with Theme Detection
```
1. App.tsx mounts
2. useTheme hook initializes
3. Hook checks localStorage['journal_theme']
4. If found:
   a. Use stored value ('light' or 'dark')
5. If not found:
   a. Check system preference: window.matchMedia('(prefers-color-scheme: dark)')
   b. If dark preferred: use 'dark'
   c. If light preferred: use 'light'
6. Apply theme:
   a. Set document.documentElement.setAttribute('data-theme', theme)
   b. Apply CSS custom properties via data attribute
7. React state updated
8. All components render with theme
```

### User Toggles Theme
```
1. User clicks ThemeSelector button
2. onClick calls onThemeChange('dark') or onThemeChange('light')
3. useTheme.setTheme(newTheme) called
4. Hook updates React state
5. Hook saves to localStorage['journal_theme']
6. Hook updates document.documentElement data attribute
7. CSS custom properties change instantly (no page reload)
8. All components using CSS variables update immediately
9. Button shows new icon (sun ↔ moon)
```

### System Theme Changes (Background)
```
1. User changes system theme in OS settings
2. System sends prefers-color-scheme media query change
3. useTheme hook listens for change (optional effect)
4. If localStorage is empty (user never chose):
   a. Hook updates theme
   b. All components update
5. If localStorage has user choice:
   a. User choice is respected (no auto-switch)
   b. System change is ignored (correct behavior)
```

## Observability Impact

### User Feedback
- Theme changes immediately (no lag)
- Icon updates to reflect current theme
- No page reload or flashing

### Accessibility
- WCAG 2.1 AA color contrast in both themes
- Text readable in light and dark modes
- No color-only information (avoid relying on color alone)

### Performance
- CSS variable application is instant (no JavaScript paint)
- No theme re-rendering lag

## Testing Expectations

### Unit Tests
- useTheme hook reads localStorage correctly
- useTheme detects system preference when localStorage empty
- setTheme updates state and localStorage
- CSS variables applied correctly to root element

### Integration Tests
- Load app first time (no localStorage) → detect system preference
- Load app with existing localStorage['journal_theme'] → use stored value
- Toggle theme → localStorage updated
- Refresh page → theme persists

### Component Tests
- ThemeSelector renders sun/moon icon
- Click toggle → onThemeChange called
- Current theme displayed on button

### Visual Tests (Manual or Screenshot)
- Light mode: white background, dark text, light borders
- Dark mode: dark background, light text, dark borders
- Primer React components styled correctly in both themes
- All text readable (contrast > 4.5:1)
- No components broken in either theme

### Accessibility Tests
- Color contrast verified (WCAG AA) in light and dark
- All text readable without relying on color
- Keyboard accessible (Tab, Enter)
- Focus visible in both themes

## Definition of Done

- [ ] useTheme hook initializes theme on mount
- [ ] System preference detected (prefers-color-scheme) on first visit
- [ ] User choice persisted to localStorage['journal_theme']
- [ ] CSS custom properties defined for light and dark themes
- [ ] Root element attribute set (data-theme='light' or 'dark')
- [ ] ThemeSelector component renders and toggles theme
- [ ] Theme changes applied instantly (no page reload)
- [ ] All Primer React components respect theme
- [ ] All custom components use CSS variables
- [ ] Colors meet WCAG 2.1 AA contrast requirements (both themes)
- [ ] No hard-coded colors (all use CSS variables)
- [ ] Light mode fully tested (manual verification)
- [ ] Dark mode fully tested (manual verification)
- [ ] System preference respected on first visit
- [ ] User choice overrides system preference when localStorage set
- [ ] Page refresh preserves theme choice
- [ ] Unit tests : useTheme hook state management
- [ ] Integration tests : theme persistence and system detection
- [ ] Component tests : ThemeSelector rendering and interaction
- [ ] Visual tests : both themes render correctly
- [ ] Accessibility tests : color contrast, keyboard navigation
- [ ] Performance verified : theme toggle instant (< 50ms)

