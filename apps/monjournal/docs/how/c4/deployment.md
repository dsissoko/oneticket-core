---
title: MonJournal Deployment
---

# MonJournal Deployment Architecture

This diagram illustrates how MonJournal is deployed and runs in the user's browser. MonJournal is a static single-page application (SPA) with no backend services—all data persists locally in the browser's localStorage.

## C4 Deployment Diagram

```mermaid
C4Deployment
  title MonJournal - Deployment Diagram

  Deployment_Node(user_device, "User's Computer / Device", "") {
    Deployment_Node(browser, "Web Browser", "Chrome, Firefox, Safari, Edge") {
      Container(spa, "MonJournal SPA", "React + TypeScript + Vite", "Static HTML, CSS, JavaScript bundle")
      ContainerDb(localstorage, "Browser localStorage", "Key-Value Store", "Persists thoughts: monjournal_thoughts")
    }
  }

  Deployment_Node(hosting, "Static File Hosting", "GitHub Pages, Netlify, Vercel, or any CDN") {
    Deployment_Node(build_output, "Build Output", "") {
      Container(html, "index.html", "Static File", "Entry point for the SPA")
      Container(js, "main.*.js", "Static File", "Bundled React + app logic (from Vite build)")
      Container(css, "style.*.css", "Static File", "Stylesheet bundle")
    }
  }

  Rel(browser, build_output, "Downloads", "HTTPS")
  Rel(spa, localstorage, "Reads/Writes", "JavaScript API")
```

## Deployment Overview

### Static File Hosting
MonJournal is built by Vite into a static output directory containing only HTML, CSS, and JavaScript files. No backend services, databases, or server-side rendering are required. The entire application runs in the user's browser.

**Hosting Options**:
- GitHub Pages (free, recommended for open source)
- Netlify (free tier available)
- Vercel (free tier available)
- Any static web server (Apache, nginx, AWS S3 + CloudFront)

### Browser Runtime
The SPA loads in the user's web browser and executes entirely client-side:
- Fetches static assets from the hosting provider via HTTPS
- Renders the React UI
- Manages all application state in memory
- Persists data to browser localStorage (no network calls needed)

### Data Persistence
All user thoughts are stored in the browser's **localStorage** API under the key `monjournal_thoughts`. This provides:
- **Single-device storage** — no cloud sync or multi-device access
- **Data privacy** — zero data transmitted to servers
- **Persistent across sessions** — data survives browser restarts until user clears local data
- **No authentication** — single-user per browser profile

### Build & Deployment Workflow

1. **Development**: `npm run dev` — Vite dev server with hot reload
2. **Build**: `npm run build` — Vite produces optimized static output
3. **Preview**: `npm run preview` — Local testing of production build
4. **Deploy**: Push built output to static hosting (automated via GitHub Actions / CI)

### Browser Requirements
MonJournal requires:
- Modern web browser with ES2020+ JavaScript support
- localStorage API enabled (standard in all modern browsers)
- No special permissions or plugins needed

## Related Documentation

For more details on the technology stack and architecture decisions, see [architecture.md](../architecture.md#14-deployment--build).
