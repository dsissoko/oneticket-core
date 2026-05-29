---
weight: 2
title: "AppShell Reuse — Creating a new app from the skeleton"
---

# Runbook — AppShell Reuse: Creating a new app from the skeleton

## General principle

AppShell is a **copy-paste reference skeleton** for React/Vite apps. Instead of building from scratch, you copy the skeleton directory, adapt configuration, customize key screens, and wire your features. This approach eliminates merge conflicts through exclusive file ownership and enforces design consistency through inherited tokens and components.

---

## When to use this runbook

- You are creating a new app project in the `apps/` directory
- You want to inherit AppShell's structure, routing, theming, and component library
- You need a fast onboarding path without manual boilerplate setup
- You want to avoid merge conflicts in parallel development tasks

---

## Step 1 — Copy the skeleton

Copy the AppShell skeleton to your new project:

```bash
# From the repo root
cp -r apps/appshell/app apps/{project}/app
```

Replace `{project}` with your project name (e.g., `breakout`, `survey`, `analytics`).

**Verify:** Check that your new directory contains:
```
apps/{project}/app/
├── src/
│   ├── components/
│   ├── screens/
│   ├── hooks/
│   ├── mocks/
│   ├── lib/
│   ├── App.tsx
│   ├── main.tsx
│   └── globals.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Step 2 — Environment setup

Create `.env.example` and `.env.local` in your project's app directory:

```bash
cd apps/{project}/app
cat > .env.example << 'EOF'
VITE_APP_NAME=My App Name
EOF

cp .env.example .env.local
# Edit .env.local and set VITE_APP_NAME to your app's display name
```

Update `.gitignore` to exclude `.env.local`:

```bash
echo ".env.local" >> .gitignore
```

**Verify:** The app reads `VITE_APP_NAME` from `import.meta.env.VITE_APP_NAME`. Check it appears in the Header at runtime.

---

## Step 3 — Update config

Update `.oneticket/config.yml` to register your new project:

```yaml
# In .oneticket/config.yml
current_project: {project}
app_path: apps/{project}/app
docs_path: apps/{project}/docs
```

This ensures that all agent operations target your project by default.

**Verify:** Run `gh api repos/{owner}/{repo}/contents/.oneticket/config.yml` and confirm `current_project` matches your project name.

---

## Step 4 — Customize AboutScreen

Edit `apps/{project}/app/src/screens/AboutScreen.tsx`:

```bash
# Open the file
nano apps/{project}/app/src/screens/AboutScreen.tsx
```

Replace the AppShell description with your project description:
- Change the `<h2>` title to your app name
- Replace the introductory paragraph with your app's purpose and overview
- Update the feature list to match your actual features
- Link to your project's documentation (e.g., `/docs/what/product-spec.md`)

Example:

```tsx
<h2>{import.meta.env.VITE_APP_NAME}</h2>
<p>
  My App is a [purpose]. It helps users [key benefit] by [mechanism].
</p>
<ul>
  <li>Feature 1</li>
  <li>Feature 2</li>
</ul>
```

---

## Step 5 — Customize HelpScreen

Edit `apps/{project}/app/src/screens/HelpScreen.tsx`:

Replace the AppShell quickstart with your project-specific steps:

```bash
nano apps/{project}/app/src/screens/HelpScreen.tsx
```

Update:
- The `<h2>` title to your app name
- The introductory paragraph to your app's core workflow
- Replace the bullet list with your project's quickstart steps
- Add links to your project runbooks or detailed docs

Example:

```tsx
<h2>Quick Start — {import.meta.env.VITE_APP_NAME}</h2>
<p>
  To get started with {app name}, follow these steps:
</p>
<ol>
  <li>Step 1 — [action]</li>
  <li>Step 2 — [action]</li>
  <li>Step 3 — [action]</li>
</ol>
<p>
  See the <a href="/docs/run">[Project Runbook]</a> for detailed workflows.
</p>
```

---

## Step 6 — Add feature screens

For each feature, create a new screen file in `apps/{project}/app/src/screens/`:

```bash
# Create a new screen
touch apps/{project}/app/src/screens/FeatureScreen.tsx
```

Each screen file follows the pattern:

```tsx
import { useState } from 'react';

export function FeatureScreen() {
  const [data, setData] = useState(null);

  return (
    <div className="p-4">
      <h2>Feature Name</h2>
      {/* Your feature UI here */}
    </div>
  );
}
```

**Rules:**
- One screen file = one route / one feature area
- Screen owns its own data, state, and hooks — no shared state mutations
- Place reusable components in `src/components/`
- Place data-fetching hooks in `src/hooks/` (use React Query pattern from `useUsers()` example)
- Place mock handlers in `src/mocks/handlers/` if you need API mocking

---

## Step 7 — Wire screens into App.tsx

Edit `apps/{project}/app/src/App.tsx` to add routes for your new screens:

```bash
nano apps/{project}/app/src/App.tsx
```

Add imports and routes:

```tsx
import { FeatureScreen } from './screens/FeatureScreen';

// In the Routes definition:
<Routes>
  <Route path="/" element={<AppLayout />}>
    <Route index element={<HomeScreen />} />
    <Route path="about" element={<AboutScreen />} />
    <Route path="help" element={<HelpScreen />} />
    <Route path="feature" element={<FeatureScreen />} />
  </Route>
</Routes>
```

Update the Header component to link to your new features:

```tsx
// In Header.tsx, add navigation items to the "About & Help" dropdown
<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => navigate('/about')}>About</DropdownMenuItem>
    <DropdownMenuItem onClick={() => navigate('/feature')}>Feature Name</DropdownMenuItem>
    <DropdownMenuItem onClick={() => navigate('/help')}>Help</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Verify:** Run the app locally and navigate to your new feature. It should load without errors.

---

## Step 8 — Deploy to GitHub Pages

Push your changes to the `main` branch:

```bash
git add apps/{project}
git commit -m "feat: initialize {project} from AppShell skeleton"
git push origin main
```

GitHub Actions automatically deploys the app:
- The workflow builds the app and publishes it to GitHub Pages
- Your app is live at `https://{owner}.github.io/{repo}/apps/{project}/`

**Verify:** Navigate to the deployed URL and confirm your app loads, theme toggle works, and screens render correctly.

---

## Preconditions

Before starting:
- **Node.js 18+** — Vite and dependencies require Node 18 or later
- **Git** — For cloning and committing changes
- **GitHub repo access** — To push branches and trigger deployments

Check versions:

```bash
node --version
npm --version
git --version
```

---

## Expected outcome

After completing this runbook:
- ✅ New app directory created at `apps/{project}/app/`
- ✅ Environment and config files set up with your project name
- ✅ AboutScreen and HelpScreen customized with your app's information
- ✅ Feature screens wired into routing in `App.tsx`
- ✅ App runs locally at `http://localhost:5173` (after `npm install && npm run dev`)
- ✅ App deployed to GitHub Pages and live at deployment URL
- ✅ Ready for parallel feature development using exclusive file ownership model

---

## What not to do

- **Never modify shared files across parallel tasks** — Each feature task owns its own screen, hook, and mock handler files. Shared files (`App.tsx`, `globals.css`, `tailwind.config.ts`, layout components) are owned by the setup task only. Violating this causes merge conflicts.

- **Never add new npm dependencies without coordination** — Dependency changes affect all parallel tasks. If a feature requires a new package, request it in the setup phase before parallel tasks begin.

- **Never inline styles or create local CSS** — Use only Tailwind classes and CSS custom properties from `globals.css`. Inline styles break design consistency and prevent theme switching.

- **Never create custom theme tokens without documentation** — All colors, spacing, and typography must consume shared tokens in `globals.css` and `tailwind.config.ts`. Custom overrides in one screen prevent other screens from accessing the same design decision.

- **Never skip the `.env.example` setup** — Environment variables document required configuration. Without `.env.example`, new developers won't know what to configure.

---

## Known issues

| Symptom | Cause | Fix |
|---|---|---|
| App doesn't build after copying skeleton | `package-lock.json` incompatibility or missing dependencies | Run `rm -rf node_modules package-lock.json && npm install` in `apps/{project}/app/` |
| Header doesn't show app name | `VITE_APP_NAME` env var not set | Add `VITE_APP_NAME=My App` to `.env.local` and restart dev server |
| Styles look broken or misaligned | Tailwind not processing your new screen files | Ensure `tailwind.config.ts` includes `./src/**/*.{tsx,ts}` in the content array |
| Theme toggle doesn't work | MSW or CSS variables not loaded | Ensure `globals.css` is imported in `main.tsx` and the `<html>` element has the theme class |
| Route returns 404 on deployed site | GitHub Pages route handling — single-page app fallback | Ensure `vite.config.ts` has `base: process.env.VITE_BASE_URL` set correctly for GitHub Pages |

---

## Canonical example

**Issue #836** — appshell (May 29, 2026)

- What happened: AppShell skeleton created to eliminate merge conflicts in parallel task pipelines and enforce design consistency across new app projects.
- How it was resolved: Established exclusive file ownership model (each task owns its own screen, hook, handler), copied skeleton to new projects via this runbook, and validated deployment to GitHub Pages.
