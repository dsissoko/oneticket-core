# Slice 4 — Theme Toggle

## Goal

Implement light/dark/system theme switching with localStorage persistence and CSS variable integration.

## Related Epic

[Epic 0 — AppShell MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

[US-005 — Theme Toggle](../../what/epics/epic-0-mvp/user-stories/us-005-theme-toggle.md)

## Impacted Components

- `src/components/layout/Header.tsx` — add ThemeToggle component
- `src/components/ThemeToggle.tsx` — dropdown to select theme (system/light/dark)
- `src/hooks/useTheme.ts` — custom hook for theme state management
- `src/stores/appStore.ts` — Zustand store with theme preference
- `src/main.css` — CSS variables for light/dark themes
- `src/index.tsx` — ThemeProvider wrapper

## Interfaces

**Theme Type**:
```typescript
type Theme = 'system' | 'light' | 'dark';

interface AppStore {
  theme: Theme;
  setTheme(theme: Theme): void;
  resolvedTheme: 'light' | 'dark'; // computed based on system preference
}
```

**ThemeToggle Props**:
```typescript
interface ThemeToggleProps {
  // component reads from useAppStore hook internally
}
```

## Data Changes

**localStorage**:
```json
{
  "app:theme": "light"  // or "dark" or "system"
}
```

**CSS Variables** (apply dynamically):
```css
/* Light theme */
:root {
  --background: rgb(255 255 255);
  --foreground: rgb(36 41 46);
  --primary: rgb(3 102 214);
  --border: rgb(208 215 222);
}

/* Dark theme */
[data-theme="dark"] {
  --background: rgb(13 17 23);
  --foreground: rgb(230 237 243);
  --primary: rgb(88 166 255);
  --border: rgb(48 54 61);
}
```

## Sequence Flow

1. Create `src/stores/appStore.ts` with Zustand store for theme state
2. Create `src/hooks/useTheme.ts` hook exposing theme and setTheme
3. Create `src/components/ThemeToggle.tsx` dropdown component
4. Update `src/components/layout/Header.tsx` to include ThemeToggle
5. Add CSS variable definitions in `src/main.css` for light/dark modes
6. Implement system theme detection using `prefers-color-scheme` media query
7. Implement localStorage persistence (read on app startup, write on change)
8. Add smooth CSS transitions between themes
9. Test theme switching in all browsers and mobile browsers

## Observability Impact

- localStorage entry `app:theme` visible in DevTools Application tab
- `data-theme` attribute on `<html>` or `<body>` visible in DevTools
- CSS variables computed values update immediately in DevTools Styles tab
- No layout shift when switching themes (smooth transition)
- System preference respected when theme set to "system"

## Acceptance Criteria

- [x] Zustand store `useAppStore` has theme state with default 'system'
- [x] ThemeToggle dropdown in Header with 3 options: System, Light, Dark
- [x] Theme selection persisted to localStorage
- [x] CSS variables update immediately when theme changes
- [x] System preference (`prefers-color-scheme: dark`) respected when theme='system'
- [x] Light theme: white background, dark foreground
- [x] Dark theme: dark background (#0d1117), light foreground
- [x] All colors meet WCAG AA contrast ratio (≥4.5:1)
- [x] Smooth CSS transition between themes (no jarring color changes)
- [x] Theme preference survives page reload
- [x] HomePage displays current theme and test button
