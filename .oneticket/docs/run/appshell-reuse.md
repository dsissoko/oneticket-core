---
weight: 1
title: "Reuse AppShell Skeleton"
---

# Runbook — Reuse AppShell in New Projects

## General principle

AppShell is the **reference skeleton** for all new app projects in oneticket-core. It establishes exclusive file ownership rules that prevent merge errors in parallel FAN-OUT development pipelines. This runbook guides you through copying, adapting, and deploying a new project based on AppShell in 7 sequential steps, plus guidance on screen conventions and task decomposition patterns.

---

## When to use this runbook

- Starting a new OneTicket app project from scratch
- You need to avoid merge conflicts during parallel development tasks
- Your project needs design consistency enforced by constraints
- You want to reuse AppShell's layout system, theme switching, and MSW setup

---

## Step 1 — Copy AppShell skeleton to your new project

Copy the entire `apps/appshell/app/` directory to your new project location:

```bash
# From repository root
cp -r apps/appshell/app/ apps/{your-project}/app/
```

**Verify:**
```bash
ls -la apps/{your-project}/app/
# Should show: src/, index.html, package.json, vite.config.ts, tailwind.config.ts, etc.
```

**Why:** The skeleton contains all boilerplate — bundler config, theme setup, MSW initialization, React Router structure, and shadcn components. Do not modify these files in parallel tasks.

---

## Step 2 — Set VITE_APP_NAME in .env.example

Update `.env.example` in your project to define the app name displayed in the header:

```bash
# apps/{your-project}/app/.env.example
VITE_APP_NAME=YourProjectName
```

**Verify:**
```bash
cat apps/{your-project}/app/.env.example | grep VITE_APP_NAME
```

**Why:** `VITE_APP_NAME` is consumed by the `Header` component and displayed as the top-left clickable link. Every project must have a unique identity.

---

## Step 3 — Update current_project in .oneticket/config.yml

Modify `.oneticket/config.yml` to register your new project:

```yaml
current_project: {your-project}
```

Also update `docs_path`:
```yaml
docs_path: apps/{your-project}/docs
```

**Verify:**
```bash
grep "current_project:" .oneticket/config.yml
```

**Why:** The agent team uses `current_project` to locate your project's documentation, specs, and task manifests. If not set correctly, agents will target the wrong directory.

---

## Step 4 — Update AboutScreen with your project description

Edit `src/screens/AboutScreen.tsx` to describe your project (not AppShell):

```tsx
export function AboutScreen() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader>
        <PageHeader.Title>About {appName}</PageHeader.Title>
      </PageHeader>
      <Card>
        <Card.Header>
          <Card.Title>Project Overview</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-foreground">
            {appName} is a {your-description}. It demonstrates...
          </p>
          <p className="text-muted-foreground mt-4">
            <a href="https://dsissoko.github.io/oneticket-core/{your-project}/docs/" 
               className="text-accent hover:underline">
              View full documentation →
            </a>
          </p>
          <p className="text-muted-foreground">
            <a href="https://github.com/dsissoko/oneticket-core" 
               className="text-accent hover:underline">
              View on GitHub →
            </a>
          </p>
        </Card.Content>
      </Card>
    </div>
  );
}
```

**Verify:**
```bash
npm run dev
# Open http://localhost:5173/about
# Confirm your project name and description appear in the About screen
```

**Why:** AboutScreen is the first place users learn what your project does. It must reflect your project identity, not AppShell's.

---

## Step 5 — Update HelpScreen with your project quickstart

Edit `src/screens/HelpScreen.tsx` to replace the AppShell quickstart with your project's quickstart guide:

```tsx
export function HelpScreen() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader>
        <PageHeader.Title>Help & Quickstart</PageHeader.Title>
      </PageHeader>
      <Card>
        <Card.Header>
          <Card.Title>Getting Started with {appName}</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-foreground">
            <li><strong>Install dependencies:</strong> <code>npm install</code></li>
            <li><strong>Run dev server:</strong> <code>npm run dev</code></li>
            <li><strong>Open in browser:</strong> <code>http://localhost:5173</code></li>
            <li><strong>{your-step-4}</strong></li>
            <li><strong>{your-step-5}</strong></li>
            <li><strong>View docs:</strong> See architecture.md in .oneticket/</li>
            <li><strong>Deploy:</strong> Push to main — GitHub Pages auto-deploys</li>
          </ol>
        </Card.Content>
      </Card>
      <Card className="mt-4">
        <Card.Header>
          <Card.Title>References</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-2 text-sm text-muted-foreground">
          <p>
            <a href="{runbook-url}" className="text-accent hover:underline">
              Full reuse runbook →
            </a>
          </p>
          <p>
            <a href="https://dsissoko.github.io/oneticket-core/{your-project}/docs/" 
               className="text-accent hover:underline">
              Generated documentation →
            </a>
          </p>
        </Card.Content>
      </Card>
    </div>
  );
}
```

**Verify:**
```bash
npm run dev
# Open http://localhost:5173/help
# Confirm your quickstart steps appear and links are correct
```

**Why:** HelpScreen is the entry point for users or new developers joining your project. It must be current and specific to your project's workflow.

---

## Step 6 — Add feature screens in screens/

Implement your project-specific features by creating new screen files in `src/screens/`:

**Convention: One screen = One file = Exclusive ownership**

```bash
# Structure for screens/
src/screens/
├── HomeScreen.tsx          ← skeleton example, keep or replace
├── AboutScreen.tsx         ← update (step 4)
├── HelpScreen.tsx          ← update (step 5)
├── {FeatureAScreen}.tsx    ← one task per screen
├── {FeatureBScreen}.tsx    ← one task per screen
└── {FeatureCScreen}.tsx    ← one task per screen
```

**Task decomposition rules (for `@leaddev`):**

1. **Task 0 — Skeleton setup (sequential, no depends_on)**
   - Copy AppShell skeleton
   - Configure `.env.example`, `tailwind.config.ts`, design tokens
   - Install shadcn components via `npx shadcn-ui@latest add`
   - Update AboutScreen and HelpScreen
   - Wire screens into `App.tsx` routes
   - **Output:** ready-to-run scaffold with no feature code

2. **All feature tasks (parallel, depends_on: [task-0])**
   - One task = one new screen file in `src/screens/`
   - Each screen has exclusive ownership — never modified by other tasks
   - Can add hooks in `src/hooks/` and mock handlers in `src/mocks/handlers.ts` in parallel

3. **Integration task (sequential, depends_on: [all screen tasks])**
   - Wire all screens into `App.tsx` routes
   - Validate all screens render without errors

**Screen skeleton template:**

```tsx
// src/screens/YourScreenName.tsx
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";

export function YourScreen() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader>
        <PageHeader.Title>Your Feature Title</PageHeader.Title>
        <PageHeader.Description>Optional subtitle or description</PageHeader.Description>
      </PageHeader>

      <Card>
        <Card.Header>
          <Card.Title>Section Title</Card.Title>
        </Card.Header>
        <Card.Content>
          {/* Your feature content here */}
        </Card.Content>
      </Card>
    </div>
  );
}
```

**Visual conventions for agents:**

| Rule | Example |
|---|---|
| Always use `PageHeader` at the top of every screen | `<PageHeader><PageHeader.Title>...</PageHeader.Title></PageHeader>` |
| Always use `Card` for grouped content | `<Card><Card.Header>...</Card.Header><Card.Content>...</Card.Content></Card>` |
| Always use `EmptyState` when there is no data | `{!data.length && <EmptyState message="No items found" />}` |
| Never use inline styles — only Tailwind classes | ✓ `className="mb-4"` / ✗ `style={{ marginBottom: "1rem" }}` |
| Spacing: always Tailwind utilities — never raw px | ✓ `className="space-y-4"` / ✗ `className="gap-16px"` |
| Typography: use design-token scale in tailwind.config.ts | ✓ `className="text-lg font-semibold"` / ✗ `className="text-18px"` |
| Icons: always use `lucide-react` — never emoji or text | ✓ `<CheckCircle2 />` / ✗ `✓` or text "check" |

**Available libraries for screens:**

| Library | Purpose | Installed |
|---|---|---|
| shadcn/ui | UI primitives (button, card, form, dropdown, etc.) | Yes — use `npx shadcn-ui@latest add` to add new components |
| React Hook Form + Zod | Forms + validation | Yes |
| React Query (`@tanstack/react-query`) | Data fetching + caching | Yes |
| Zustand | Global state | Yes — available, unused in skeleton |
| lucide-react | Icons | Yes |
| MSW (Mock Service Worker) | Mock API in dev | Yes — active only when `import.meta.env.DEV` |

---

## Step 7 — Deploy automatic via docs-site-github-pages.yml

Push your branch to main — deployment is automatic:

```bash
git add .
git commit -m "feat: add {your-project} from appshell skeleton"
git push origin main
```

**Verify:**
1. Check GitHub Actions: https://github.com/dsissoko/oneticket-core/actions
2. Wait for `docs-site-github-pages.yml` workflow to complete
3. Visit generated site: `https://dsissoko.github.io/oneticket-core/{your-project}/docs/`
4. Verify live app: `https://dsissoko.github.io/oneticket-core/{your-project}/` (if configured)

**Why:** The GitHub Pages workflow is triggered on every push to main. It runs `npm run build` and deploys the generated site automatically. No manual deployment steps required.

---

## What not to do

- **Never modify `package.json`, `vite.config.ts`, or `tsconfig.json` in parallel tasks** — these files are skeleton-frozen at task 0. If you need new dependencies, request them in task 0, or open an issue to update the skeleton itself.

- **Never modify `src/layouts/`, `src/components/layout/`, or `src/components/ui/` in parallel feature tasks** — these are owned by a single setup task. Modifying them in parallel creates merge conflicts.

- **Never bypass the screen file convention** — adding logic to `App.tsx` directly breaks the exclusive ownership model and creates merge errors when multiple tasks route to App.tsx.

- **Never use inline styles** — Tailwind only. Inline styles prevent theme switching and design consistency across screens.

- **Never skip the AppShell skeleton files** — the bundler config, MSW setup, and React Router structure are production-tested. Modifying them introduces risk and technical debt.

- **Never commit generated files to version control** — `.next/`, `dist/`, `.tsbuildinfo`, `test-results/` should be in `.gitignore`.

---

## Known issues

| Symptom | Cause | Fix |
|---|---|---|
| `npm install` fails with peer dependency warnings | Node version too old or pnpm/yarn version incompatible | Use Node 18+ and npm 9+. Run `npm cache clean --force` then retry. |
| ThemeToggle does not persist theme across page reload | `localStorage` not initialized | Check `import.meta.env.DEV` guard in `main.tsx`. Clear browser storage and reload. |
| MSW handlers not intercepting API calls | MSW worker not initialized in dev | Verify `main.tsx` imports MSW setup. Check `src/mocks/browser.ts` is exporting `worker`. Run `npm run dev` from the `app/` directory. |
| Routes return 404 in production | Base path not set in vite.config.ts | Update `vite.config.ts` with correct `base: "/oneticket-core/{your-project}/"` matching GitHub Pages subfolder. |
| Tailwind classes not applying | Tailwind content paths misconfigured | Verify `tailwind.config.ts` includes `src/**/*.{tsx,ts}`. Run `npm run build` to test. |
| Build fails with `VITE_APP_NAME is undefined` | `.env.example` not copied to `.env.local` | Copy `.env.example` to `.env.local` and restart dev server. |

---

## Canonical example

**Issue #797 — AppShell Skeleton Implementation (May 2026)**

This runbook was created as part of AppShell specification and skeleton delivery. The 7-step process was validated by:
1. Creating AppShell structure from scratch
2. Testing the copy → adapt → deploy workflow with breakout and monjournal projects
3. Documenting task decomposition rules for `@leaddev` to prevent merge errors in FAN-OUT pipelines

All projects now use this runbook as the entry point for reusing AppShell.
