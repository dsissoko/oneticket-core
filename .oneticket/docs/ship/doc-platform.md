# Documentation Platform

## Objective

Build a modern engineering documentation platform that renders the structured Markdown documentation from `docs_path` as a static website, with preview and production deployments.

The documentation source remains independent from the rendering engine — switching the rendering engine must not require modifying `docs/`.

---

## Principles

- **Build once, deploy many** — the static site is generated once and reused for all deployments
- **Source independence** — `doc-site/` consumes `docs_path` but never modifies it
- **Engine replaceability** — replacing Astro/Starlight requires only changes in `doc-site/` and the deploy workflow
- **`doc-site-static/` is a CI artifact** — never committed to the repository
- **DOC_SOURCE driven by `current_project`** — resolved deterministically from `config.yml`, same logic as `docs_path`

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

## DOC_SOURCE Resolution

The `DOC_SOURCE` environment variable points Astro to the correct documentation source.

Resolved in the CI workflow from `current_project` via `node src/print-config.mjs current_project` — same logic as `docs_path` in `agent-dispatch.mjs`:

| `current_project` | `DOC_SOURCE` |
|---|---|
| empty | `.oneticket/docs` |
| `breakout` | `apps/breakout/docs` |

In local development, `astro.config.mjs` defaults to `../.oneticket/docs` — no environment variable needed:

```js
const docSource = process.env.DOC_SOURCE || '../.oneticket/docs'
```

---

## Build Footer

Every page includes a footer with build metadata injected at CI build time via `PUBLIC_*` environment variables:

| Variable | Source | Displayed as |
|---|---|---|
| `PUBLIC_BUILD_NUMBER` | `${{ github.run_number }}` | `Build #142` |
| `PUBLIC_BRANCH` | `${{ github.ref_name }}` | `Branch: main` |
| `PUBLIC_TAG` | tag name or empty | `Tag: v0.1.0` (omitted if empty) |
| `PUBLIC_COMMIT_SHA` | `${{ github.sha }}` (first 7 chars) | `Commit: 3ecf683` |
| `PUBLIC_BUILD_DATE` | ISO date at build time | `2026-05-26` |

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
    branches-ignore: [gh-pages]
    paths: ['.oneticket/docs/**', 'apps/**/docs/**', 'doc-site/**']
  pull_request:
    types: [opened, reopened, synchronize]
    branches: [main]
    paths: ['.oneticket/docs/**', 'apps/**/docs/**', 'doc-site/**']
  push:
    tags: ['v*']
```

### Jobs

```
resolve-doc-source
  → node src/print-config.mjs current_project
  → output: DOC_SOURCE, PROJECT_NAME
        ↓
build-doc-site
  → npm ci in doc-site/
  → astro build
  → inject PUBLIC_BUILD_NUMBER, PUBLIC_BRANCH, PUBLIC_TAG, PUBLIC_COMMIT_SHA, PUBLIC_BUILD_DATE
  → baseURL: production or preview
  → upload-artifact: doc-site-static/
        ↓
deploy-doc-preview    (if pull_request)
  → download-artifact
  → JamesIves/github-pages-deploy-action@v4
      target-folder: <project>/pr/<N>/docs
  → marocchino/sticky-pull-request-comment@v2
      posts preview URL on the PR
        ↓
deploy-doc-prod       (if push main or tag v*)
  → download-artifact
  → JamesIves/github-pages-deploy-action@v4
      target-folder: <project>/docs
      clean: true
      clean-exclude: [pr]
```

### URL Conventions

| Context | URL |
|---|---|
| Production | `https://<owner>.github.io/<repo>/<project>/docs/` |
| PR Preview | `https://<owner>.github.io/<repo>/<project>/pr/<N>/docs/` |

### baseURL at build time

```
Production : https://<owner>.github.io/<repo>/<project>/docs/
Preview    : /<repo>/<project>/pr/<N>/docs/
```

### Preview cleanup (optional)

Commented in the workflow — activate by adding `closed` to `pull_request` types:

```yaml
# - name: Cleanup PR Preview
#   uses: JamesIves/github-pages-deploy-action@v4
#   with:
#     folder: /tmp/empty
#     target-folder: <project>/pr/<N>
#     clean: true
```

---

## Local Development

```bash
cd doc-site
npm install
npm run dev      # → http://localhost:4321 — hot reload on docs/ changes
npm run build    # → validates static build
npm run preview  # → serves doc-site-static/ locally
```

No environment variables needed locally — `astro.config.mjs` defaults to `../.oneticket/docs`.

---

## `.gitignore` additions

```
doc-site-static/
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
