---
title: Ship — AppShell Build & CI/CD
---

# Ship — AppShell Build & CI/CD

The `ship/` section describes how AppShell artifacts are built, validated, and delivered.

## Build Pipeline

AppShell uses **Vite** for fast development and optimized production builds.

### Development Build
```bash
npm run dev
```
Runs the dev server with hot module reloading (HMR).

### Production Build
```bash
npm run build
```
Generates optimized artifacts for deployment:
- Tree-shaken JavaScript bundles
- Minified CSS
- Source maps for debugging
- Output: `dist/` directory

## CI/CD Workflow

### GitHub Actions: docs-site-github-pages.yml

**Trigger:** Push to `main` branch

**Pipeline steps:**
1. Checkout source code
2. Install dependencies (`npm ci`)
3. Run build (`npm run build`)
4. Deploy to GitHub Pages

**Artifacts:** Static site published to GitHub Pages

## Versioning & Release

Releases follow the `release-please` automation configured in `release-please-config.json`.

See `.github/workflows/` for active CI/CD workflows.
