---
title: Run
---

# Run — AppShell Operations

The `run/` section describes how AppShell operates in runtime environments.

## Deployment

AppShell documentation and application artifacts are automatically deployed via the **`docs-site-github-pages.yml`** GitHub Actions workflow.

### Automatic Deployment Flow

- **Trigger:** Changes to `apps/appshell/docs/**` or `apps/appshell/app/**`
- **Build:** Generates static documentation site and application bundles
- **Preview:** Deploys preview on pull requests
- **Production:** Deploys to main branch at `https://dsissoko.github.io/oneticket-core/appshell/`

### Deployment Steps

1. Context resolution detects changes in AppShell paths
2. Documentation site builds via Astro from `apps/appshell/docs/`
3. Application artifacts build from `apps/appshell/app/` with `VITE_BASE_PATH=/oneticket-core/appshell/app/`
4. Artifacts upload to GitHub Pages with branch-specific folder structure
5. Preview comments post automatically on pull requests

## Operational Procedures

See **[appshell-reuse.md](./appshell-reuse.md)** for detailed operational runbooks and procedures.

## References

- Workflow definition: `.github/workflows/docs-site-github-pages.yml`
- Documentation root: `apps/appshell/docs/`
- Application root: `apps/appshell/app/`
