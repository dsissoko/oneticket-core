# AppShell — Ship

## CI/CD Pipeline

AppShell uses GitHub Actions for build and deployment. The workflow `docs-site-github-pages.yml` handles both the app and the documentation site.

### Workflow Jobs

| Job | Trigger | Output |
|---|---|---|
| `resolve-context` | Every PR + push to `main` | Computes `VITE_BASE_PATH`, `app_target_folder`, `doc_source` |
| `build-app` | When `apps/appshell/app/**` changes | `dist/` artifact uploaded |
| `build-doc-site` | When `apps/appshell/docs/**` changes | Starlight static site artifact |
| `deploy-preview` | PR opened/updated | App + docs deployed to PR preview URL |
| `deploy-prod` | Push to `main` | App + docs deployed to production URL |

### Deployment URLs

| Environment | App | Docs |
|---|---|---|
| PR Preview | `https://dsissoko.github.io/oneticket-core/appshell/pr/{N}/app/` | `https://dsissoko.github.io/oneticket-core/appshell/pr/{N}/docs/` |
| Production | `https://dsissoko.github.io/oneticket-core/appshell/app/` | `https://dsissoko.github.io/oneticket-core/appshell/docs/` |

---

## Environment Variables — Injected by CI

| Variable | Value in CI | Description |
|---|---|---|
| `VITE_BASE_PATH` | `/oneticket-core/appshell/pr/{N}/app/` or `/oneticket-core/appshell/app/` | Sub-path for GitHub Pages — mandatory |
| `VITE_LOG_LEVEL` | `debug` | Logger level — all logs visible in browser console |
| `VITE_OTLP_ENDPOINT` | _(empty)_ | Remote log endpoint — not configured |

---

## Build Commands

```bash
# Install dependencies
npm ci

# Build for production (CI injects VITE_BASE_PATH)
npm run build

# Build locally (no sub-path)
VITE_BASE_PATH=/ npm run build
```

---

## Critical Configuration for Sub-path Deployments

Any app derived from AppShell deployed to a sub-path (GitHub Pages, reverse proxy) must have:

| File | Setting | Why |
|---|---|---|
| `vite.config.ts` | `base: process.env.VITE_BASE_PATH ?? '/'` | Assets resolve correctly |
| `vite.config.ts` | `resolve.alias: { '@': path.resolve(__dirname, './src') }` | `@/` imports work at build time |
| `main.tsx` | `<BrowserRouter basename={import.meta.env.BASE_URL}>` | Internal links resolve correctly |
| `main.tsx` | `url: import.meta.env.BASE_URL + 'mockServiceWorker.js'` | MSW SW found at correct path |
| `tsconfig.json` | `"types": ["vite/client"]` | `import.meta.env` typed |
| `public/` | `mockServiceWorker.js` committed | MSW SW available at build time |
