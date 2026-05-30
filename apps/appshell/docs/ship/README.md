# AppShell — Ship

This section describes how AppShell is built, packaged, and delivered.

## CI/CD

AppShell is built and deployed automatically via GitHub Actions:

- **`docs-site-github-pages.yml`** — builds the app and deploys to GitHub Pages on every PR and push to `main`
- **Build:** `tsc && vite build` with `VITE_BASE_PATH` injected by CI
- **Preview:** `https://dsissoko.github.io/oneticket-core/appshell/pr/{PR}/app/`
- **Production:** `https://dsissoko.github.io/oneticket-core/appshell/app/`

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_BASE_PATH` | `/` | Base path for GitHub Pages sub-directory deployment |
| `VITE_LOG_LEVEL` | `debug` | Logger level — `debug \| info \| warn \| error \| silent` |
| `VITE_OTLP_ENDPOINT` | _(empty)_ | Remote log endpoint — empty = console only |
| `VITE_APP_NAME` | `AppShell` | Application name |
