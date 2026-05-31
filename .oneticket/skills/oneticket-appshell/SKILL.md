---
name: oneticket-appshell
description: "AppShell skeleton reference for all oneticket app projects — design system, patterns, and parallel-safe file structure"
version: "1.0.0"
source: local
---

# Skill: oneticket-appshell

## Intent

**AppShell** is the canonical React + Vite skeleton and design system reference for all OneTicket application projects. Its primary purpose is to:

1. **Eliminate merge conflicts in FAN-OUT parallel development** — through exclusive file ownership where one component = one file, one page = one file, ensuring 6+ agents can work simultaneously without conflicts
2. **Enforce quality design by constraint** — design tokens frozen in `tailwind.config.ts` and `globals.css` + Radix UI/shadcn primitives only, preventing off-brand colors, typography, or spacing
3. **Accelerate developer and AI agent onboarding** — new projects copy `apps/appshell/app/` and adapt in <10 minutes with working patterns from day one
4. **Provide living documentation** — AppShell serves as the executable reference for architecture, patterns, and best practices

This skill defines how to scaffold, extend, and maintain AppShell-based projects following the exclusive ownership model.

---

## Screens Convention: One Screen = One File = Exclusive Ownership

All route screens follow strict exclusive ownership:

- **Each route** owns one `.tsx` file in `src/screens/` (or `src/pages/`)
- **No two tasks modify the same screen file** — parallel safety guaranteed
- **Screen naming**: `<FeatureName>Screen.tsx` or `<FeatureName>Page.tsx` (e.g., `HomeScreen.tsx`, `UsersPage.tsx`, `SettingsPage.tsx`)
- **Route registration** in `main.tsx` is centralized — all screens import from their exclusive files

**Example parallel task decomposition:**
- Task 1: Create `src/screens/HomeScreen.tsx` (depends: skeleton setup)
- Task 2: Create `src/screens/AboutScreen.tsx` (depends: skeleton setup)
- Task 3: Create `src/screens/UsersPage.tsx` (depends: skeleton setup, data fetching pattern)
- Task 4: Integration — wire screens into `main.tsx` routes (depends: tasks 1-3)

**Zero merge conflicts** because each task creates a new file; no shared file modification.

---

## Components Convention: shadcn/ui + Single Setup Task

All UI components derive from **shadcn/ui** (Radix UI primitives), installed once during skeleton setup:

- **Approved components**: Button, Input, Textarea, Select, Checkbox, Radio, Toggle, Slider, Card, Badge, Alert, Toast, Dialog, Popover, Dropdown Menu, Form (with React Hook Form)
- **Location**: `src/components/ui/` — installed via `shadcn-ui init && shadcn-ui add <component>`
- **Single setup task**: One task installs all shadcn components for the project; subsequent tasks use them without modification
- **No custom component library**: All new UI components are either shadcn/ui or project-specific feature components living in `src/components/`
- **Locked components**: `Header.tsx`, `Footer.tsx`, `AppLayout.tsx`, `ThemeToggle.tsx` are locked after v1 setup — modification requires architectural review

**Example locked component locations:**
- `src/components/Header.tsx` — logo + nav + theme toggle
- `src/components/Footer.tsx` — links + copyright
- `src/components/AppLayout.tsx` — header + outlet + footer wrapper
- `src/components/ThemeToggle.tsx` — light/dark/system selector

Feature-specific components live in `src/components/` or within their feature folder. All components use shadcn/ui primitives without modification.

---

## Styles Convention: globals.css + tailwind.config.ts for Design Tokens

All styling originates from **Tailwind CSS** with **frozen design tokens**:

### globals.css
- **Location**: `src/styles/globals.css`
- **Contains**: CSS custom properties for light/dark theme switching
- **Pattern**:
  ```css
  :root {
    --background: #ffffff;
    --foreground: #000000;
    --accent: #0066cc;
    /* ... all design tokens ... */
  }
  .dark {
    --background: #000000;
    --foreground: #ffffff;
    --accent: #0099ff;
    /* ... dark variants ... */
  }
  ```
- **No inline color values in components** — all colors reference CSS variables

### tailwind.config.ts
- **Location**: `tailwind.config.ts` at project root
- **Contains**: Design tokens mapped to Tailwind utilities
- **Pattern**:
  ```typescript
  export default {
    theme: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        destructive: "var(--destructive)",
        muted: "var(--muted)",
        // ... all design tokens ...
      },
      spacing: { /* 4px baseline */ },
      fontSize: { /* typography scale */ },
      borderRadius: { /* sm, md, lg */ },
      boxShadow: { /* predefined shadows */ },
    },
  };
  ```
- **Locked**: Design tokens are frozen after v1 setup; new tokens require review

### Usage Rule
- **No magic numbers**: `className="w-4 h-4"` not allowed — use named tokens from `tailwind.config.ts`
- **All colors via CSS variables**: `className="bg-background text-foreground"` — never `bg-red-500` or inline colors
- **Responsive first**: Mobile-first breakpoints using Tailwind `sm:`, `md:`, `lg:`, `xl:` prefixes

---

## Visual Rules: PageHeader, Card, EmptyState Patterns

AppShell enforces three standard visual patterns to maintain consistency across screens:

### PageHeader Pattern
```typescript
// src/components/PageHeader.tsx (optional, derive from shadcn/ui)
<div className="border-b bg-background px-6 py-4">
  <h1 className="text-3xl font-bold text-foreground">Page Title</h1>
  <p className="text-sm text-muted mt-2">Optional subtitle or description</p>
</div>
```
**Use when**: Every page needs a title and optional description at the top.

### Card Pattern
```typescript
// Use shadcn/ui Card directly
<Card className="p-6">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-semibold text-foreground">Card Title</h3>
      <p className="text-sm text-muted mt-1">Card description</p>
    </div>
    <Button variant="outline">Action</Button>
  </div>
</Card>
```
**Use when**: Displaying data collections, grouped information, or feature highlights.

### EmptyState Pattern
```typescript
// When no data is available
<div className="flex flex-col items-center justify-center py-12">
  <Icon className="w-12 h-12 text-muted mb-4" />
  <h3 className="text-lg font-semibold text-foreground">No results</h3>
  <p className="text-sm text-muted mt-2">Try adjusting your filters or create a new item.</p>
  <Button className="mt-4">Create Item</Button>
</div>
```
**Use when**: Lists are empty, search yields no results, or initial state before user action.

All visual patterns use shadcn/ui primitives and Tailwind utilities derived from design tokens.

---

## Available Libraries & Tech Stack

AppShell provides a comprehensive, curated tech stack for rapid development. All libraries are pinned versions — frozen after v1 setup.

| Layer | Library | Version | Purpose |
|-------|---------|---------|---------|
| **Bundler** | Vite | ^5 | Development server & production build |
| **UI Framework** | React 19 | ^19 | Component library |
| **Language** | TypeScript | ^5 | Type safety, strict mode required |
| **Router** | React Router DOM | ^6 | Client-side routing, lazy loading, error boundaries |
| **Styling** | Tailwind CSS | ^3 | Utility-first CSS + design tokens |
| | tailwind-merge | latest | Merge conflicting Tailwind classes |
| | clsx | latest | Conditional class names |
| | class-variance-authority | latest | Component style variants |
| **UI Components** | Radix UI (via shadcn/ui) | latest | Accessible, unstyled primitives |
| **Data Fetching** | @tanstack/react-query | ^5 | Server state, caching, synchronization |
| **API Mocking** | Mock Service Worker (MSW) | ^2 | Intercept HTTP requests in dev/test |
| **Forms** | React Hook Form | ^7 | Form state management |
| | Zod | ^3 | Schema validation |
| | @hookform/resolvers | ^3 | RHF + Zod integration |
| **State Management** | Zustand | ^4 | Local app state (auth, theme, UI) |
| **Icons** | lucide-react | latest | 300+ consistent SVG icons |
| **Theme System** | next-themes | ^0.3 | Light/dark/system mode switching |
| **Testing** | Vitest | ^1 | Unit & integration test runner |
| | @testing-library/react | ^14 | Component testing utilities |
| | @testing-library/jest-dom | ^6 | Custom Jest matchers |
| | @testing-library/user-event | ^14 | User interaction simulation |
| | jsdom | latest | DOM implementation for testing |

**Key constraints:**
- **React 19 only** — no Next.js
- **Vite only** — no webpack, no esbuild
- **TypeScript strict mode** — `strict: true` in `tsconfig.json`
- **shadcn/ui only** — no Bootstrap, Material-UI, or custom component libraries
- **Zustand + React Query** — no Redux, MobX, or Jotai
- **MSW for all mocking** — no server.ts, no hardcoded API URLs

All libraries are intentionally curated and frozen to prevent dependency sprawl and maintain parallel-safe development.

---

## How Product Managers Command New Projects Based on AppShell

When a product manager (`@po`) wants to create a new app project:

### 1. **Specify Project Scope**
- Name (e.g., "dashboard", "user-manager", "reporting")
- Primary domain (e.g., "user analytics", "content publishing")
- Estimated parallel tasks (e.g., "4 screens + 1 data layer")

### 2. **Define Feature Epics**
- Break down the project into ~4-6 user stories
- Each story should map to one exclusive screen or hook
- Story template: `As a <user>, I want <feature>, so that <benefit>`

### 3. **Request AppShell as Template**
- Command: "Create `apps/{project_name}/` from AppShell skeleton"
- Specify any customizations (custom colors, additional screens, form patterns)

### 4. **Handoff to @architect**
- @architect decomposes epics into vertical slices
- Produces implementation tasks with exclusive file ownership rules
- Each slice ensures zero merge conflicts

### 5. **Handoff to @leaddev**
- @leaddev sequentializes tasks: skeleton setup (task 0), then parallel tasks 1-N
- @leaddev assigns each screen/hook to a different task
- All tasks depend on task 0 (skeleton) but are otherwise independent

### Example Command Flow
```
@po: "Create dashboard app with 3 screens: Overview, Users, Reports"
  ↓
@architect: Breaks into slices:
  - Slice 0: Skeleton + design tokens (sequential)
  - Slice 1: OverviewScreen (parallel, depends: slice-0)
  - Slice 2: UsersScreen (parallel, depends: slice-0)
  - Slice 3: ReportsScreen (parallel, depends: slice-0)
  - Slice 4: Integration (sequential, depends: slices 1-3)
  ↓
@leaddev: Assigns tasks and decomposition:
  - Task 0: Skeleton (A0)
  - Task 1: OverviewScreen (A1, depends: A0)
  - Task 2: UsersScreen (A2, depends: A0)
  - Task 3: ReportsScreen (A3, depends: A0)
  - Task 4: Integration (A4, depends: A1-A3)
  ↓
@dev agents: Execute in parallel
  - Agent 1: Builds OverviewScreen.tsx
  - Agent 2: Builds UsersScreen.tsx
  - Agent 3: Builds ReportsScreen.tsx
  - Agent 4: Wires into `main.tsx` routes (after agents 1-3 complete)
```

---

## How @leaddev Decomposes Tasks Using AppShell

@leaddev uses the exclusive file ownership model to decompose work safely. Here's the canonical decomposition strategy:

### Task 0: Skeleton Foundation (Sequential, No Parallels)
**Deliverables:**
- Copy `apps/appshell/app/` → `apps/{project_name}/app/`
- Install dependencies: `npm install`
- Install shadcn components: `shadcn-ui add button card input dropdown-menu form ...`
- Configure Tailwind design tokens in `tailwind.config.ts` (if customizations needed)
- Update `.env.example` with `VITE_APP_NAME`
- Verify `npm run dev` renders without errors

**Output:** Fully working skeleton with all UI primitives ready, header/footer/layout locked

### Tasks 1-N: Parallel Screen & Feature Tasks
**One task per screen/hook** (no file sharing):

**Screen Task Pattern:**
```
Task X: Create FeatureScreen
├─ Depends: Task 0 (skeleton)
├─ Creates: src/screens/FeatureScreen.tsx (exclusive file)
├─ Optional: Create `src/hooks/useFeatureData.ts` if data fetching needed
├─ Optional: Append to `src/mocks/handlers.ts` if new API endpoint needed
│            — add handlers in a dedicated commented block: // <FeatureName> handlers
│            — never modify existing handlers
├─ Updates: main.tsx lazy import + route (single addition each, done in integration task)
└─ Tests: Unit test in `src/__tests__/screens/FeatureScreen.test.tsx`
```

**Hook/Data Task Pattern:**
```
Task X: Implement Data Layer
├─ Depends: Task 0 (skeleton)
├─ Creates: src/hooks/useDataLayer.ts (exclusive file)
├─ Updates: src/mocks/handlers.ts (append new handlers only, no modification of existing)
├─ Updates: src/mocks/data/entities.ts (append new seed data)
└─ Tests: Unit test in `src/__tests__/hooks/useDataLayer.test.tsx`
```

**Integration Task (Final, Sequential):**
```
Task N+1: Integration & Final Wiring
├─ Depends: All screen/feature tasks (1-N)
├─ Updates: src/main.tsx — lazy imports + route array (consolidates all screens)
├─ Updates: src/screens/routing.test.tsx — add route assertions for new screens
├─ Verification: `npm run dev` renders all screens without errors
├─ Testing: `npm run test` passes all tests
└─ Output: Fully integrated, tested app ready for deployment
```

### File Ownership Matrix

| File Path | Owner | Parallel? | Notes |
|-----------|-------|-----------|-------|
| `src/screens/FeatureScreen.tsx` | Task X | ✅ YES | Each screen = new file |
| `src/hooks/useFeature.ts` | Task X | ✅ YES | Each hook = new file |
| `src/main.tsx` | Integration Task | ❌ NO | Lazy imports + route registry — touch only in task N+1 |
| `src/mocks/handlers.ts` | Multiple tasks | ⚠️ APPEND ONLY | Each task adds a `// <FeatureName> handlers` block — never modifies existing handlers |
| `src/screens/routing.test.tsx` | Integration Task | ❌ NO | Route assertions consolidated in task N+1 |
| `src/mocks/data/*.ts` | Multiple tasks | ⚠️ APPEND ONLY | Add new entities, don't modify existing |
| `src/components/Header.tsx` | Task 0 | ❌ NO | Locked after setup |
| `src/components/Footer.tsx` | Task 0 | ❌ NO | Locked after setup |
| `src/components/AppLayout.tsx` | Task 0 | ❌ NO | Locked after setup |
| `tailwind.config.ts` | Task 0 | ❌ NO | Frozen design tokens |
| `src/styles/globals.css` | Task 0 | ❌ NO | Frozen theme variables |

### Example: 4-Screen Dashboard Decomposition

```
Task 0: Skeleton
  ├─ Copy appshell
  ├─ Configure design tokens
  └─ Install shadcn components
    ✓ Creates Foundation for Tasks 1-4

Task 1: OverviewScreen (depends: Task 0)
  ├─ Create src/screens/OverviewScreen.tsx
  ├─ Create src/hooks/useOverviewMetrics.ts
  └─ Add MSW handlers for /api/metrics

  Task 2: UsersScreen (depends: Task 0) [PARALLEL with Task 1]
    ├─ Create src/screens/UsersScreen.tsx
    ├─ Create src/hooks/useUsers.ts
    └─ Add MSW handlers for /api/users

  Task 3: ReportsScreen (depends: Task 0) [PARALLEL with Tasks 1-2]
    ├─ Create src/screens/ReportsScreen.tsx
    ├─ Create src/hooks/useReports.ts
    └─ Add MSW handlers for /api/reports

Task 4: Integration (depends: Tasks 1, 2, 3)
  ├─ Wire all screens into main.tsx (lazy imports + routes)
  ├─ Update routing.test.tsx with new route assertions
  ├─ Run full test suite
  └─ Verify all routes work

Result: 3 agents work in parallel on tasks 1-3 (ZERO merge conflicts)
        Task 4 completes immediately after all parallel tasks finish
        Total time: ~2x single-screen development time (not 4x)
```

### Why Zero Merge Conflicts?
- **Task 1 creates** `src/screens/OverviewScreen.tsx` — **unique file, only Task 1 modifies**
- **Task 2 creates** `src/screens/UsersScreen.tsx` — **unique file, only Task 2 modifies**
- **Task 3 creates** `src/screens/ReportsScreen.tsx` — **unique file, only Task 3 modifies**
- **Task 4 updates** `src/main.tsx` routes + `routing.test.tsx` — **happens AFTER all parallel tasks, no conflicts**

Each task's exclusive file ownership guarantees merge-safe delivery.

---

## Tests

AppShell ships with a test suite (`src/**/*.test.tsx`, `src/**/*.test.ts`) covering core components, routing, hooks, and patterns.

Existing tests are a starting point and may evolve or disappear as the app evolves. They are not a constraint — they reflect the current expected behavior.

## Summary

AppShell enforces **exclusive file ownership**, **design by constraint**, and **proven patterns** to enable parallel-safe, high-quality application development. By following these conventions, teams and AI agents can:

- Work simultaneously without merge conflicts
- Maintain visual consistency automatically
- Onboard new projects in <10 minutes
- Scale from 1 to 6+ parallel developers seamlessly

Use this skill whenever scaffolding a new OneTicket app project or extending an AppShell-based application.
