---
name: oneticket-appshell
description: AppShell is the reference skeleton for all app projects in oneticket-core. Enforces exclusive file ownership to eliminate merge errors, design tokens to ensure visual consistency, and conventions for screens, components, and state management.
version: 0.1.0
source: local
---

# Skill: oneticket-appshell

## Purpose

**AppShell** is the canonical skeleton for all app projects in oneticket-core. Every new project begins by copying `apps/appshell/app/` and adapting the content.

AppShell serves two critical goals:

1. **Eliminate merge errors in parallel development** — exclusive file ownership prevents concurrent tasks from modifying the same file
2. **Enforce design quality by constraint** — design tokens, shadcn/ui primitives, and a rigid layout system prevent agents from producing visually inconsistent results

---

## When to apply

Apply this skill when:
- Creating a new app project in oneticket-core
- Establishing screens, components, or styling conventions in an existing project
- Reviewing code to ensure it follows the exclusive ownership pattern
- Decomposing work into parallel tasks — task 0 (skeleton setup) must complete before other tasks begin

---

## Stack

| Layer | Library | Version | Notes |
|---|---|---|---|
| Bundler | Vite | ^5 | **No Next.js** — Vite only |
| UI | React 18 + TypeScript | ^18, ^5 | Standard React with type safety |
| Router | React Router DOM | ^6 | Client-side routing |
| Styling | Tailwind CSS + tailwind-merge + clsx + class-variance-authority | ^3 | Design tokens via CSS custom properties |
| Components | Radix UI (via shadcn/ui) | latest | Unstyled, accessible primitives |
| Forms | React Hook Form + Zod + @hookform/resolvers | ^7, ^3 | Validation with Zod schemas |
| Data fetching | @tanstack/react-query | ^5 | Server state management + caching |
| Mock API | MSW (Mock Service Worker) | ^2 | Dev-only API mocking |
| State | Zustand | ^4 | Global state (available but optional) |
| Icons | lucide-react | latest | SVG icons, never use emoji or text symbols |
| Theme | next-themes (Vite-adapted) | ^0.3 | Dark/light/system theme support |
| Testing | Vitest + @testing-library/react + @testing-library/jest-dom + @testing-library/user-event + jsdom | ^1 | Development testing environment |

---

## File structure

```
apps/<project>/app/
├── .env.example                     ← VITE_APP_NAME=YourAppName
├── index.html
├── package.json
├── tailwind.config.ts               ← design tokens (colors, spacing, typography)
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts                   ← base: process.env.VITE_BASE_PATH || '/'
├── vitest.config.ts
├── vitest.setup.ts
└── src/
    ├── main.tsx                     ← MSW init + QueryClientProvider + ThemeProvider + BrowserRouter
    ├── App.tsx                      ← Routes definition
    ├── layouts/
    │   └── AppLayout.tsx            ← Header + <Outlet/> + Footer
    ├── components/
    │   ├── Header.tsx               ← App name (left, clickable → /) + About&Help dropdown + ThemeToggle (right)
    │   ├── Footer.tsx               ← empty but structured, ready to receive content
    │   ├── ThemeToggle.tsx          ← system/light/dark switch — reactive, no reload
    │   ├── PageHeader.tsx           ← heading + optional subtitle (for screen headers)
    │   ├── EmptyState.tsx           ← skeleton for no-data states
    │   └── ui/                      ← shadcn components (code in repo, not node_modules)
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dropdown-menu.tsx
    │       ├── separator.tsx
    │       ├── form.tsx             ← React Hook Form integrated
    │       └── ...
    ├── screens/
    │   ├── HomeScreen.tsx           ← example: useUsers() → React Query → MSW → Card list
    │   ├── AboutScreen.tsx          ← AppShell description + links
    │   └── HelpScreen.tsx           ← quickstart copier-coller + runbook link
    ├── hooks/
    │   └── useUsers.ts              ← React Query example: fetch('/api/users')
    ├── stores/
    │   └── .gitkeep                 ← Zustand convention — empty in skeleton
    ├── mocks/
    │   ├── browser.ts               ← MSW worker setup (dev-only)
    │   ├── handlers.ts              ← GET /api/users → mocked JSON
    │   └── data/
    │       └── users.ts             ← mock data: [{ id: 1, name: 'Alice' }, ...]
    ├── lib/
    │   ├── utils.ts                 ← cn() helper (clsx + tailwind-merge)
    │   ├── query-client.ts          ← QueryClient singleton
    │   └── schemas/
    │       └── .gitkeep             ← Zod schemas — empty in skeleton
    └── styles/
        └── globals.css              ← CSS custom properties light/dark + Tailwind directives
```

---

## Layout structure

```
┌──────────────────────────────────────────────────────┐
│  AppName (→ /)               [About & Help ▾]  [☀/🌙] │
│                                   ├ About             │
│                                   └ Help              │
├──────────────────────────────────────────────────────┤
│                                                       │
│                    <Outlet />                         │
│                  (screen content)                     │
│                                                       │
├──────────────────────────────────────────────────────┤
│                  Footer (empty, structured)           │
└──────────────────────────────────────────────────────┘
```

**Header (left):** `VITE_APP_NAME` environment variable — clickable, navigates to `/`
**Header (right):** single dropdown menu "About & Help" with 2 sub-entries → `/about` and `/help` + `ThemeToggle` button
**No "Home" nav entry** — the app name in the header is the home link
**Footer:** empty component with structure — no default content

---

## Routing

```
/        → HomeScreen   (React Query + MSW example)
/about   → AboutScreen  (AppShell description + links)
/help    → HelpScreen   (quickstart guide + runbook link)
```

---

## Design tokens and styling

### `globals.css` — CSS custom properties

Define light and dark mode CSS variables:

```css
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(0 0% 3.6%);
  --accent: hsl(0 84.2% 60.2%);
  --muted: hsl(0 0% 96.1%);
  --border: hsl(0 0% 89.8%);
}

.dark {
  --background: hsl(0 0% 3.6%);
  --foreground: hsl(0 0% 98%);
  --accent: hsl(0 84.2% 60.2%);
  --muted: hsl(0 0% 14.9%);
  --border: hsl(0 0% 14.9%);
}
```

### `tailwind.config.ts` — design token consumer

Consume CSS variables in Tailwind config:

```ts
export default {
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
        muted: "var(--muted)",
        border: "var(--border)",
      },
    },
  },
}
```

**Single task responsibility:** All design tokens (colors, spacing, typography) are updated in `tailwind.config.ts` and `globals.css` as a single dedicated task in the manifest. This prevents merge conflicts when multiple agents work in parallel.

---

## Visual conventions for agents

Every screen and component must follow these rules:

### Layout & Structure
- **PageHeader at top of every screen** — use the `PageHeader` component with title and optional subtitle
- **Card for grouped content** — wrap logical content blocks in `Card` components
- **EmptyState for no data** — always display an `EmptyState` component when a list is empty

### Styling
- **Never use inline styles** — `style={{...}}` is forbidden. Use Tailwind classes only.
- **Spacing:** Always use Tailwind spacing classes (`p-4`, `m-2`, `gap-3`). Never write raw `px` values.
- **Typography:** Always use the defined typography scale from `tailwind.config.ts`. Never set custom font sizes.
- **Colors:** Always use design tokens from `globals.css` and Tailwind (`bg-background`, `text-foreground`, `border-border`).

### Icons
- **Always use lucide-react** — import icons from `lucide-react`
- **Never use emoji** — no 🎯, ❌, ✓ symbols in UI
- **Never use text symbols** — no `>`, `|`, `->` as visual separators

### Form components
- **React Hook Form integration:** All forms use `react-hook-form` with Zod validation
- **Form layout:** Use the `form` component from shadcn/ui for consistent structure
- **Validation display:** Show Zod validation errors inline using the form component

---

## Data fetching pattern (MSW → React Query)

### Development flow

```
HomeScreen.tsx
  → useUsers()                           ← src/hooks/useUsers.ts
    → React Query fetch('/api/users')
      → MSW intercepts in dev
        → returns [{ id: 1, name: 'Alice' }, ...]
          → React Query caches + delivers
            → HomeScreen renders Card list
```

### MSW setup

MSW is **dev-only** — activated in `main.tsx` only when `import.meta.env.DEV`:

```ts
// main.tsx
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser')
  await worker.start()
}
```

In production, real API endpoints replace mock handlers — **no code changes needed**.

### React Query hooks

Create a hook per API endpoint:

```ts
// src/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })
}
```

### MSW handlers

Define handlers for each endpoint:

```ts
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import { users } from './data/users'

export const handlers = [
  http.get('/api/users', () => HttpResponse.json(users)),
]
```

---

## Theme support

The AppShell uses `next-themes` (Vite-adapted) for dark/light/system theme switching.

### ThemeToggle component

Provides 3 options:
- **system** — use OS preference
- **light** — force light mode
- **dark** — force dark mode

Switching themes is reactive — **no page reload**.

---

## Screen content guidelines

### HomeScreen
- Demonstrates React Query + MSW integration
- Fetches users via `useUsers()` hook
- Displays results in a Card list
- Shows EmptyState when no users

### AboutScreen
- Mini-README explaining AppShell intent
- Message: "AppShell is the reference skeleton for all app projects in oneticket-core. Copy it, adapt it, build on it."
- Link to generated docs: `https://dsissoko.github.io/oneticket-core/appshell/docs/`
- Link to GitHub repo: `https://github.com/dsissoko/oneticket-core`

### HelpScreen
- **Quickstart — How to reuse AppShell:**
  1. Copy `apps/appshell/app/` → `apps/{your-project}/app/`
  2. Set `VITE_APP_NAME` in `.env.example`
  3. Update `current_project` in `.oneticket/config.yml`
  4. Update `AboutScreen` with your project description
  5. Update `HelpScreen` with your project quickstart
  6. Add feature screens in `screens/` — one screen = one file = one task
  7. Push → deploy is automatic via CI
- Link to runbook: `.oneticket/docs/run/appshell-reuse.md`

---

## Why this eliminates merge errors

AppShell enforces **exclusive file ownership**:

| File | Owner | Modifiable in parallel? |
|---|---|---|
| `package.json`, `vite.config.ts`, `tsconfig.json` | Skeleton (Task 0) | ❌ |
| `globals.css`, `tailwind.config.ts` | Design tokens task | ❌ |
| `AppLayout.tsx`, `Header.tsx`, `Footer.tsx` | Layout task | ❌ |
| `ThemeToggle.tsx`, `PageHeader.tsx`, `EmptyState.tsx` | Component task | ❌ |
| `screens/HomeScreen.tsx` | Dedicated task | ✅ exclusive |
| `screens/AboutScreen.tsx` | Dedicated task | ✅ exclusive |
| `screens/HelpScreen.tsx` | Dedicated task | ✅ exclusive |
| `screens/{feature}Screen.tsx` | Dedicated task | ✅ exclusive |
| `hooks/useUsers.ts` | Dedicated task | ✅ exclusive |
| `hooks/{feature}.ts` | Dedicated task | ✅ exclusive |
| `mocks/handlers.ts` | Dedicated task | ✅ exclusive |
| `components/ui/*` | Setup task (via shadcn CLI) | ❌ installed once |

**Rule for `@leaddev`:**
- **Task 0** — copy skeleton, install shadcn components, configure theme (sequential, no `depends_on`)
- **Parallel tasks** — one screen per task, one hook per task (`depends_on: [task-0]`)
- **Integration task** — wire screens into App.tsx routes (`depends_on: all screen tasks`)

---

## Available libraries

This table shows all libraries available in AppShell and when to use them:

| Library | Purpose | When to use |
|---|---|---|
| **shadcn/ui** | UI primitives | All UI components — buttons, cards, forms, modals, etc. |
| **React Hook Form + Zod** | Forms + validation | Any screen with a form — ensure Zod schema in `schemas/` |
| **@tanstack/react-query** | Data fetching + caching | Any screen that fetches async data — create hook in `hooks/` |
| **Zustand** | Global state | Cross-screen state (user session, app config) — optional, not in skeleton |
| **lucide-react** | SVG icons | Any icon need — never use emoji or text symbols |
| **MSW** | Mock API (dev-only) | Dev/test data fetching — handlers in `mocks/handlers.ts` |

---

## How @po commands a new project based on AppShell

### Epic structure

When `@po` creates a new app project, the epic for the project should reference AppShell:

```markdown
# Epic: YourApp — MVP

## Strategy
Start with a copy of the AppShell skeleton (`apps/appshell/app/`).
AppShell enforces exclusive file ownership to eliminate merge errors.

## User stories (samples)
- US-1 — Copy and adapt AppShell skeleton
- US-2 — Implement [Feature 1] screen
- US-3 — Implement [Feature 2] screen
- US-4 — Integrate screens with backend API

## Manifest pattern
- Task 0 (sequential): Copy skeleton, configure theme
- Tasks 1-N (parallel, depends_on: [Task 0]): One screen per task
- Task N+1 (sequential, depends_on: all): Wire screens into routes
```

### Handoff to `@leaddev`

After epic creation, `@po` hands off to `@leaddev` with the message:

> **Using AppShell.** All screens are independent files in `screens/`. Decompose each user story into one task per screen. Task 0 sets up the skeleton in parallel with no dependencies. All other tasks depend on Task 0.

---

## How @leaddev decomposes tasks

### Manifest pattern for AppShell projects

```yaml
name: YourApp — MVP implementation
tasks:
  - id: task-0
    title: "Set up AppShell skeleton + design tokens"
    description: |
      Copy apps/appshell/app/ → apps/yourproject/app/
      Configure tailwind.config.ts + globals.css
      Install shadcn components
    depends_on: []
    
  - id: task-1
    title: "Implement HomeScreen"
    description: |
      Fetch users via useUsers() hook
      Display in Card list
      Show EmptyState when empty
    depends_on: [task-0]
    
  - id: task-2
    title: "Implement [Feature]Screen"
    description: |
      Create screens/{Feature}Screen.tsx
      One screen = one file = exclusive ownership
    depends_on: [task-0]
    
  - id: task-3
    title: "Wire screens into App.tsx routes"
    description: |
      Update routes in App.tsx
      Verify all screens render
    depends_on: [task-1, task-2]
```

### Key principles

1. **Task 0 is sequential** — no dependencies, must complete before others begin
2. **Screens are parallel** — each screen is one file, each task is independent (except depends_on: [task-0])
3. **Integration is last** — route wiring happens after all screens are implemented

---

## Shadow rules for AppShell projects

### No inline styles
```tsx
// ❌ FORBIDDEN
<div style={{ padding: '16px', color: 'red' }}>

// ✅ CORRECT
<div className="p-4 text-red-600">
```

### No custom font sizes
```tsx
// ❌ FORBIDDEN
<h1 style={{ fontSize: '32px' }}>

// ✅ CORRECT
<h1 className="text-3xl font-bold">
```

### No raw px values
```tsx
// ❌ FORBIDDEN
<div className="w-[345px] h-[128px] p-[15px]">

// ✅ CORRECT
<div className="w-80 h-32 p-4">
```

### PageHeader, Card, EmptyState are mandatory
```tsx
// ❌ FORBIDDEN — no heading wrapper
<div>
  <h1>My Screen</h1>
  <p>Content</p>
</div>

// ✅ CORRECT
<div>
  <PageHeader title="My Screen" />
  <Card>...</Card>
</div>
```

---

## Runbook to produce

The runbook `.oneticket/docs/run/appshell-reuse.md` should document:

### Steps
1. Copy `apps/appshell/app/` → `apps/{project}/app/`
2. Set `VITE_APP_NAME` in `.env.example`
3. Update `current_project` in `.oneticket/config.yml`
4. Update `AboutScreen` — replace with your project description
5. Update `HelpScreen` — replace with your project-specific quickstart
6. Add feature screens in `screens/` — one screen per file, one task per screen in the manifest
7. Deploy is automatic — push to main triggers `docs-site-github-pages.yml`

### What AppShell guarantees
- Exclusive file ownership prevents merge errors
- Design tokens ensure visual consistency
- MSW + React Query pattern works immediately for dev and test
- One screen = one file = one task ✅

---

## Skill frontmatter governance

All skills in `.oneticket/skills/` must include these frontmatter fields:

```yaml
---
name: oneticket-*              # must match directory name
description: "..."             # what the skill does, when to use it
version: "x.y.z"              # semver for compatibility tracking
source: local | external       # local = produced by oneticket, external = wrapped from external source
source_url: ...                # (if external) URL of original repository
source_skill: ...              # (if external) original skill name
install_native: ...            # (if external) npx skills add command
---
```

**AppShell is `source: local`** — no `source_url`, `source_skill`, or `install_native` fields.

---

## Related documentation

- **Product Spec Glossary** — add "AppShell," "exclusive ownership," and "design tokens"
- **Acceptance Criteria** — skill frontmatter must declare `source:` origin
- **Runbook** — `.oneticket/docs/run/appshell-reuse.md` for step-by-step reuse
