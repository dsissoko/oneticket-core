# AppShell Skeleton Runbook

## Goal

Step-by-step guide to copy AppShell to a new project, adapting configuration, paths, and branding for your application.

---

## Prerequisites

- Node.js 18+ (recommend 20 LTS)
- npm 9+
- Basic familiarity with React, TypeScript, Vite, and Tailwind CSS
- A new Git repository or existing project to scaffold into

---

## Phase 1: Project Setup

### Step 1.1 — Copy AppShell Files

Copy the AppShell application directory to your new project:

```bash
# From oneticket-core monorepo
cp -r apps/appshell/app /path/to/new-project/

# Or manually copy:
# - All files from apps/appshell/app/src/ to new-project/src/
# - vite.config.ts, tailwind.config.ts, tsconfig.json
# - package.json (adapt versions as needed)
# - index.html, postcss.config.js
```

### Step 1.2 — Update package.json

Edit `/path/to/new-project/package.json`:

**Change project name and version:**
```json
{
  "name": "my-awesome-app",     // Change from "appshell" to your project name
  "version": "0.1.0",            // Reset to 0.1.0 for new projects
  "type": "module"               // Keep as is
}
```

**Verify dependencies match the latest stable versions:**
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.28.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0"
  }
}
```

### Step 1.3 — Install Dependencies

```bash
cd /path/to/new-project
npm install
```

### Step 1.4 — Verify Setup Works

```bash
# Start dev server
npm run dev

# Open http://localhost:5173 in browser
# You should see: AppShell welcome page
```

---

## Phase 2: Configuration & Branding

### Step 2.1 — Update index.html

Edit `index.html` to match your project:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Awesome App</title>  <!-- Change from "AppShell" -->
    <meta name="description" content="Your app description" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

### Step 2.2 — Update Tailwind Design Tokens

Edit `tailwind.config.ts` to customize colors, spacing, and fonts for your brand:

```typescript
// tailwind.config.ts
const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#your-brand-color',      // Example: #0366d6
        secondary: '#your-secondary',      // Example: #6f42c1
        accent: '#your-accent',            // Example: #28a745
        destructive: '#your-error-color',  // Example: #d73a49
        muted: '#your-muted-color',        // Example: #6a737d
        background: '#ffffff',
        foreground: '#24292e',
      },
      // Add custom spacing if needed
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      fontFamily: {
        sans: 'system-ui, -apple-system, sans-serif',  // Or your custom font
      },
    },
  },
  plugins: [],
};
```

Example: To use your brand's blue instead of GitHub's:
```diff
- primary: '#0366d6',        // GitHub blue
+ primary: '#007bff',        // Bootstrap blue (example)
```

### Step 2.3 — Update API Endpoints

Edit `src/api/endpoints.ts` to point to your backend API:

```typescript
// src/api/endpoints.ts
export const endpoints = {
  users: {
    // In development, MSW intercepts these
    // In production, replace VITE_API_URL with real backend
    list: () => `${API_BASE_URL}/users`,
    detail: (id: string) => `${API_BASE_URL}/users/${id}`,
    create: () => `${API_BASE_URL}/users`,
    update: (id: string) => `${API_BASE_URL}/users/${id}`,
    delete: (id: string) => `${API_BASE_URL}/users/${id}`,
  },
  auth: {
    login: () => `${API_BASE_URL}/auth/login`,
    logout: () => `${API_BASE_URL}/auth/logout`,
  },
};
```

### Step 2.4 — Update Header Navigation

Edit `src/components/layout/Header.tsx` to customize logo and navigation links:

**Example: Change logo and add custom links**
```bash
# Don't modify the locked Header.tsx directly!
# Instead, update the default props passed where Header is used in AppLayout
# Or create a wrapper component
```

Edit `src/components/layout/AppLayout.tsx` (or create a theme wrapper):
```typescript
<Header 
  logo="My App" 
  navLinks={[
    { label: 'Dashboard', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Settings', href: '/settings' },
  ]}
/>
```

### Step 2.5 — Update Footer

Edit `src/components/layout/Footer.tsx` props:

```typescript
// In AppLayout or a wrapper component
<Footer 
  copyright="© 2026 My Company"
  links={[
    { label: 'Documentation', href: '/docs' },
    { label: 'GitHub', href: 'https://github.com/myorg/myapp' },
    { label: 'Support', href: '/support' },
  ]}
/>
```

---

## Phase 3: Pages & Routes

### Step 3.1 — Update HomePage

Replace `src/pages/HomePage.tsx` with your app's landing page:

```typescript
// src/pages/HomePage.tsx
import React from 'react';

export function HomePage(): React.ReactElement {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Welcome to My App</h1>
      <p className="text-lg text-gray-600 mb-8">
        Your app description goes here.
      </p>
      {/* Your custom content */}
    </div>
  );
}

HomePage.displayName = 'HomePage';
```

### Step 3.2 — Add New Pages

Create new page files in `src/pages/`:

```typescript
// src/pages/ProductsPage.tsx
import React from 'react';

export function ProductsPage(): React.ReactElement {
  return (
    <div>
      <h1>Products</h1>
      {/* Your products list */}
    </div>
  );
}

ProductsPage.displayName = 'ProductsPage';
```

### Step 3.3 — Register Routes

Update `src/index.tsx` to add your new routes:

```typescript
const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },
];
```

---

## Phase 4: API Integration

### Step 4.1 — Define API Endpoints

Add your API endpoints to `src/api/endpoints.ts`:

```typescript
export const endpoints = {
  users: { /* ... */ },
  products: {
    list: () => `${API_BASE_URL}/products`,
    detail: (id: string) => `${API_BASE_URL}/products/${id}`,
  },
};
```

### Step 4.2 — Define Types

Add request/response types to `src/api/types.ts`:

```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface GetProductsResponse {
  data: Product[];
  total: number;
}
```

### Step 4.3 — Create MSW Handlers

Add mock handlers to `src/api/mocks.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import { endpoints } from './endpoints';

export const handlers = [
  // GET /api/products
  http.get(endpoints.products.list(), () => {
    return HttpResponse.json({
      data: [
        { id: '1', name: 'Product A', price: 99.99 },
        { id: '2', name: 'Product B', price: 149.99 },
      ],
      total: 2,
    });
  }),
  // ... add more handlers
];
```

### Step 4.4 — Toggle MSW on/off

MSW activation is controlled by a single boolean in `vite.config.ts`, independent of the build environment:

```typescript
// vite.config.ts
define: {
  __ENABLE_MSW__: true,  // ← set to false when connecting a real backend
}
```

- `true` → MSW intercepts all API calls (demo, preview, GitHub Pages, no-backend mode)
- `false` → requests go to the real backend, MSW bundle is tree-shaken out

**Do not use `import.meta.env.DEV`** to gate MSW — it would disable mocks on GitHub Pages preview where there is no backend.

To generate or update `mockServiceWorker.js` (required once, must be committed):

```bash
npx msw init public/
git add public/mockServiceWorker.js
```

### Step 4.5 — Create Custom Hooks

Create React Query hooks for your data:

```typescript
// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { GetProductsResponse } from '../api/types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient<GetProductsResponse>(
        endpoints.products.list()
      );
      return response.data;
    },
  });
}
```

---

## Phase 5: State Management

### Step 5.1 — Create Zustand Stores

Create state stores for local app state:

```typescript
// src/stores/myStore.ts
import { create } from 'zustand';

export const useMyStore = create((set) => ({
  feature1Enabled: true,
  toggleFeature: () => set((state) => ({ 
    feature1Enabled: !state.feature1Enabled 
  })),
}));
```

### Step 5.2 — Use Stores in Components

```typescript
// src/components/MyComponent.tsx
import { useMyStore } from '../stores/myStore';

export function MyComponent() {
  const { feature1Enabled, toggleFeature } = useMyStore();
  
  return (
    <button onClick={toggleFeature}>
      Feature: {feature1Enabled ? 'ON' : 'OFF'}
    </button>
  );
}
```

---

## Phase 6: Documentation

### Step 6.1 — Update Architecture Documentation

Create `docs/how/architecture.md` specific to your project:

```markdown
# Architecture — My Awesome App

## System Overview

My Awesome App is a React SPA that manages [your domain].

## Key Boundaries

- **Frontend**: React + Vite SPA
- **API**: REST API at VITE_API_URL
- **State**: Zustand (local), React Query (server)
- **Styling**: Tailwind CSS with custom design tokens

## Data Flow

[Your specific data flows]

## File Structure

[Your specific structure]
```

### Step 6.2 — Update Product Specification

Create `docs/what/product-spec.md`:

```markdown
# Product Specification — My Awesome App

## Vision

[Your product vision]

## Target Users

[Who will use this app]

## Success Metrics

- [Metric 1]
- [Metric 2]
- [Metric 3]

## Features (MVP)

- [Feature 1]
- [Feature 2]
```

### Step 6.3 — Create Runbook Variant

Create `.oneticket/runbooks/my-app-skeleton.md` adapted from this template.

---

## Phase 7: Validation & Testing

### Step 7.1 — Run Build

```bash
npm run build

# Should output:
# ✓ tsc (TypeScript compilation)
# ✓ vite build (bundling)
# ✓ Output: dist/
```

If errors occur:
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all imports have correct paths
- Ensure no circular dependencies

### Step 7.2 — Run Tests

```bash
npm run test

# Should pass all tests (or show 0 tests if starting fresh)
```

### Step 7.3 — Run Dev Server & Smoke Test

```bash
# Terminal 1
npm run dev

# Terminal 2 (verify in browser)
# Visit http://localhost:5173
# Check:
# - Header renders with your branding ✓
# - Navigation links work ✓
# - Theme toggle works (light/dark) ✓
# - Footer renders with your info ✓
# - Browser console has no errors ✓
```

### Step 7.4 — Verify API Integration

If you have a backend API:

```typescript
// In .env.local (or vite.config.ts)
VITE_API_URL=https://api.example.com

// Update src/api/client.ts to use real API
// Disable MSW or create environment check
```

```bash
npm run dev

# Visit http://localhost:5173
# Open browser DevTools → Network tab
# Make API calls and verify requests go to real backend
```

---

## Phase 8: Version Control & Deployment

### Step 8.1 — Initialize Git (if needed)

```bash
git init
git add .
git commit -m "chore: scaffold appshell from oneticket-core template"
git branch -M main
git remote add origin https://github.com/myorg/myapp
git push -u origin main
```

### Step 8.2 — Set Up CI/CD

Create `.github/workflows/build.yml`:

```yaml
name: Build & Test
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run test
```

### Step 8.3 — Deploy

**Static hosting (Vercel, Netlify, GitHub Pages):**

```bash
# Build
npm run build

# Deploy dist/ to your hosting provider
vercel deploy
# or netlify deploy --prod --dir dist
```

**Docker deployment:**

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## Troubleshooting

### Build Fails with TypeScript Errors

```bash
# Run type check to see all errors
npx tsc --noEmit

# Fix errors one by one
# Common issues:
# - Missing type imports: import type { User } from '...'
# - Unused variables: prefix with _ or remove
# - Implicit any: add explicit type annotations
```

### Dev Server Won't Start

```bash
# Port 5173 already in use?
npm run dev -- --port 5174

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### API Calls Return 404

Check:
1. `src/api/endpoints.ts` — URLs match MSW handlers
2. `src/api/mocks.ts` — Handler paths are correct
3. Browser DevTools → Network tab → Requests are being intercepted by MSW

### Tailwind Classes Not Applying

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Hard refresh browser
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### TypeScript "Module not found" in IDE

```bash
# Update IDE cache (VS Code)
Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or restart VS Code completely
```

---

## Verification Checklist

Before considering your project ready:

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts dev server on http://localhost:5173
- [ ] Browser shows your custom branding (logo, colors, footer)
- [ ] Navigation links work and route between pages
- [ ] Theme toggle switches between light/dark modes
- [ ] `npm run build` produces `dist/` folder with no errors
- [ ] `npm run test` passes or shows 0 tests
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No console errors when browser loads
- [ ] API mocking works (check Network tab in DevTools)

---

## Next Steps

1. **Add your first feature page** — Follow [Architecture](./architecture.md) patterns
2. **Connect to real API** — Replace MSW with real backend endpoints
3. **Add team collaboration** — Set up GitHub, CI/CD, code review process
4. **Scale to production** — Deploy, monitor, iterate

---

## Related Documentation

- [Architecture](./architecture.md) — Full system design
- [README](../../README.md) — Project overview and quick start
- [Product Specification](../../docs/what/product-spec.md) — Vision and requirements

