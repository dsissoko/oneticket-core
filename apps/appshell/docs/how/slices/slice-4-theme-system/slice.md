# Slice 4 — Theme System

## Goal

Implement a light/dark/system theme system with reactive switching, persistent user preferences, and CSS custom properties integration across all components without page reload.

## Related Epics

- [../../../what/epics/epic-0-mvp/epic.md](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [../../../what/epics/epic-0-mvp/user-stories/us-002-design-tokens.md](../../../what/epics/epic-0-mvp/user-stories/us-002-design-tokens.md)

## Impacted Components

1. **src/styles/globals.css** — CSS custom properties for light/dark modes
   - `:root` selector for light theme variables
   - `.dark` class selector for dark theme variables
   - Color tokens: `--background`, `--foreground`, `--accent`
   - Full cascade to all child elements

2. **src/components/ThemeToggle.tsx** — Theme toggle component
   - Dropdown menu exposing `system`, `light`, `dark` options
   - Uses `next-themes` library for reactive state management
   - No page reload on theme change
   - Syncs with localStorage automatically

3. **tailwind.config.ts** — Tailwind CSS color extensions
   - Extends `colors` object to consume CSS custom properties
   - Maps Tailwind color names to CSS variables: `{ background: 'var(--background)', ... }`
   - Enables Tailwind classes to respect theme switching

4. **src/main.tsx** — Application bootstrap
   - Wraps the entire app with `ThemeProvider` from next-themes
   - Initializes theme preference detection (system/stored)
   - Provides `useTheme()` hook to child components

5. **Integration with @headlessui and shadcn/ui**
   - Dropdown component uses @headlessui for accessibility
   - shadcn/ui components automatically inherit CSS variables
   - Theme toggle appears in top navigation/header

## Interfaces

### ThemeToggle Component Props
```typescript
interface ThemeToggleProps {
  // No required props — uses useTheme() hook internally
}

interface UseThemeReturn {
  theme: 'light' | 'dark' | 'system' | undefined;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  systemTheme: 'light' | 'dark' | undefined;
  resolvedTheme: 'light' | 'dark' | undefined;
}
```

### CSS Custom Properties API
```css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --accent: #0066cc;
}

.dark {
  --background: #1a1a1a;
  --foreground: #ffffff;
  --accent: #4499ff;
}
```

## Data Changes

- **localStorage** — Theme preference stored at key `theme` (value: `light`, `dark`, or `system`)
- **No database changes** — Theme persisted in browser only
- **Session independence** — Each browser session reads from stored preference on app load

## Sequence Flow

```
User loads AppShell
  ↓
ThemeProvider checks localStorage for stored theme
  ↓
If stored theme exists, apply it; else detect system preference
  ↓
Apply CSS custom properties to :root or .dark based on resolved theme
  ↓
All Tailwind classes resolve CSS variables → visual update
  ↓
User clicks ThemeToggle dropdown
  ↓
Select system/light/dark option
  ↓
setTheme() updates state → localStorage updated → CSS reapplied
  ↓
No page reload; all components reactively re-render with new theme
```

## Observability Impact

- No telemetry required for MVP
- Theme preference visible in browser DevTools (Application tab → localStorage)
- CSS media query state accessible via `window.matchMedia('(prefers-color-scheme: dark)')`
- Console logs available in development for theme state changes via next-themes debugging

## Implementation Notes

- **next-themes** provides automatic localStorage sync and SSR-safe rendering
- CSS custom properties cascade to all descendants — no per-component configuration needed
- `.dark` class applied at `:root` level via next-themes configuration
- Tailwind `darkMode: 'class'` configuration required in `tailwind.config.ts`
- ThemeToggle should be accessible from top-level navigation for immediate user access
- System preference detection uses `prefers-color-scheme` media query (browser native)
