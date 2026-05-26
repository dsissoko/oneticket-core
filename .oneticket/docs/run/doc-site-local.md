# Local Doc Site Runbook

How to run, build, and preview the documentation site on a local machine.

## Prerequisites

### Node 22

The doc site requires Node 22. On WSL with nvm:

```bash
export PATH="/home/david/.nvm/versions/node/v22.21.1/bin:$PATH"
node --version  # should print v22.x.x
```

Add the export to your `.bashrc` or `.zshrc` to make it permanent.

### Playwright / Chromium

`rehype-mermaid` renders Mermaid diagrams to SVG at build time using a headless Chromium.
Run once per machine after `npm install`:

```bash
cd doc-site
npx playwright install chromium
```

### First install

```bash
cd doc-site
npm install
npx playwright install chromium
```

---

## Dev mode

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

---

## Production build + preview

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

---

## How it works

```
.oneticket/docs/  (source)
      ↓
link-docs.mjs  (copy + transform)
      ↓
doc-site/src/content/docs/  (gitignored — regenerated every run)
      ↓
Astro + Starlight + rehype-mermaid
      ↓
dist/  (static site)
```

`link-docs.mjs` transformations:
- `README.md` → `index.md`
- H1 extracted as `title:` frontmatter, removed from body
- `index.md` auto-generated for directories without a README

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Search is only available in production builds` | Normal in dev mode | Run `npm run build && npm run preview` |
| `Duplicate id` warnings in dev | Stale Astro watch state after file changes | Stop dev server, restart `npm run dev` |
| Mermaid diagrams not rendered | Playwright/Chromium not installed | `npx playwright install chromium` |
| `engines` error on npm install | Wrong Node version | `export PATH="/home/david/.nvm/versions/node/v22.21.1/bin:$PATH"` |
| `src/content/docs/` missing | Normal — gitignored | `npm run dev` or `npm run build` regenerates it automatically |
