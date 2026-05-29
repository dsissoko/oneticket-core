# Migration Guide: AppShell v0.1 → v2.0

## Overview

AppShell v0.1 (✅ complete) → v2.0 (🚀 this issue)

This is **not a greenfield rewrite**. All existing code moves in-place with renames and augmentations. Zero functionality should be lost; all gaps are **additions only**.

---

## Critical Rules

1. **One file = One task** — each file migration/creation is a separate task
2. **Task 0 (shadcn/ui init) is sequential** — must complete before any UI component work
3. **MSW stays enabled** — `__ENABLE_MSW__: true` in vite.config.ts is permanent (no change to `import.meta.env.DEV`)
4. **Zero overlap** — no two tasks modify the same file
5. **Existing code preserved** — rename, refactor, but never delete-and-recreate

---

## File Migration Map

### Summary

| Current Path | Target Path | Action | Task | Notes |
|---|---|---|---|---|
| `src/index.tsx` | `src/main.tsx` | rename + rewrite | A | Add MSW init, QueryClientProvider, ThemeProvider |
| `src/main.css` | `src/styles/globals.css` | rename + update | B | Update for next-themes `.dark` class |
| `src/pages/` | `src/screens/` | rename dir | C | Rename all `*Page.tsx` → `*Screen.tsx` |
| `src/pages/HomePage.tsx` | `src/screens/HomeScreen.tsx` | rename + refactor | D | Replace inline Card with shadcn Card |
| `src/pages/AboutPage.tsx` | `src/screens/AboutScreen.tsx` | rename | E | Keep as-is, move only |
| `src/pages/HelpPage.tsx` | `src/screens/HelpScreen.tsx` | rename | F | Keep as-is, move only |
| `src/pages/UsersPage.tsx` | (removed) | delete | — | Not in target structure |
| `src/pages/NotFoundPage.tsx` | (removed) | delete | — | Not in target structure |
| `src/lib/queryClient.ts` | `src/lib/query-client.ts` | rename | G | Keep as-is, rename only |
| `src/lib/utils.ts` | (new) | create | H | Add `cn()` helper from shadcn template |
| `src/lib/schemas/.gitkeep` | (new) | create | I | Empty directory for future Zod schemas |
| `src/stores/appStore.ts` | (delete theme logic) | refactor | J | Remove theme state, keep empty for other state |
| `src/hooks/useTheme.ts` | (delete) | delete | K | next-themes replaces all theme logic |
| `src/components/ThemeToggle.tsx` | (rewrite) | rewrite | L | Use `useTheme()` from next-themes |
| `src/components/layout/Header.tsx` | (refactor) | refactor | M | Replace inline SVGs with lucide-react icons |
| `src/components/layout/Footer.tsx` | (refactor) | refactor | N | Replace inline SVGs with lucide-react icons |
| `src/components/ui/` | (new) | create | O | Init via shadcn CLI → `button`, `card`, `dropdown-menu`, `separator`, `form` |
| `.env.example` | (new) | create | P | Add `VITE_APP_NAME=AppShell` |
| `vitest.config.ts` | (new) | create | Q | Add Vitest config with jsdom |
| `vitest.setup.ts` | (new) | create | R | Add test setup (MSW, providers) |
| `tailwind.config.ts` | (update) | update | S | Add shadcn/ui color scheme if needed |

---

## Task Dependency Graph

```
Task O (shadcn init) ← SEQUENTIAL, task 0, must complete first
        ↓
A (main.tsx) + B (globals.css) + P (.env.example) + S (tailwind config)
        ↓
C (rename pages/ → screens/) + Q (vitest.config.ts) + R (vitest.setup.ts)
        ↓
D (HomeScreen refactor) + E (AboutScreen) + F (HelpScreen)
        ↓
G (query-client rename) + H (utils.ts cn()) + I (schemas/.gitkeep)
        ↓
J (appStore cleanup) + K (delete useTheme.ts)
        ↓
L (ThemeToggle rewrite) + M (Header lucide) + N (Footer lucide)
```

**In practice:**
- Task O is the blocker (must finish)
- After O, all other tasks can run in parallel EXCEPT:
  - D, E, F can only run after C (directory rename must complete first)
  - L can run after J (theme store cleanup)

---

## Dependency Details

### Task O: shadcn/ui Init (TASK 0, Sequential)

**What it does:**
```bash
cd apps/appshell/app
npx shadcn-ui@latest init \
  --defaults \
  --tailwind ./tailwind.config.ts \
  --utils ./src/lib/utils.ts \
  --cwd .

# Then add components
npx shadcn-ui@latest add button card dropdown-menu separator form
```

**Output:**
- `src/lib/utils.ts` — `cn()` helper
- `src/components/ui/` — 5 components
- `tsconfig.json` — path alias for `@/`

**Reason for sequencing:** All other component tasks depend on this directory and export structure.

---

### Task A: Rename + Rewrite `src/main.tsx`

**Current:** `src/index.tsx`
**Target:** `src/main.tsx`

**Changes:**
- Rename file
- Update `index.html` entry point: `<script type="module" src="/src/main.tsx"></script>`
- Wrap providers in order:
  1. `ThemeProvider` (from next-themes)
  2. `QueryClientProvider` (React Query)
  3. `BrowserRouter` (React Router)
  4. `<App />`
- Initialize MSW in dev mode

**Code pattern:**
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import queryClient from './lib/query-client';
import './styles/globals.css';

// Initialize MSW in development
if (__ENABLE_MSW__ && import.meta.env.DEV) {
  import('./mocks/browser').then(({ worker }) => {
    worker.listen();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

---

### Task B: Rename + Update `src/styles/globals.css`

**Current:** `src/main.css`
**Target:** `src/styles/globals.css`

**Changes:**
- Rename file
- Move to `src/styles/` directory
- Update import in `main.tsx`: `import './styles/globals.css'`
- Update CSS for `next-themes` `.dark` class (instead of `data-theme` attribute)

**CSS pattern for dark mode:**
```css
/* Light mode (default) */
:root {
  --color-bg: white;
  --color-text: black;
}

/* Dark mode (when next-themes adds .dark class) */
.dark {
  --color-bg: black;
  --color-text: white;
}
```

---

### Task C: Rename Directory `src/pages/` → `src/screens/`

**Current:** `src/pages/`
**Target:** `src/screens/`

**Files to rename:**
- `HomePage.tsx` → `HomeScreen.tsx`
- `AboutPage.tsx` → `AboutScreen.tsx`
- `HelpPage.tsx` → `HelpScreen.tsx`
- **Delete:** `UsersPage.tsx`, `NotFoundPage.tsx` (not in target structure)

**Import updates:** Update all imports in `App.tsx` and other files

---

### Task D: Refactor `HomeScreen.tsx`

**Current:** `src/pages/HomePage.tsx`
**Target:** `src/screens/HomeScreen.tsx`

**Changes:**
- Rename file (done by Task C)
- Replace any inline Card layout with `Card` from shadcn/ui:
  ```tsx
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  ```
- Use `cn()` from `lib/utils.ts` for conditional Tailwind classes

---

### Task E: Move `AboutScreen.tsx`

**Current:** `src/pages/AboutPage.tsx`
**Target:** `src/screens/AboutScreen.tsx`

**Changes:**
- Rename file only (no logic change)

---

### Task F: Move `HelpScreen.tsx`

**Current:** `src/pages/HelpPage.tsx`
**Target:** `src/screens/HelpScreen.tsx`

**Changes:**
- Rename file only (no logic change)

---

### Task G: Rename `src/lib/queryClient.ts`

**Current:** `src/lib/queryClient.ts`
**Target:** `src/lib/query-client.ts`

**Changes:**
- Rename file only
- Update imports in `main.tsx` and any other files

---

### Task H: Create `src/lib/utils.ts` (cn() helper)

**Current:** absent
**Target:** `src/lib/utils.ts`

**Content:**
```tsx
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Installed via Task O** (shadcn init auto-creates this). If Task O already creates it, skip this.

---

### Task I: Create `src/lib/schemas/.gitkeep`

**Current:** absent
**Target:** `src/lib/schemas/.gitkeep`

**Content:** Empty directory marker for future Zod schemas

---

### Task J: Clean `src/stores/appStore.ts` (Remove Theme Logic)

**Current:** Zustand store with theme state + logic
**Target:** Empty store (or .gitkeep placeholder)

**Action:**
- Remove all theme-related code from `appStore.ts`
- Keep file structure for future app state (auth, sidebar, etc.)
- If empty, replace with `.gitkeep`

---

### Task K: Delete `src/hooks/useTheme.ts`

**Current:** Custom hook using `useAppStore`
**Target:** deleted (next-themes provides `useTheme()`)

**Impact:**
- ThemeToggle will import from `next-themes` instead
- Any other component using `useTheme` must update import

---

### Task L: Rewrite `src/components/ThemeToggle.tsx`

**Current:** Dropdown using custom Zustand logic, inline SVGs
**Target:** Dropdown using `next-themes`, lucide-react icons

**Code pattern:**
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

### Task M: Refactor `src/components/layout/Header.tsx`

**Current:** Inline SVGs
**Target:** lucide-react icons

**Changes:**
- Replace inline `<svg>` with lucide imports:
  ```tsx
  import { Menu, X, Home } from 'lucide-react';
  
  // Instead of: <svg>...</svg>
  // Use: <Menu className="h-6 w-6" />
  ```

---

### Task N: Refactor `src/components/layout/Footer.tsx`

**Current:** Inline SVGs
**Target:** lucide-react icons

**Changes:**
- Same as Task M (replace inline SVGs with lucide-react)

---

### Task P: Create `.env.example`

**Current:** absent
**Target:** `.env.example`

**Content:**
```env
VITE_APP_NAME=AppShell
```

---

### Task Q: Create `vitest.config.ts`

**Current:** absent
**Target:** `vitest.config.ts`

**Content:**
```tsx
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

### Task R: Create `vitest.setup.ts`

**Current:** absent
**Target:** `vitest.setup.ts`

**Content:**
```ts
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Setup MSW for tests
import { setupServer } from 'msw/node';
import * as handlers from './src/mocks/handlers';

export const server = setupServer(...handlers.default);

beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
```

---

### Task S: Update `tailwind.config.ts`

**Current:** Existing config
**Target:** Add/verify shadcn/ui color support

**Changes:**
- Verify `darkMode: 'class'` is set
- Ensure Tailwind can resolve shadcn component files:
  ```ts
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ensure shadcn colors are available
      },
    },
  },
  darkMode: 'class',
  ```

---

## New Dependencies

```bash
npm install next-themes
npm install -D clsx tailwind-merge
npm install lucide-react
npm install react-hook-form zod @hookform/resolvers
npm install -D @types/node
```

---

## Acceptance Criteria Mapping

| Criterion | Supported By | Notes |
|---|---|---|
| All missing dependencies installed | Package.json update | shadcn, next-themes, lucide, form libs |
| shadcn/ui initialized | Task O | CLI auto-creates components/ui/ |
| next-themes ThemeProvider wired | Task A + L | Main.tsx + ThemeToggle rewrite |
| cn() helper available | Task O or H | shadcn CLI creates it |
| File structure matches brief | Tasks A–S combined | Covers all renames and creates |
| .env.example present | Task P | With VITE_APP_NAME |
| Theme: light/dark/system reactive | Task L + next-themes config | Uses next-themes with system detection |
| App preview live | Post-implementation | Tests will verify |
| oneticket-appshell skill | After v2.0 complete | PO creates skill document |

---

## Notes for @leaddev

1. **Task O must finish first** — don't parallelize it
2. **MSW stays enabled** — no change to vite.config.ts logic, only flag is `__ENABLE_MSW__: true`
3. **Directory rename** — Task C renames `pages/` → `screens/` in one operation; tasks D–F are component refactors AFTER that
4. **File ownership** — each task owns exactly one file (except O which owns multiple during init)
5. **Test for page reload on theme change** — next-themes should update instantly without refresh
6. **Lucide icons** — standard 24px icons unless otherwise specified in component design

---

## What NOT to Do

- ❌ Do NOT delete and recreate existing files — rename in place
- ❌ Do NOT change MSW logic in vite.config.ts — leave `__ENABLE_MSW__: true`
- ❌ Do NOT keep the custom Zustand theme logic — next-themes replaces all of it
- ❌ Do NOT forget to update imports in App.tsx after directory rename
- ❌ Do NOT use other UI libraries — only shadcn/ui + Tailwind
