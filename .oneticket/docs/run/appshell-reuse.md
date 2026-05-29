---
weight: 1
title: "How to Reuse AppShell"
---

# Runbook — How to Reuse AppShell

## General principle

AppShell is the reference skeleton for all projects in oneticket-core. This runbook guides you through the steps to copy AppShell, adapt it to your project, and deploy it automatically. The structure enforces exclusive file ownership to eliminate merge conflicts in parallel development.

---

## When to use this runbook

- You are initializing a new project and want to start from AppShell
- You need to adapt AppShell's layout, theme, or screens for a specific application
- You want to understand the file ownership conventions that prevent merge errors in fan-out parallelization

---

## Step 1 — Copy AppShell skeleton to your project

Copy the entire AppShell app directory into your new project location:

```bash
cp -r apps/appshell/app apps/{your-project}/app
```

This gives you a complete, working Vite + React + TypeScript + Tailwind + shadcn/ui application with:
- Pre-configured Vite bundler, TypeScript, Tailwind CSS
- MSW (Mock Service Worker) for dev API mocking
- React Router for client-side navigation
- Theme support (system/light/dark)
- Responsive layout with Header, AppLayout, and Footer

---

## Step 2 — Set VITE_APP_NAME in .env.example

Open `apps/{your-project}/app/.env.example` and replace the placeholder:

```bash
VITE_APP_NAME=YourProjectName
VITE_BASE_PATH=/
```

This environment variable is displayed in the app header and used in the About screen. It is read at build time by Vite.

---

## Step 3 — Update current_project in .oneticket/config.yml

Open `.oneticket/config.yml` and update the `current_project` field:

```yaml
current_project: your-project
```

This tells the @analyst, @po, @architect, and @leaddev agents which project they are working on. All documentation and task routing depend on this field.

---

## Step 4 — Update AboutScreen with your project description

Edit `apps/{your-project}/app/src/screens/AboutScreen.tsx` and replace the AppShell description with your own:

```tsx
export function AboutScreen() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">About {process.env.VITE_APP_NAME}</h1>
      <p className="text-lg mb-6">
        {/* Your project description here */}
      </p>
      <div className="space-y-2">
        <a href="https://github.com/dsissoko/oneticket-core" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          GitHub Repository
        </a>
        <a href="https://dsissoko.github.io/oneticket-core/{your-project}/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          Project Documentation
        </a>
      </div>
    </div>
  );
}
```

This screen is accessible via the dropdown menu in the app header (About & Help → About).

---

## Step 5 — Update HelpScreen with project-specific quickstart

Edit `apps/{your-project}/app/src/screens/HelpScreen.tsx` and replace the generic AppShell quickstart:

```tsx
export function HelpScreen() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Quick Start</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Clone the repository</li>
            <li>Install dependencies: npm install</li>
            <li>Start dev server: npm run dev</li>
            <li>{/* Your first-use instructions here */}</li>
          </ol>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Documentation</h2>
          <p>
            Read the full runbook:{' '}
            <a href="https://dsissoko.github.io/oneticket-core/.oneticket/docs/run/appshell-reuse/" className="text-blue-600 hover:underline">
              How to Reuse AppShell
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
```

This screen is accessible via the dropdown menu (About & Help → Help) and should contain your project's specific quickstart guide.

---

## Step 6 — Add feature screens in screens/ directory

Create new screen components following the exclusive ownership convention:

```bash
touch apps/{your-project}/app/src/screens/FeatureOneScreen.tsx
touch apps/{your-project}/app/src/screens/FeatureTwoScreen.tsx
```

**Ownership convention:**
- Each `.tsx` file in `screens/` belongs to exactly one task in the manifest
- A task modifies only its assigned screen file
- No task modifies another task's screen file
- This eliminates merge conflicts when tasks run in parallel

Example screen structure:

```tsx
import { useState } from 'react';

export function FeatureOneScreen() {
  const [data, setData] = useState(null);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Feature One</h1>
      {/* Your feature content here */}
    </div>
  );
}
```

Add a route for each screen in `App.tsx`:

```tsx
import { FeatureOneScreen } from './screens/FeatureOneScreen';
import { FeatureTwoScreen } from './screens/FeatureTwoScreen';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/feature-one" element={<FeatureOneScreen />} />
        <Route path="/feature-two" element={<FeatureTwoScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/help" element={<HelpScreen />} />
      </Route>
    </Routes>
  );
}
```

**In the manifest:**
- Create one task per screen
- Each task has `depends_on: [task-0]` (skeleton setup)
- No task depends on another task — tasks run in parallel
- All feature tasks converge in a final integration task that wires them into `App.tsx`

---

## Step 7 — Deploy automatically (push to main)

Push your changes to the main branch:

```bash
git add .
git commit -m "feat: initialize {your-project} from AppShell skeleton"
git push origin main
```

The CI/CD pipeline (`docs-site-github-pages.yml`) automatically:
1. Builds your app with Vite
2. Generates documentation from `docs_path`
3. Deploys both to GitHub Pages

Your app is now live at `https://dsissoko.github.io/oneticket-core/{your-project}/`

---

## What not to do

- **Never modify files owned by other tasks** — the exclusive ownership convention is what prevents merge conflicts. Always create new files for your feature, never edit shared files like `App.tsx`, `AppLayout.tsx`, or other tasks' screens.
- **Never inline styles** — always use Tailwind CSS classes. Inline styles break the design token system and make the app visually inconsistent.
- **Never use emoji or text symbols as icons** — always import from `lucide-react`. This ensures icon consistency and accessibility.
- **Never copy components into `screens/`** — if you need a reusable component, add it to `components/` and import it. The `screens/` directory is strictly for top-level route components.
- **Never modify `globals.css` or `tailwind.config.ts` in parallel** — these files define the design system. If you need new design tokens, propose them as a single, dedicated task.

---

## Parallelization strategy (@leaddev integration)

The AppShell structure is designed for @leaddev's task decomposition strategy:

### Task dependency model

```
Task 0: Skeleton Setup (sequential)
  ├─ Copy AppShell → {project}
  ├─ Install shadcn/ui components
  ├─ Configure theme and tailwind tokens
  └─ Verify build and dev server

Tasks 1, 2, 3, ... (parallel, depends_on: [task-0])
  ├─ Task 1: Feature Screen A
  ├─ Task 2: Feature Screen B
  ├─ Task 3: Feature Screen C
  └─ Task N: Feature Screen N

Task N+1: Integration (sequential, depends_on: [task-1, task-2, ..., task-N])
  └─ Wire all screens into App.tsx routes
```

### Ownership rules enforced by structure

| File Category | Task Ownership | Parallel Safe? |
|---|---|---|
| `package.json`, `vite.config.ts`, `tsconfig.json` | Task 0 only | ❌ No |
| `globals.css`, `tailwind.config.ts` | Task 0 only | ❌ No |
| `AppLayout.tsx`, `Header.tsx`, `Footer.tsx` | Task 0 only | ❌ No |
| `App.tsx` (route definitions) | Integration task | ❌ No |
| `screens/FeatureOneScreen.tsx` | Task 1 (exclusive) | ✅ Yes |
| `screens/FeatureTwoScreen.tsx` | Task 2 (exclusive) | ✅ Yes |
| `hooks/useFeatureOne.ts` | Task 1 (exclusive) | ✅ Yes |
| `mocks/handlers.ts` | Task assigned to it (exclusive) | ✅ Yes |

### Why this works

Each feature task:
1. Creates a new screen file (no conflicts — new file)
2. Creates a new hook if needed (no conflicts — new file)
3. Adds a new MSW handler if needed (no conflicts — new export)
4. Does NOT modify shared files like `App.tsx` or `AppLayout.tsx`

After all feature tasks complete, the integration task **does the only modification to `App.tsx`** — adding all the route definitions in one atomic commit.

### @leaddev checklist when decomposing a new feature set for a project

- [ ] Task 0 is marked as sequential (no `depends_on`)
- [ ] All feature tasks have `depends_on: [task-0]` — **not** on each other
- [ ] Each feature task creates exactly one new screen file
- [ ] Each feature task creates only new files — never modifies shared files
- [ ] Integration task is the **last** task and is marked `depends_on: [all feature tasks]`
- [ ] Integration task's **only** responsibility is to wire routes into `App.tsx`

This structure guarantees:
- **Zero merge conflicts** — parallel tasks touch different files
- **Clear ownership** — each task owns exactly one screen
- **Automatic deployment** — push to main triggers GitHub Pages build

---

## Known issues

| Symptom | Cause | Fix |
|---|---|---|
| Build fails with "Cannot find module '@/screens/FeatureScreen'" | Route added to `App.tsx` but screen file not created yet | Create the screen file at `apps/{your-project}/app/src/screens/FeatureScreen.tsx` |
| Theme toggle not working | MSW not initialized in `main.tsx` | Verify `import.meta.env.DEV` check and `worker.start()` call in `main.tsx` |
| `.env.example` values not appearing in the app | `VITE_` prefix missing | Ensure env variables start with `VITE_` — Vite only exposes these at build time |
| Merge conflict in `App.tsx` during parallel feature development | Multiple tasks modifying `App.tsx` simultaneously | Revert to single integration task — only integration task modifies `App.tsx` |
| Tailwind classes not applying | CSS not built yet | Run `npm run build` to generate CSS or verify Tailwind watcher is active in dev mode |

---

## Canonical example

Issue #854 — appshell (May 2026)

- Created AppShell as the reference skeleton for all oneticket-core projects
- Documented the file ownership convention to support parallel feature development without merge conflicts
- Established the runbook to guide new projects in reusing AppShell
