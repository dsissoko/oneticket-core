# Deployment Diagram — Journal Personnel

## Overview
Journal Personnel is deployed as a static SPA on GitHub Pages. The build process runs on GitHub Actions, producing a small bundle optimized for browser delivery. No backend servers, databases, or infrastructure are required.

## Diagram

```mermaid
C4Deployment
  title Deployment Diagram — Journal Personnel

  Deployment_Node(browser, "End User Browser", "Chrome, Firefox, Safari, Edge") {
    Container(spa, "Journal Personnel SPA", "HTML + JavaScript + CSS", "React app bundle (~500 KB gzipped)")
    ContainerDb(localStorage, "Browser localStorage", "localStorage API", "journal_entries, journal_theme")
  }

  Deployment_Node(github, "GitHub Platform", "GitHub Inc.") {
    Deployment_Node(pages, "GitHub Pages", "Static Web Hosting") {
      Container(dist, "Static Files", "HTML, JS, CSS, Assets", "dist/ folder from Vite build")
    }

    Deployment_Node(actions, "GitHub Actions", "CI/CD") {
      Container(build, "Build Job", "Node.js + Vite", "npm install → npm run build")
      Container(deploy, "Deploy Job", "GitHub CLI", "Deploy dist/ to gh-pages branch")
    }

    Deployment_Node(repo, "Repository", "Git") {
      Container(code, "Source Code", "TypeScript + React", "apps/monjournal/src/")
      Container(config, "Config Files", "JSON, YAML", "vite.config.ts, package.json, .github/workflows/")
    }
  }

  Deployment_Node(dev, "Developer Machine", "Local Environment") {
    Container(editor, "Code Editor", "VS Code", "Write source code")
    Container(npm, "npm CLI", "Node.js", "npm install, npm run dev")
  }

  Rel(browser, pages, "Fetches SPA", "HTTPS")
  Rel(spa, localStorage, "Reads/writes entries", "localStorage API")
  Rel(code, build, "Source triggers")
  Rel(build, config, "Reads config from")
  Rel(build, dist, "Produces")
  Rel(dist, pages, "Deployed to")
  Rel(pages, browser, "Serves via HTTPS")
  Rel(deploy, pages, "Pushes bundle to")
  Rel(dev, repo, "Pushes commits to")
  Rel(actions, code, "Triggers on push")
  Rel(actions, build, "Runs build job")
  Rel(actions, deploy, "Runs deploy job")
```

## Deployment Nodes

### End User Browser
**Type** : Client execution environment  
**OS** : Windows, macOS, Linux  
**Browsers** : Chrome 100+, Firefox 100+, Safari 15+, Edge 100+  
**Runtime** : JavaScript ES2020+, Web APIs (localStorage, fetch, crypto)  
**Capacity** : localStorage quota ~5–10 MB per domain

**Containers** :
- **Journal Personnel SPA** : The built and bundled React application
  - Total size : < 500 KB gzipped
  - Assets : HTML entry point, JavaScript bundle, CSS, fonts
  - Execution : In-browser JavaScript engine
  - No service workers, no offline caching (MVP)

- **Browser localStorage** : Local data persistence
  - `journal_entries` : JSON array of entries
  - `journal_theme` : User's theme preference
  - Lifecycle : Persists across sessions, cleared only by user

### GitHub Pages
**Type** : Static web hosting  
**Provider** : GitHub (part of GitHub.com platform)  
**Endpoint** : `https://{username}.github.io/journal-personnel/`  
**Deployment** : From `gh-pages` branch or `main` branch + `/docs` directory  
**Certificate** : HTTPS automatically enabled, managed by GitHub  
**CDN** : GitHub Pages backed by Fastly CDN  
**Performance** : Global edge caching, low latency

**Contents** :
- `index.html` : SPA entry point
- `app.js` : Main React bundle (minified)
- `styles.css` : Primer CSS variables and global styles (minified)
- `assets/` : Fonts, icons (if any)

### GitHub Actions Workflow
**Trigger** : Push to `main` branch  
**Jobs** :
1. **Install** : Clone repo, `npm install` dependencies
2. **Build** : `npm run build` via Vite
   - Input : `apps/monjournal/src/`
   - Config : `vite.config.ts`
   - Output : `dist/` folder (HTML, JS, CSS, assets)
   - Optimization : Minification, tree-shaking, code-splitting
3. **Test** (optional) : Run unit tests, E2E tests (phase 2)
4. **Deploy** : Push `dist/` contents to `gh-pages` branch
   - Tool : `peaceiris/actions-gh-pages@v3` or similar
   - Branch : `gh-pages` (dedicated deployment branch)
   - Trigger GitHub Pages rebuild

**Duration** : ~2–3 minutes per workflow run  
**Cost** : Free for public repos (included in GitHub free tier)

### Repository
**Platform** : GitHub  
**Visibility** : Public (for GitHub Pages to work)  
**Structure** :
```
monjournal/
├── src/
│   ├── components/      # React UI components
│   ├── hooks/           # Custom hooks (business logic)
│   ├── domain/          # Domain entities and services
│   ├── infrastructure/  # Repository, utilities
│   ├── styles/          # Global styles, theme
│   └── App.tsx          # Root component
├── docs/                # Documentation (Astro Starlight)
│   ├── what/            # Product specs, epics, user stories
│   ├── how/             # Architecture, C4, slices
│   └── astro.config.ts  # Starlight configuration
├── vite.config.ts       # Vite build configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies and scripts
└── .github/workflows/   # GitHub Actions workflows
    └── deploy.yml       # Build and deploy workflow
```

**Key files** :
- `package.json` : React 18, Vite, TypeScript, Primer React, testing libs
- `vite.config.ts` : Base path, build target (ES2020), output directory
- `.github/workflows/deploy.yml` : CI/CD pipeline definition
- `tsconfig.json` : `strict: true`, no implicit `any`

### Developer Machine
**Environment** : Local development  
**Tools** :
- **Code Editor** : VS Code (with Vite/React extensions)
- **Node.js** : LTS (18+)
- **npm** : 8+
- **Git** : 2.30+

**Workflow** :
1. Clone repo : `git clone https://github.com/{username}/journal-personnel.git`
2. Install deps : `cd apps/monjournal && npm install`
3. Start dev server : `npm run dev` (Vite HMR)
4. Write code in `src/`
5. Test locally at `http://localhost:5173/`
6. Commit and push to trigger GitHub Actions

## Deployment Pipeline

### Step 1: Developer Push
```
Developer writes code
  ↓
git add && git commit && git push origin main
  ↓
GitHub detects push
```

### Step 2: GitHub Actions Trigger
```
Workflow: deploy.yml triggered
  ↓
Runner: Ubuntu latest
  ↓
Node.js 18 environment
```

### Step 3: Build
```
npm install
  ↓
npm run build (Vite)
  ↓
Vite compiles TypeScript → JavaScript
  ↓
Tree-shake unused code
  ↓
Minify and compress
  ↓
Output: dist/ folder
```

### Step 4: Deploy
```
Copy dist/ contents to gh-pages branch
  ↓
GitHub Pages detects update
  ↓
Publish to https://{username}.github.io/journal-personnel/
  ↓
CDN caches content
```

### Step 5: User Access
```
User opens browser
  ↓
Request: https://{username}.github.io/journal-personnel/
  ↓
GitHub Pages serves index.html + bundle
  ↓
Browser executes JavaScript
  ↓
React renders UI
  ↓
localStorage API initialized
```

## Build Configuration (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/journal-personnel/',  // GitHub Pages path
  build: {
    target: 'ES2020',
    outDir: 'dist',
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendors': ['react', 'react-dom'],
          'primer-ui': ['@primer/react', '@primer/primitives'],
        }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false,
  }
})
```

**Key settings** :
- **base** : `/journal-personnel/` (adjust if custom domain)
- **target** : ES2020 (modern browsers only)
- **minify** : Terser for smaller bundles
- **cssCodeSplit** : Extract CSS to separate files
- **manualChunks** : Optimize caching, separate vendor bundles

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",                           // Local dev server with HMR
    "build": "tsc && vite build",           // Compile TypeScript, build bundle
    "preview": "vite preview",              // Preview production build locally
    "test": "vitest",                       // Unit tests
    "test:e2e": "playwright test",          // E2E tests (phase 2)
    "lint": "eslint src/",                  // Code linting
    "type-check": "tsc --noEmit"           // Type checking without emit
  }
}
```

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Page load | < 2s | On 4G, including app execution |
| Bundle size (gzipped) | < 500 KB | React + Primer + app code |
| Time to interactive | < 3s | User can interact with UI |
| Lighthouse score | > 90 | Performance, accessibility, best practices |

## Security & CDN

**GitHub Pages Security** :
- HTTPS enforced automatically
- Secure headers set by GitHub
- DDoS protection via Fastly CDN
- No user input validation needed (static site)

**Content Delivery** :
- **CDN** : Fastly (GitHub's CDN provider)
- **Caching** : Immutable assets cached indefinitely (with hash)
- **Invalidation** : Automatic on branch update

**User Data** :
- All data stored in browser localStorage
- No data sent to servers
- No analytics, tracking, or telemetry (MVP)
- User has full control of their data

## Monitoring & Observability

**MVP (Phase 1)** :
- Browser console logs (development only)
- Manual testing via Lighthouse
- GitHub Actions workflow logs for build issues

**Phase 2** :
- Application error logging (localStorage circular buffer)
- Sentry integration for crash reporting
- Web Vitals monitoring
- Analytics (opt-in for user insights)

## Failure Modes & Recovery

| Failure | Impact | Recovery |
|---------|--------|----------|
| Build fails | Deployment blocked | Check CI logs, fix code, retry push |
| Deploy fails | Old version remains live | Check GitHub Actions, retry deploy |
| localStorage corrupted | Data loss | User clears cache, starts fresh |
| Browser outdated | UI may not render | User updates browser |
| GitHub down | Site unavailable | Wait for GitHub recovery (rare) |

## Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| GitHub repo | Free | Public repository included |
| GitHub Pages | Free | Included for public repos |
| GitHub Actions | Free | 2000 minutes/month free tier |
| Domain (optional) | $10–20/year | CNAME to custom domain |
| **Total** | **$0–20/year** | Minimal or free depending on domain |

