# shadcn/ui + next-themes Integration Guide

## Overview

Task v2.0 replaces the custom Zustand theme store with **next-themes**, a battle-tested library for light/dark mode management. This document explains the integration pattern, why it works, and how to verify correctness.

---

## Why next-themes?

| Problem | Zustand Custom Solution (v0.1) | next-themes Solution (v2.0) |
|---|---|---|
| SSR/Client mismatch | ⚠️ Manual hydration logic | ✅ Built-in hydration guards |
| Persisted theme switching | ✅ localStorage + manual | ✅ localStorage automatic |
| System preference detection | ✅ Manual matchMedia listener | ✅ Built-in, reactive |
| CSS class application | ⚠️ Custom `data-theme` + CSS | ✅ Standard `.dark` class |
| No page flicker | ⚠️ Possible on page load | ✅ Script injection prevents flash |
| TypeScript support | ✅ Custom types | ✅ First-class support |
| Bundle size | ✅ Small | ✅ ~2KB (production) |

**Bottom line:** next-themes is the industry standard. Every modern React SPA that needs light/dark mode uses it (GitHub, Vercel, Shadcn docs, etc.).

---

## Installation & Setup

### Step 1: Install dependencies

```bash
npm install next-themes
npm install -D clsx tailwind-merge  # For cn() helper
npm install lucide-react  # For icons
npm install react-hook-form zod @hookform/resolvers  # For form library
```

### Step 2: Update `index.html` — add script injection

**Why?** Prevent theme flash on page load.

Add this to `<head>` of `index.html`, **before** `<script type="module">`:

```html
<script>
  (function () {
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark' 
      || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

**Important:** This runs synchronously **before React loads**, preventing the white-flash.

### Step 3: Rename entry point and wrap providers

**File:** `src/main.tsx` (renamed from `src/index.tsx`)

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import queryClient from './lib/query-client';
import './styles/globals.css';

// Initialize MSW in development (independent of env)
if (__ENABLE_MSW__ && typeof window !== 'undefined') {
  import('./mocks/browser').then(({ worker }) => {
    worker.listen();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider
      attribute="class"  // ← Apply theme as CSS class (dark/light)
      defaultTheme="system"  // ← Follow system preference by default
      enableSystem  // ← Listen to system preference changes
      storageKey="theme"  // ← localStorage key for persistence
      disableTransitionOnChange={false}  // ← Allow CSS transitions during theme switch
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

### Step 4: Update `tailwind.config.ts`

Ensure `darkMode: 'class'` is set:

```ts
import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',  // ← Critical: tells Tailwind to use .dark class
  plugins: [],
} satisfies Config;
```

### Step 5: Update `src/styles/globals.css`

Replace the old `data-theme` selector with Tailwind's `.dark` class:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Light mode (default) */
:root {
  --background: white;
  --foreground: black;
  --muted: #f3f4f6;
}

/* Dark mode (when .dark class is applied) */
.dark {
  --background: black;
  --foreground: white;
  --muted: #374151;
}

body {
  @apply bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300;
}
```

### Step 6: Update `ThemeToggle.tsx`

Use `useTheme()` from next-themes instead of custom hook:

```tsx
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {theme === 'system' && <Monitor className="h-4 w-4" />}
          {theme === 'light' && <Sun className="h-4 w-4" />}
          {theme === 'dark' && <Moon className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## How It Works

### The Theme Chain

```
User Action (click dropdown)
    ↓
setTheme('dark')  [from next-themes]
    ↓
localStorage.setItem('theme', 'dark')
    ↓
document.documentElement.classList.add('dark')  [or remove/toggle]
    ↓
Tailwind applies .dark variants
    ↓
Component re-renders with new theme colors
    ↓
CSS transition (if enabled) animates the change
```

### Storage Key

next-themes stores the preference in localStorage under the key you specify (default: `theme`):

```javascript
// In browser console, after switching to dark:
localStorage.getItem('theme')
// → "dark"

// Reload page → theme persists
```

### System Preference Listener

next-themes automatically listens to system theme changes:

```javascript
const { theme, systemTheme } = useTheme();

// If user sets theme to 'system':
// - theme = 'system'
// - systemTheme = 'light' or 'dark' (current OS preference)
```

If the user switches their OS theme (Settings → Dark Mode), the UI updates instantly.

---

## Tailwind Dark Mode Syntax

With `darkMode: 'class'`, Tailwind adds a `dark:` prefix to any class:

```tsx
// This button is white in light mode, dark-gray in dark mode:
<button className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Toggle theme
</button>

// Shorthand for frequently-toggled colors:
<div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
  Content
</div>
```

**shadcn/ui components already have dark mode support built-in** — no extra work needed. All Button, Card, Dialog, etc. components already include proper `dark:` classes.

---

## Verification Checklist

### After Setup, Test These:

1. **Light mode loads by default** — page shows light theme
2. **Click theme dropdown → Dark** — page switches to dark without reload
3. **Refresh page → theme persists** — still in dark mode (localStorage works)
4. **Click theme dropdown → System** — page follows OS preference
5. **Change OS theme setting** — page updates instantly (if theme is 'system')
6. **No flash on page load** — the injected script prevents white flash
7. **Component colors update** — buttons, cards, text all have dark variants

### Browser DevTools Verification:

```javascript
// In console:
const { theme } = useTheme();
console.log(theme); // → 'dark' or 'light' or 'system'

localStorage.getItem('theme');  // → should show your choice

document.documentElement.classList.contains('dark');  // → true in dark mode
```

---

## Common Issues & Fixes

### Issue: Theme flashes on page load

**Cause:** Script injection missing from `index.html` or not before `<script type="module">`

**Fix:** Add the script from Step 2 to `<head>`, before the module script.

### Issue: Dark mode colors don't apply

**Cause:** `tailwind.config.ts` missing `darkMode: 'class'`

**Fix:** Add or verify this line:
```ts
darkMode: 'class',
```

### Issue: Dropdown menu appears in wrong theme after switching

**Cause:** Menu may be rendered outside the root element where `.dark` class is applied

**Fix:** Next-themes applies the class to `document.documentElement` (the `<html>` tag), which should bubble to all children. If using portals, ensure they're within the root.

### Issue: Theme doesn't persist across refresh

**Cause:** localStorage is disabled or private browsing mode

**Fix:** This is expected behavior in private browsing. Can't persist in private mode.

---

## Performance Notes

- **Bundle impact:** ~2KB gzipped
- **Runtime impact:** Negligible (one localStorage read on mount)
- **CSS transitions:** Optional (see `disableTransitionOnChange` in setup)
- **No extra renders:** next-themes uses React context efficiently

---

## Migration Path from Zustand Custom Logic

**Old way (v0.1):**
```tsx
// src/stores/appStore.ts (to be deleted)
export const useAppStore = create((set) => ({
  theme: 'system',
  setTheme: (theme) => {
    localStorage.setItem('app:theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
}));

// src/hooks/useTheme.ts (to be deleted)
export function useTheme() {
  const { theme, setTheme } = useAppStore();
  return { theme, setTheme };
}
```

**New way (v2.0):**
```tsx
// next-themes handles everything
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
// Done. No Zustand, no custom hooks, no manual DOM manipulation.
```

**Files to delete:**
- `src/stores/appStore.ts` (theme logic)
- `src/hooks/useTheme.ts`

**Import all theme references to use:**
```tsx
import { useTheme } from 'next-themes';
```

---

## Next Steps

1. Complete Task 0 (shadcn/ui init)
2. Install next-themes + dependencies
3. Follow setup steps 1–6 in order
4. Test the verification checklist
5. Refactor components (Tasks D–N)

All other components continue to use Zustand for app state (auth, sidebar, etc.) — next-themes **only** handles theme, nothing else.
