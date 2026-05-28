# Slice 7 — End-to-End Tests & GitHub Pages Deployment

## Goal

Establish comprehensive end-to-end testing that validates all core user workflows, and ensure successful deployment to GitHub Pages with performance optimization and error monitoring. This slice confirms the entire application works as intended before release and enables confident deployments.

## Related Epics

- [Epic 0 — Journal Personnel MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Créer une nouvelle entrée de journal](../../what/epics/epic-0-mvp/user-stories/us-001-create-entry.md)
- [US-002 — Voir, éditer et supprimer ses entrées](../../what/epics/epic-0-mvp/user-stories/us-002-view-edit-delete.md)
- [US-003 — Rechercher ses entrées par période](../../what/epics/epic-0-mvp/user-stories/us-003-search-by-period.md)
- [US-004 — Voir une timeline visuelle](../../what/epics/epic-0-mvp/user-stories/us-004-timeline-view.md)
- [US-005 — Découvrir une entrée aléatoire](../../what/epics/epic-0-mvp/user-stories/us-005-surprise-feature.md)

## Impacted Components

### Testing Infrastructure (`tests/e2e/`)
- **workflows.spec.ts** : End-to-end test scenarios using Playwright
  - Create entry → Read in timeline
  - Edit entry → Verify updates
  - Delete entry → Verify removal
  - Search by date range → Verify filtered results
  - Click Surprise → Verify random selection
  - Toggle theme → Verify appearance change

- **fixtures.ts** : Test data and helper functions
  - createTestEntry(date, text) → entry object
  - seedEntries(count) → populate localStorage for testing
  - clearEntries() → reset localStorage

- **helpers.ts** : Playwright utility functions
  - loginAsUser() → navigate to app (no auth needed)
  - clickButton(text) → find and click button by label
  - fillForm(fields) → fill form inputs
  - expectToast(message) → verify success/error message

### Build & Deployment (`vite.config.ts`, `.github/workflows/`)
- **vite.config.ts** : Optimize build for production
  - Tree-shaking, minification, code-splitting
  - Target ES2020
  - Output < 500 KB gzipped

- **.github/workflows/deploy.yml** : GitHub Actions CI/CD
  - Install dependencies
  - Build with Vite
  - Run tests (optional)
  - Deploy to GitHub Pages
  - Verify deployment (smoke test)

### Performance & Monitoring
- **Lighthouse** : Automated performance audit (phase 2)
- **Error boundaries** : Catch and display React errors gracefully
- **Browser console** : Check for errors/warnings on load

## Interfaces

### Playwright Tests
```typescript
// tests/e2e/workflows.spec.ts
test('Create entry → View in timeline', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('button:has-text("Nouvelle entrée")');
  await page.fill('input[type="date"]', '2026-05-28');
  await page.fill('textarea', 'My journal entry');
  await page.click('button:has-text("Sauvegarder")');
  await expect(page).toHaveTitle('Journal Personnel');
  await expect(page.locator('text=My journal entry')).toBeVisible();
});
```

### Test Helpers
```typescript
// tests/e2e/helpers.ts
export async function createEntry(
  page: Page,
  date: string,
  text: string
): Promise<void> {
  await page.click('button:has-text("Nouvelle entrée")');
  await page.fill('input[type="date"]', date);
  await page.fill('textarea', text);
  await page.click('button:has-text("Sauvegarder")');
  await page.waitForNavigation();
}

export async function expectToast(page: Page, message: string): Promise<void> {
  await expect(page.locator(`text=${message}`)).toBeVisible();
}
```

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Build & Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test:e2e  # optional
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Data Changes

### Test Data
- **Fixtures** : Pre-built test entries for various scenarios
  - Multiple entries per date
  - Long text entries
  - Various date ranges

### localStorage Behavior in Tests
- **Setup** : Seed localStorage with test data
- **Teardown** : Clear localStorage after test
- **Isolation** : Each test starts with clean state

## Sequence Flow

### E2E Workflow : Create → Search → Surprise → Delete
```
1. Page loads (home/timeline)
2. Create entry A : date=2026-05-20, text="Entry A"
3. Create entry B : date=2026-05-25, text="Entry B"
4. Create entry C : date=2026-06-01, text="Entry C"
5. Verify all 3 in timeline
6. Click "Search"
7. Set date range : 2026-05-20 to 2026-05-30
8. Click "Search"
9. Verify only entries A and B in results
10. Click "Voir tout"
11. Return to full timeline
12. Click "Surprise"
13. Verify one random entry displays
14. Click "Autre surprise" 5 times
15. Verify different entries appear (random sampling)
16. Click "Retour"
17. Click entry C in timeline
18. Click "Delete"
19. Confirm deletion
20. Verify entry C gone from timeline
21. Toggle theme (light ↔ dark)
22. Verify UI updates instantly
23. Refresh page
24. Verify all remaining entries persisted
25. Verify theme choice persisted
```

### GitHub Actions Deployment Pipeline
```
1. Developer pushes to main branch
2. GitHub Actions triggered
3. Checkout code
4. Install Node.js 18
5. npm install (install dependencies)
6. npm run build (Vite compilation)
   a. TypeScript compiled
   b. React JSX transformed
   c. CSS processed, variables injected
   d. Assets optimized
   e. Output: dist/ folder
7. npm run test:e2e (optional, Playwright tests)
   a. Start dev server
   b. Run E2E workflows
   c. Verify all scenarios pass
   d. Report results
8. Deploy dist/ to GitHub Pages
   a. Push to gh-pages branch
   b. GitHub Pages auto-publishes
9. Verify deployment
   a. HTTP 200 for index.html
   b. No console errors
   c. localStorage API available
10. Smoke test (optional)
    a. Load page
    b. Check for React errors
    c. Test basic interactions
11. Deployment complete
12. URL available: https://{username}.github.io/journal-personnel/
```

## Observability Impact

### Test Coverage
- **Smoke tests** : Page loads, no console errors
- **Happy path** : All workflows succeed (create, search, surprise, delete)
- **Error cases** : Invalid input handled gracefully (phase 2)
- **Performance** : All operations complete within SLA

### Deployment Monitoring
- **Build status** : Green/red indicator in GitHub
- **Deployment logs** : Check GitHub Actions for failures
- **Browser console** : No errors or warnings on production
- **Lighthouse** : Performance audit (phase 2)

### User Feedback
- **Success deployment** : Site accessible within 2 minutes
- **Rollback plan** : Revert to previous commit if needed
- **Status page** : Link in README for current status

## Testing Expectations

### E2E Tests (Playwright)
- Create entry workflow
- Edit entry workflow
- Delete entry workflow
- Search by date range workflow
- Surprise/random selection workflow
- Theme toggle workflow
- Full cycle : create → search → surprise → delete

### Smoke Tests
- Page loads (HTTP 200)
- React renders without error
- No console errors or warnings
- localStorage API available
- UI interactive (buttons clickable)

### Performance Tests
- Page load time < 2s (on 4G)
- Time to interactive < 3s
- All operations < 50–100ms
- 60 fps scroll performance

### Accessibility Tests
- Keyboard navigation works (Tab, Enter, Escape)
- Screen reader announces key elements
- Color contrast meets WCAG AA
- Focus visible and managed properly

### Visual Tests (Manual)
- Light mode renders correctly
- Dark mode renders correctly
- Mobile layout responsive (< 768px)
- No text overflow or clipping
- Primer components styled correctly

## Definition of Done

- [ ] E2E test suite written (Playwright)
- [ ] Create entry workflow tested (US-001)
- [ ] Edit entry workflow tested (US-002)
- [ ] Delete entry workflow tested (US-002)
- [ ] Search by date range tested (US-003)
- [ ] Timeline display tested (US-004)
- [ ] Surprise feature tested (US-005)
- [ ] Theme toggle tested
- [ ] All E2E tests pass in CI/CD
- [ ] Vite build configuration optimized
- [ ] Bundle size < 500 KB gzipped
- [ ] GitHub Actions workflow configured
- [ ] Deploy to GitHub Pages automated
- [ ] Deployment smoke tests pass
- [ ] No console errors in production
- [ ] Page load time < 2s verified
- [ ] Keyboard accessibility verified
- [ ] Screen reader tested
- [ ] Color contrast verified (WCAG AA)
- [ ] Mobile responsive tested (< 768px)
- [ ] Theme persistence tested (refresh page)
- [ ] localhost dev server works (`npm run dev`)
- [ ] Production preview works (`npm run preview`)
- [ ] README updated with deployment instructions
- [ ] GitHub Pages URL working and accessible
- [ ] Lighthouse performance score > 90
- [ ] All unit tests pass (100% cumulative coverage)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Deployment rollback plan documented
- [ ] Known issues documented in README

## Success Criteria

### Functional
- All user stories successfully completed and tested
- No data loss after refresh
- All CRUD operations working end-to-end
- Search and filter working correctly
- Random selection uniform and responsive
- Theme switching applied instantly

### Technical
- Bundle size < 500 KB gzipped
- Page load < 2s (on 4G)
- All operations < 50–100ms
- 60 fps scroll performance
- No console errors or warnings
- TypeScript strict mode compliance
- 100% test coverage on domain layer
- > 80% test coverage on hooks
- > 80% test coverage on components

### Deployment
- Automated CI/CD via GitHub Actions
- Single-click rollback available
- Deployment logs accessible
- Status page accessible
- GitHub Pages URL working
- HTTPS enabled automatically
- CDN caching optimal

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation complete
- Screen reader support
- Color contrast > 4.5:1
- Focus management correct

### User Experience
- Intuitive navigation
- Clear feedback on all actions
- Mobile responsive (< 768px)
- Dark and light modes functional
- No confusing error messages
- Help/guidance available (phase 2)

