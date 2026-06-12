# AppShell Reuse — Operational Runbook

## Purpose

This runbook describes how to create a new application from the AppShell skeleton.

> **This is not a ship procedure.** It is an operational usage guide — how to reuse AppShell as a template to bootstrap a new project. The ship procedure for AppShell itself (CI/CD, deployment URLs, environment variables) is documented in [ship/ci-cd.md](../ship/ci-cd.md). Each derived project will define its own `ship/` section independently.

This runbook is the operational reference for the intent described in [epic-4-appshell-reuse](../what/epics/epic-4-appshell-reuse/epic.md).

> **Note:** The tooling that automates these steps is defined in epic-4-appshell-reuse US-004. Until that tooling is built, follow the manual steps below.

---

## Prerequisites

- Node.js 20 LTS
- npm 9+
- Access to the `oneticket-core` monorepo
- `current_project` key available in `.oneticket/config.yml`

---

## Step 1 — Copy the skeleton

```bash
# From the monorepo root
cp -r apps/appshell/app apps/{your-project}/app
cd apps/{your-project}/app
```

---

## Step 2 — Update package.json

```json
{
  "name": "{your-project}",
  "version": "0.1.0"
}
```

---

## Step 3 — Set environment variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_APP_NAME={Your Project Name}
VITE_LOG_LEVEL=debug
VITE_OTLP_ENDPOINT=
```

---

## Step 4 — Install dependencies

```bash
npm install
```

---

## Step 5 — Verify the skeleton runs

```bash
npm run dev     # should start on http://localhost:5173
npm run build   # should produce dist/ without errors
npm run test    # should pass (0 tests — infrastructure only)
```

---

## Step 6 — Customize screens

Update the following screens with your project content:

**`src/screens/AboutScreen.tsx`**
- Replace AppShell description with your project description
- Update the tagline below the `<h1>`

**`src/screens/HelpScreen.tsx`**
- Replace quickstart steps with your project-specific instructions
- Update Quick Links section

**`src/components/layout/Footer.tsx`**
- Update copyright text
- Update social links if needed

---

## Step 7 — Update OneTicket config

Edit `.oneticket/config.yml`:

```yaml
current_project: {your-project}
```

> ⚠️ This is a manual step — agent dispatch Gate 0 will block if `current_project` is missing or empty.

---

## Step 8 — Initialize doc structure

Create the documentation structure for your project:

```bash
mkdir -p apps/{your-project}/docs/what/epics
mkdir -p apps/{your-project}/docs/how/c4
mkdir -p apps/{your-project}/docs/ship
mkdir -p apps/{your-project}/docs/run
```

Copy the README templates:

```bash
cp .oneticket/templates/docs/ship/README.md apps/{your-project}/docs/ship/README.md
cp .oneticket/templates/docs/run/README.md  apps/{your-project}/docs/run/README.md
```

---

## Step 9 — Push and verify CI

```bash
git add apps/{your-project}/
git commit -m "chore: bootstrap {your-project} from AppShell skeleton"
git push origin feature/issue-{N}
```

The CI workflow will automatically:
- Build the app
- Deploy preview to `https://dsissoko.github.io/oneticket-core/{your-project}/pr/{N}/app/`
- Build the doc site when `apps/{your-project}/docs/` changes

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `import.meta.env` not typed | Missing `"types": ["vite/client"]` in `tsconfig.json` | Add to `compilerOptions.types` |
| `@/` alias not resolved | Missing `resolve.alias` in `vite.config.ts` | Add `'@': path.resolve(__dirname, './src')` |
| MSW crashes on GitHub Pages | Missing `mockServiceWorker.js` in `public/` | Run `npx msw init public/` |
| Links point to wrong URL | `BrowserRouter` missing `basename` | Add `basename={import.meta.env.BASE_URL}` |
| App blank on GitHub Pages | Missing `VITE_BASE_PATH` in `vite.config.ts` | Add `base: process.env.VITE_BASE_PATH ?? '/'` |

---

## Sub-path Deployment — Required Configuration

Any app derived from AppShell deployed to a sub-path (GitHub Pages, reverse proxy, sub-directory) must have all of the following configured:

| File | Setting | Why |
|---|---|---|
| `vite.config.ts` | `base: process.env.VITE_BASE_PATH ?? '/'` | Assets resolve correctly on any sub-path |
| `vite.config.ts` | `resolve.alias: { '@': path.resolve(__dirname, './src') }` | `@/` imports work at Vite build time |
| `main.tsx` | `<BrowserRouter basename={import.meta.env.BASE_URL}>` | Internal links respect the base path |
| `main.tsx` | `url: import.meta.env.BASE_URL + 'mockServiceWorker.js'` | MSW Service Worker found at correct path |
| `tsconfig.json` | `"types": ["vite/client"]` | `import.meta.env` correctly typed |
| `public/` | `mockServiceWorker.js` committed | MSW SW available after `vite build` |

All of these are already in place in AppShell — they are preserved when copying the skeleton.
