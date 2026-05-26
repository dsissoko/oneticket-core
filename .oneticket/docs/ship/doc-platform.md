# Documentation Platform

## Objective

Build a modern engineering documentation platform that renders the structured Markdown documentation from `docs_path` as a static website, with preview and production deployments.

The documentation source remains independent from the rendering engine — switching the rendering engine must not require modifying `docs/`.

---

## Principles

- **Build once, deploy many** — the static site is generated once and reused for all deployments
- **Source independence** — `doc-site/` consumes `docs_path` but never modifies it
- **Engine replaceability** — replacing Astro/Starlight requires only changes in `doc-site/` and the deploy workflow
- **`doc-site/dist/` is a CI artifact** — never committed to the repository
- **DOC_SOURCE driven by `current_project`** — resolved deterministically from `config.yml`, same logic as `docs_path`
- **Multi-purpose GitHub Pages** — the same `gh-pages` branch hosts doc and app for the framework and all app projects

---

## Repository Structure

```
oneticket-core/
├── .oneticket/docs/                 ← Source docs framework (current_project empty)
├── apps/<current_project>/docs/     ← Source docs application project
│
├── doc-site/                        ← Rendering engine (Astro + Starlight)
│   ├── package.json
│   ├── astro.config.mjs             ← reads DOC_SOURCE env var (default: ../.oneticket/docs)
│   ├── tsconfig.json
│   └── src/
│       └── components/
│           └── DocFooter.astro      ← build metadata footer
│
└── .github/
    └── workflows/
        └── docs-site-github-pages.yml   ← build + preview + production deploy
```

`doc-site-static/` — generated at build time, in `.gitignore`, transmitted between CI jobs via `upload-artifact` / `download-artifact`.

---

## Technology Stack

| Component | Choice | Rationale |
|---|---|---|
| Framework | Astro | SSG, Markdown-first, fast build, component-based |
| Documentation theme | Starlight (`@astrojs/starlight`) | Responsive desktop/mobile, auto-navigation, search, dark/light theme — no custom design work |
| Diagram rendering | `rehype-mermaid` | Server-side SVG rendering at build time — supports C4 Mermaid syntax (`C4Context`, `C4Container`, `C4Component`) — no client-side JS overhead |

---

## GitHub Pages — Multi-Purpose Structure

GitHub Pages is configured to serve from the `gh-pages` branch at `/` (root).
It hosts three types of content, all coexisting under the same domain:

| Usage | Path | URL |
|---|---|---|
| Framework doc | `framework/docs/` | `https://dsissoko.github.io/oneticket-core/framework/docs/` |
| App doc | `<project>/docs/` | `https://dsissoko.github.io/oneticket-core/<project>/docs/` |
| App frontend | `<project>/app/` | `https://dsissoko.github.io/oneticket-core/<project>/app/` |

PR previews are nested under `pr/<N>/` for both doc and app:

| Usage | Path | URL |
|---|---|---|
| Framework doc preview | `framework/pr/<N>/docs/` | `https://dsissoko.github.io/oneticket-core/framework/pr/<N>/docs/` |
| App doc preview | `<project>/pr/<N>/docs/` | `https://dsissoko.github.io/oneticket-core/<project>/pr/<N>/docs/` |
| App frontend preview | `<project>/pr/<N>/app/` | `https://dsissoko.github.io/oneticket-core/<project>/pr/<N>/app/` |

The doc footer includes a link to the corresponding app URL when `current_project` is set.

### `gh-pages` branch structure

```
gh-pages/
├── framework/
│   ├── docs/              ← framework doc (prod)
│   └── pr/<N>/docs/       ← framework doc (PR preview)
├── <project>/
│   ├── docs/              ← app doc (prod)
│   ├── app/               ← app frontend (prod)
│   └── pr/<N>/
│       ├── docs/          ← app doc (PR preview)
│       └── app/           ← app frontend (PR preview)
```

---

## BASE_URL Calculation

Astro requires `base` and `site` to generate correct internal links and assets when served under a sub-path.

Both are computed in the `resolve-context` job and injected as env vars at build time:

| Variable | Local | Prod | PR Preview |
|---|---|---|---|
| `ASTRO_SITE` | `http://localhost:4321` | `https://dsissoko.github.io/oneticket-core` | `https://dsissoko.github.io/oneticket-core` |
| `ASTRO_BASE` | `` (empty) | `/<slug>/docs` | `/<slug>/pr/<N>/docs` |

Where `<slug>` = `current_project` if set, otherwise `framework`.

---

The `DOC_SOURCE` environment variable points Astro to the correct documentation source.

Resolved in the CI workflow from `current_project` via `node src/print-config.mjs current_project` — same logic as `docs_path` in `agent-dispatch.mjs`:

| `current_project` | `DOC_SOURCE` |
|---|---|
| absent or empty | config error — workflow stops |
| `oneticket-core` | `.oneticket/docs` (special convention — framework repo) |
| `breakout` (or any other) | `apps/breakout/docs` |

In local development, `astro.config.mjs` defaults to `../.oneticket/docs` — no environment variable needed.

---

## Build Footer

Every page includes a footer with build metadata. Variables injected at CI build time via `PUBLIC_*` env vars:

| Variable | Source | Displayed as |
|---|---|---|
| `PUBLIC_BUILD_NUMBER` | `${{ github.run_number }}` | `Build #142` |
| `PUBLIC_BRANCH` | `${{ github.ref_name }}` | `Branch: main` |
| `PUBLIC_TAG` | tag name or empty | `Tag: v0.1.0` (omitted if empty) |
| `PUBLIC_COMMIT_SHA` | `${{ github.sha }}` (first 7 chars) | `Commit: 3ecf683` |
| `PUBLIC_BUILD_DATE` | ISO date at build time | `2026-05-26` |
| `PUBLIC_APP_URL` | computed from slug + context | `App: https://...` (omitted if framework or empty) |

In local development, these variables are absent — the footer reads git metadata directly via `execSync` (`branch`, `commit sha`, `tag` if on an exact tag match, `build date`). No environment variables needed locally.

---

## Build Flow

```
.oneticket/docs/  (or apps/<current_project>/docs/)
        ↓
  doc-site/ (Astro + Starlight + rehype-mermaid)
        ↓
  doc-site-static/  (CI artifact — not committed)
        ↓
  GitHub Pages (preview or production)
```

---

## Workflow — `docs-site-github-pages.yml`

### Triggers

```yaml
on:
  push:
    tags:
      - 'v*'
    paths:
      - '.oneticket/docs/**'
      - 'apps/**/docs/**'
      - 'doc-site/**'
  pull_request:
    types: [opened, reopened, synchronize]
    branches: [main]
    paths:
      - '.oneticket/docs/**'
      - 'apps/**/docs/**'
      - 'doc-site/**'
```

On a tag push, GitHub Actions ignores the `paths` filter — the `tags` filter applies independently.

### Jobs

```
resolve-context
  → npm ci (required — print-config.mjs depends on js-yaml)
  → node src/print-config.mjs current_project
  → slug = current_project (e.g. oneticket-core, breakout)
  → DOC_SOURCE, ASTRO_BASE, target_folder, app_url
  → outputs: doc_source, slug, astro_base, target_folder, app_url
        ↓
build-doc-site
  → npm ci in doc-site/
  → npx playwright install chromium --with-deps
  → astro build with:
      DOC_SOURCE, ASTRO_SITE, ASTRO_BASE
      PUBLIC_BRANCH, PUBLIC_TAG, PUBLIC_COMMIT_SHA,
      PUBLIC_BUILD_NUMBER, PUBLIC_BUILD_DATE, PUBLIC_APP_URL
  → upload-artifact: doc-site/dist/
        ↓
deploy-preview    (if pull_request)
  → download-artifact
  → JamesIves/github-pages-deploy-action@v4
      token: ONETICKET_GH_PAT
      target-folder: <slug>/pr/<N>/docs
      clean: false
  → marocchino/sticky-pull-request-comment@v2
      posts preview URL on the PR
        ↓
deploy-prod       (if push main or tag v*)
  → download-artifact
  → JamesIves/github-pages-deploy-action@v4
      token: ONETICKET_GH_PAT
      target-folder: <slug>/docs
      clean: true
      clean-exclude: ["pr"]
```

### URL Conventions

| Context | URL |
|---|---|
| Framework doc prod | `https://dsissoko.github.io/oneticket-core/oneticket-core/docs/` |
| App doc prod | `https://dsissoko.github.io/oneticket-core/<project>/docs/` |
| Framework doc PR preview | `https://dsissoko.github.io/oneticket-core/oneticket-core/pr/<N>/docs/` |
| App doc PR preview | `https://dsissoko.github.io/oneticket-core/<project>/pr/<N>/docs/` |

### GitHub Pages configuration

- **Source**: `Deploy from a branch`
- **Branch**: `gh-pages`
- **Folder**: `/ (root)`

### Jekyll and `_astro/` assets

GitHub Pages activates Jekyll by default on any branch it serves. Jekyll silently ignores all directories and files starting with `_` — which includes `_astro/`, where Astro outputs all CSS and JS bundles. Without disabling Jekyll, the deployed site loads with no styles and no scripts.

**Fix:** a `.nojekyll` file at the root of `gh-pages` disables Jekyll entirely. GitHub Pages then serves all files as plain static assets, including `_astro/`.

The `.nojekyll` file is committed directly on the `gh-pages` branch and is preserved across deployments via `clean-exclude` in `JamesIves/github-pages-deploy-action`:

```yaml
clean-exclude: |
  .nojekyll
  pr
```

If `gh-pages` is ever deleted and recreated, `.nojekyll` must be re-committed on that branch manually before the next deployment triggers.

### App deploy workflow

A separate workflow `app-deploy-github-pages.yml` (to be created) handles frontend app deployment:
- triggers on `apps/<project>/app/**`
- deploys to `<slug>/app/` (prod) or `<slug>/pr/<N>/app/` (preview)
- symmetric structure to this workflow

### Preview cleanup

Not activated — PR preview directories are preserved after PR close/merge.
To activate, add `closed` to `pull_request` types and add a cleanup job using `JamesIves` with an empty folder targeting `<slug>/pr/<N>/`.

---

## Local Development

No environment variables needed locally — `astro.config.mjs` defaults to `../.oneticket/docs`.

### Prerequisites

#### Node 22

The doc site requires Node 22. On WSL with nvm:

```bash
export PATH="/home/david/.nvm/versions/node/v22.21.1/bin:$PATH"
node --version  # should print v22.x.x
```

Add the export to your `.bashrc` or `.zshrc` to make it permanent.

#### Playwright / Chromium

`rehype-mermaid` renders Mermaid diagrams to SVG at build time using a headless Chromium.
Run once per machine after `npm install`:

```bash
cd doc-site
npx playwright install chromium
```

#### First install

```bash
cd doc-site
npm install
npx playwright install chromium
```

### Dev mode

Hot reload on source changes. Search is **not available** in dev mode (Pagefind indexes only after a production build).

```bash
cd doc-site
npm run dev
# → http://localhost:4321
```

`link-docs.mjs` runs automatically before Astro starts — it copies `.oneticket/docs/` into `src/content/docs/` and regenerates it clean on every run.

To expose the dev server on the local network (e.g. access from Windows when running in WSL):

```bash
npm run dev -- --host 0.0.0.0
```

### Production build + preview

Full static build with Pagefind search index and Mermaid SVG rendering.

```bash
cd doc-site
npm run build    # generates dist/
npm run preview  # serves dist/ at http://localhost:4321
```

Use `build + preview` to validate:
- search (Pagefind)
- Mermaid C4 diagram rendering (rehype-mermaid + Chromium)
- footer git metadata (branch, commit, tag)
- sidebar order and collapsed state

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Search is only available in production builds` | Normal in dev mode | Run `npm run build && npm run preview` |
| `Duplicate id` warnings in dev | Stale Astro watch state after file changes | Stop dev server, restart `npm run dev` |
| Mermaid diagrams not rendered | Playwright/Chromium not installed | `npx playwright install chromium` |
| `engines` error on npm install | Wrong Node version | `export PATH="/home/david/.nvm/versions/node/v22.21.1/bin:$PATH"` |
| `src/content/docs/` missing | Normal — gitignored | `npm run dev` or `npm run build` regenerates it automatically |

---

## `.gitignore` additions

```
doc-site/dist/
doc-site/.astro/
doc-site/.docs-generated/
doc-site/src/content/docs/
doc-site/src/content/docs-generated/
doc-site/node_modules/
```

---

## Future — Deployment Target Swap

To deploy to Vercel, Netlify, or Cloudflare Pages instead of GitHub Pages:

1. Duplicate `docs-site-github-pages.yml` → `docs-site-vercel.yml`
2. Replace `deploy-doc-preview` and `deploy-doc-prod` jobs with the target platform's deploy action
3. The `build-doc-site` job is unchanged — artifact is reused

The `doc-site/` rendering engine and `docs/` source are never touched.

---

## Markdown Authoring Constraints

### Starlight frontmatter requirement

Starlight requires a `title` field in the frontmatter of every Markdown file. Without it, the build fails with `InvalidContentEntryDataError`.

**Every documentation file must start with:**

```markdown
---
title: 'Your Page Title'
---
```

**Impact on portability:** this is a constraint introduced by the rendering engine, not by the OneTicket documentation model. The source `docs/` files are coupled to Starlight as long as this engine is in use.

**Mitigation options:**

| Option | Trade-off |
|---|---|
| Keep `title:` in frontmatter | Slight coupling to Starlight — acceptable as long as Starlight is the engine |
| Extend `docsSchema()` to make `title` optional | More complex config, title falls back to filename — less readable sidebar |
| Generate frontmatter at build time via `link-docs.mjs` | Keeps source files clean, adds build-time complexity |

**Current choice:** `title:` is present in all documentation files — added once, maintained by authors and agents.

**Agent rule:** any skill or agent that creates a new documentation file must include a `title:` frontmatter field. This must be enforced in `oneticket-doc-structure` skill.

---

### `link-docs.mjs` — copy and transform mechanism

Starlight expects its content in `src/content/docs/`. `link-docs.mjs` performs a clean copy of `DOC_SOURCE` into `src/content/docs/` with the following transformations:

- `README.md` → `index.md` (Starlight uses `index.md` as directory root page)
- Frontmatter `title:` injected from first H1 — H1 removed from body to avoid duplication
- `index.md` auto-generated for directories without one (TOC of files and subdirs)

`src/content/docs/` is gitignored — always regenerated before `dev` and `build` via the npm scripts.

**In CI:** `DOC_SOURCE` is set from `current_project` before calling `npm run build` — the correct project docs are copied and transformed automatically.

---

## Open Questions

| # | Question |
|---|---|
| 1 | Should PR preview cleanup be activated by default or remain opt-in? |
| 2 | Should Starlight theme colors be customized to match a OneTicket brand? |
| 3 | Which Starlight plugins to activate — `starlight-mermaid`, `starlight-versions`, `starlight-openapi`? |
| 4 | Should `title:` frontmatter be generated at build time to keep source files engine-agnostic? |
