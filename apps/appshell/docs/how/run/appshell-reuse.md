---
weight: 1
title: "Reuse AppShell Skeleton for New Projects"
---

# Runbook — Reuse AppShell Skeleton for New Projects

## General principle

AppShell is a canonical React + Vite skeleton designed to be copied and adapted for new OneTicket projects. This runbook guides you through the process of cloning the skeleton structure, configuring it for your project, and establishing a ready-to-develop environment in under 10 minutes. The exclusive file ownership model ensures parallel development without merge conflicts.

---

## When to use this runbook

- You are starting a new OneTicket application project
- You want to leverage the AppShell design system, layout patterns, and authentication scaffolding
- Your team needs a fast, merge-safe structure for parallel feature development
- You need Vite + React + TypeScript + Tailwind CSS + shadcn/ui baseline

---

## Prerequisites

- Node.js ≥18.0 (verify with `node --version`)
- npm ≥9.0 (verify with `npm --version`)
- Familiarity with React, TypeScript, and component-based development
- Basic knowledge of Tailwind CSS and CSS custom properties
- Git access to the OneTicket monorepo
- A text editor or IDE (VS Code recommended)

---

## Step 1 — Clone AppShell Skeleton to Your Project Directory

Copy the entire `apps/appshell/app/` directory structure to `apps/{your-project-name}/app/`:

```bash
# From the monorepo root
cp -r apps/appshell/app apps/{your-project-name}/app
```

**Verification:**
- Confirm the new directory exists: `ls -la apps/{your-project-name}/app/`
- Check core files present: `src/`, `public/`, `package.json`, `vite.config.ts`, `tailwind.config.ts`

**Why:** This copies all source code, configuration, and testing setup as a starting point for your new project.

---

## Step 2 — Configure VITE_APP_NAME in .env.example

Create or update `.env.example` in `apps/{your-project-name}/app/` to define your project's environment variables:

```bash
# .env.example
VITE_APP_NAME=MyNewProject
VITE_API_BASE_URL=http://localhost:3000
VITE_DEBUG=false
```

Copy this to `.env.local` for local development:

```bash
cp apps/{your-project-name}/app/.env.example apps/{your-project-name}/app/.env.local
```

**Verification:**
- Confirm `.env.example` exists in your project root
- Confirm `.env.local` is created for local development
- Update `VITE_APP_NAME` to match your project identity

**Why:** Environment variables are used in `src/lib/constants.ts` and Vite build configuration to customize your app's name and API endpoints.

---

## Step 3 — Update Configuration Files (package.json, config.yml)

Update project metadata in `apps/{your-project-name}/app/package.json`:

```json
{
  "name": "@oneticket/{your-project-name}",
  "version": "0.1.0",
  "description": "Description of your project"
}
```

If a `config.yml` or OpenCode configuration file exists in your repo root, update the `current_project` field:

```yaml
current_project: {your-project-name}
```

**Verification:**
- Run `npm --version` to confirm package.json is valid: no parse errors
- Verify `current_project` matches your directory name in config files

**Why:** This ensures your project is properly identified in the monorepo, deployment pipelines, and IDE tools.

---

## Step 4 — Customize the About Screen

Edit `apps/{your-project-name}/app/src/pages/AboutPage.tsx` to describe your project:

```typescript
export function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1>About {YOUR_PROJECT_NAME}</h1>
      <p>
        {YOUR_PROJECT_DESCRIPTION}
      </p>
      <div className="mt-6">
        <h2>Tech Stack</h2>
        <ul>
          <li>React 18 + TypeScript</li>
          <li>Vite (build tool)</li>
          <li>Tailwind CSS + shadcn/ui</li>
          <li>React Query for data fetching</li>
        </ul>
      </div>
    </div>
  );
}
```

**Verification:**
- Open `http://localhost:5173/about` in your browser
- Confirm your project name and description are visible
- Check that styling matches the design tokens

**Why:** The About page establishes your project's identity and communicates your tech stack to users and new developers.

---

## Step 5 — Customize the Help/FAQ Screen

Edit `apps/{your-project-name}/app/src/pages/HelpPage.tsx` with quickstart and FAQ for your project:

```typescript
export function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1>Help & Documentation</h1>
      
      <h2>Getting Started</h2>
      <ol>
        <li>Clone the repository</li>
        <li>Run `npm install`</li>
        <li>Run `npm run dev`</li>
        <li>Open http://localhost:5173</li>
      </ol>

      <h2>Frequently Asked Questions</h2>
      <details>
        <summary>How do I add a new page?</summary>
        <p>Create a new file in src/pages/ and add a route in App.tsx</p>
      </details>
      
      <h2>Resources</h2>
      <ul>
        <li><a href="https://github.com/{org}/{repo}/tree/main/apps/{your-project-name}">GitHub Repository</a></li>
        <li><a href="https://react.dev">React Documentation</a></li>
        <li><a href="https://tailwindcss.com">Tailwind CSS Docs</a></li>
      </ul>
    </div>
  );
}
```

**Verification:**
- Open `http://localhost:5173/help` in your browser
- Verify all links are correct and resources are accurate
- Test that collapsible sections (details/summary) work

**Why:** The Help page reduces onboarding friction for new developers and establishes a single source of truth for common questions.

---

## Step 6 — Add Custom Screens (One Screen Per File)

For each new page or feature, create a dedicated file in `apps/{your-project-name}/app/src/pages/` following the exclusive file ownership model:

```bash
# Example: Create a Users page
touch apps/{your-project-name}/app/src/pages/UsersPage.tsx
```

**Template for a new screen:**

```typescript
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function UsersPage() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
```

Add the route in `apps/{your-project-name}/app/src/App.tsx`:

```typescript
const UsersPage = React.lazy(() =>
  import("@/pages/UsersPage").then(m => ({ default: m.UsersPage }))
);

// In your routes array:
{
  path: "/users",
  element: <UsersPage />,
}
```

**Conventions:**
- One screen = one `.tsx` file
- One route = one file (no shared modification)
- Use hooks from `src/hooks/` for data fetching
- Use shadcn/ui components for UI primitives
- Name files descriptively: `UsersPage.tsx`, `ProductDetailPage.tsx`, etc.

**Verification:**
- Run `npm run dev` and navigate to your new route
- Verify the page loads without errors
- Check browser console for TypeScript and runtime errors

**Why:** Exclusive file ownership prevents merge conflicts when multiple developers or agents work in parallel.

---

## Step 7 — Deploy: Push to Repository and Trigger CI

Commit your customized project and push to your feature branch:

```bash
# From the monorepo root
cd apps/{your-project-name}
git add -A
git commit -m "feat: initialize {your-project-name} from AppShell skeleton"
git push origin feature/{your-project-name}
```

Create a pull request and your CI pipeline will automatically:
- Run `npm install`
- Validate TypeScript (`npm run type-check`)
- Run tests (`npm run test`)
- Build the app (`npm run build`)
- Deploy to staging (if configured)

**Verification:**
- Check GitHub Actions for your PR — confirm all checks pass
- Verify the app builds without errors
- Test the deployed staging URL in your browser

**Why:** Automated CI ensures code quality, catches issues early, and enables continuous deployment.

---

## Conventions & Best Practices

### File Organization
```
src/
├── pages/          # Route screens (one file per route)
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks (data fetching, state)
├── stores/         # Zustand stores (global state)
├── api/            # API clients and types
├── lib/            # Utilities and constants
└── styles/         # Global CSS and design tokens
```

### Screen Naming
- Name screens descriptively: `UsersPage.tsx`, `ProductDetailPage.tsx`
- Do NOT share screen files; create one file per route
- Each developer/agent owns their own page files

### Component Reuse
- Lock shared components (Header, Footer, AppLayout) — do not modify after v1 setup
- Build new features with shadcn/ui primitives
- Extract UI components to `src/components/` only if shared across 3+ screens

### Data Fetching
- Use React Query hooks from `src/hooks/` (e.g., `useUsers()`)
- All API calls route through `src/api/client.ts`
- Mock responses in `src/api/mocks.ts` with MSW for dev/test

### Styling
- Use Tailwind CSS utility classes — no inline styles
- All colors and tokens come from `tailwind.config.ts`
- Define custom tokens once; reuse via Tailwind classes

---

## What not to do

- **Never modify locked components (Header, Footer, AppLayout)** — these are shared and will break other projects. If you need a variant, create a new component instead.

- **Never import CSS directly from external libraries** — Tailwind + shadcn/ui are the only approved sources. Off-brand colors and spacing break visual consistency.

- **Never use `any` types in TypeScript** — strict mode is enforced. Use proper typing to catch errors early.

- **Never commit `.env.local` or secrets** — `.env.example` is the template; `.env.local` is .gitignored.

- **Never share page/route files between tasks** — exclusive file ownership is the contract. Create a new file instead.

- **Never modify `tailwind.config.ts` or `globals.css` arbitrarily** — these are design tokens and locked. Submit requests through proper review.

---

## Known issues

| Symptom | Cause | Fix |
|---|---|---|
| `npm install` fails with peer dependency warnings | Node modules are stale or version mismatch | Run `npm ci` to install exact versions from `package-lock.json` |
| TypeScript errors on import `@/` paths | Vite path alias not configured | Verify `vite.config.ts` has `alias: { '@': resolve(__dirname, './src') }` |
| Theme toggle doesn't persist | localStorage is blocked or theme provider not mounted | Check browser console; ensure `<ThemeProvider>` wraps App.tsx |
| MSW handlers not intercepting API calls | Worker registration failed in dev mode | Run `npm run dev` again; check browser console for worker errors |
| Tailwind classes not applying | Build cache is stale | Run `npm run build` or restart Vite dev server |
| Merge conflicts on App.tsx routes | Multiple branches modified routes simultaneously | Use exclusive file ownership; add routes in separate PRs or coordinate |

---

## Canonical example

**Issue #879** — oneticket-core (2026-05-29)

- **Task:** Create runbook for reusing AppShell skeleton in new projects
- **Context:** New developers and AI agents needed clear, step-by-step guidance to clone AppShell and customize it within 10 minutes
- **Resolution:** Documented all 7 steps from skeleton copy through customization and deployment; established conventions for exclusive file ownership and design token compliance
- **Outcome:** Team can now onboard new projects quickly without guidance; runbook enforces merge-safe parallel development

---

**Last Updated:** 2026-05-29  
**Owner:** @analyst  
**Status:** Ready for review
