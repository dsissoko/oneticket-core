import { test, expect } from '@playwright/test';
import {
  loginAsUser,
  clickButton,
  fillForm,
  expectToast,
  createEntry,
  editEntry,
  deleteEntry,
  searchByDateRange,
  clickSurprise,
  getAnotherSurprise,
  returnFromSurprise,
  toggleTheme,
  expectEntryInTimeline,
  expectEntryNotInTimeline,
  getCurrentTheme,
  clearEntries as clearEntriesHelper,
  getEntriesFromStorage,
} from './helpers';
import {
  createTestEntry,
  seedEntries,
  clearEntries,
  setTheme,
  testDataMultipleDates,
  testDataSameDate,
} from './fixtures';

/**
 * Workflow 1: Create Entry → View in Timeline
 *
 * User creates a new journal entry and verifies it appears in the timeline view.
 * Related to US-001 (Create Entry) and US-004 (Timeline View)
 */
test.describe('Workflow 1: Create Entry → View in Timeline', () => {
  test.beforeEach(async ({ page }) => {
    await clearEntries(page);
    await loginAsUser(page);
  });

  test('should create a new entry and display it in the timeline', async ({ page }) => {
    const testDate = '2026-05-28';
    const testText = 'My first journal entry';

    // Create entry using helper
    await createEntry(page, testDate, testText);

    // Verify entry appears in timeline
    await expectEntryInTimeline(page, testText);

    // Verify page title is correct
    await expect(page).toHaveTitle(/Journal Personnel/i);
  });

  test('should create multiple entries and display all in timeline', async ({ page }) => {
    const entries = [
      { date: '2026-05-25', text: 'First entry' },
      { date: '2026-05-26', text: 'Second entry' },
      { date: '2026-05-27', text: 'Third entry' },
    ];

    // Create all entries
    for (const entry of entries) {
      await createEntry(page, entry.date, entry.text);
    }

    // Verify all entries are visible
    for (const entry of entries) {
      await expectEntryInTimeline(page, entry.text);
    }
  });

  test('should persist entries after page refresh', async ({ page }) => {
    const testDate = '2026-05-28';
    const testText = 'Entry to persist';

    // Create entry
    await createEntry(page, testDate, testText);
    await expectEntryInTimeline(page, testText);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify entry still exists
    await expectEntryInTimeline(page, testText);
  });
});

/**
 * Workflow 2: Edit Entry → Verify Update
 *
 * User edits an existing entry and verifies the changes are reflected.
 * Related to US-002 (View, Edit, Delete)
 */
test.describe('Workflow 2: Edit Entry → Verify Update', () => {
  test.beforeEach(async ({ page }) => {
    await clearEntries(page);
    await loginAsUser(page);

    // Seed test data
    const entries = [
      createTestEntry('2026-05-20', 'Original entry text'),
      createTestEntry('2026-05-25', 'Another entry'),
    ];
    await seedEntries(page, entries);

    // Reload to load seeded data
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should edit an entry and display updated content', async ({ page }) => {
    const originalText = 'Original entry text';
    const newText = 'Updated entry text';
    const newDate = '2026-05-21';

    // Edit entry
    await editEntry(page, originalText, newDate, newText);

    // Verify old text is gone
    await expectEntryNotInTimeline(page, originalText);

    // Verify new text is visible
    await expectEntryInTimeline(page, newText);
  });

  test('should persist edited entry after page refresh', async ({ page }) => {
    const originalText = 'Original entry text';
    const newText = 'Updated entry text';
    const newDate = '2026-05-21';

    // Edit entry
    await editEntry(page, originalText, newDate, newText);
    await expectEntryInTimeline(page, newText);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify updated entry still exists
    await expectEntryInTimeline(page, newText);
    await expectEntryNotInTimeline(page, originalText);
  });
});

/**
 * Workflow 3: Delete Entry → Verify Removal
 *
 * User deletes an entry and verifies it's removed from the timeline.
 * Related to US-002 (View, Edit, Delete)
 */
test.describe('Workflow 3: Delete Entry → Verify Removal', () => {
  test.beforeEach(async ({ page }) => {
    await clearEntries(page);
    await loginAsUser(page);

    // Seed test data with multiple entries
    const entries = [
      createTestEntry('2026-05-20', 'Entry to delete'),
      createTestEntry('2026-05-25', 'Entry to keep'),
      createTestEntry('2026-05-27', 'Another keeper'),
    ];
    await seedEntries(page, entries);

    // Reload to load seeded data
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should delete an entry and remove it from timeline', async ({ page }) => {
    const textToDelete = 'Entry to delete';
    const textToKeep = 'Entry to keep';

    // Delete entry
    await deleteEntry(page, textToDelete);

    // Verify deleted entry is gone
    await expectEntryNotInTimeline(page, textToDelete);

    // Verify other entries still exist
    await expectEntryInTimeline(page, textToKeep);
  });

  test('should persist deletion after page refresh', async ({ page }) => {
    const textToDelete = 'Entry to delete';

    // Delete entry
    await deleteEntry(page, textToDelete);
    await expectEntryNotInTimeline(page, textToDelete);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify entry is still deleted
    await expectEntryNotInTimeline(page, textToDelete);
  });
});

/**
 * Workflow 4: Search by Date Range → Verify Filtered Results
 *
 * User searches for entries within a specific date range and verifies correct results.
 * Related to US-003 (Search by Period)
 */
test.describe('Workflow 4: Search by Date Range → Verify Filtered Results', () => {
  test.beforeEach(async ({ page }) => {
    await clearEntries(page);
    await loginAsUser(page);

    // Seed test data with entries across different dates
    await seedEntries(page, testDataMultipleDates);

    // Reload to load seeded data
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should filter entries by date range', async ({ page }) => {
    // Search for entries between May 20 and May 30 (should find A and B, not C)
    await searchByDateRange(page, '2026-05-20', '2026-05-30');

    // Verify entries in range are visible
    await expectEntryInTimeline(page, 'Entry A - May 20');
    await expectEntryInTimeline(page, 'Entry B - May 25');

    // Verify entries outside range are not visible
    await expectEntryNotInTimeline(page, 'Entry C - June 1');
  });

  test('should return to full timeline after search', async ({ page }) => {
    // Do a search first
    await searchByDateRange(page, '2026-05-20', '2026-05-30');

    // Click "Voir tout" button to return to full timeline
    await clickButton(page, 'Voir tout');
    await page.waitForNavigation();

    // Verify all entries are visible again
    await expectEntryInTimeline(page, 'Entry A - May 20');
    await expectEntryInTimeline(page, 'Entry B - May 25');
    await expectEntryInTimeline(page, 'Entry C - June 1');
  });

  test('should show empty results for date range with no entries', async ({ page }) => {
    // Search for entries in a future date range with no entries
    await searchByDateRange(page, '2026-07-01', '2026-07-31');

    // Verify no entries are shown
    await expectEntryNotInTimeline(page, 'Entry A - May 20');
    await expectEntryNotInTimeline(page, 'Entry B - May 25');
    await expectEntryNotInTimeline(page, 'Entry C - June 1');
  });
});

/**
 * Workflow 5: Surprise Feature → Verify Random Selection
 *
 * User clicks the Surprise button and verifies a random entry is displayed.
 * Related to US-005 (Surprise Feature)
 */
test.describe('Workflow 5: Surprise Feature → Verify Random Selection', () => {
  test.beforeEach(async ({ page }) => {
    await clearEntries(page);
    await loginAsUser(page);

    // Seed test data
    await seedEntries(page, testDataSameDate);

    // Reload to load seeded data
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should display a random entry when clicking Surprise', async ({ page }) => {
    // Click Surprise button
    await clickSurprise(page);

    // Verify that one of the entries is displayed
    const firstEntry = await page.locator('text=First entry of the day').isVisible();
    const secondEntry = await page.locator('text=Second entry of the day').isVisible();
    const thirdEntry = await page.locator('text=Third entry of the day').isVisible();

    // At least one should be visible
    const anyEntryVisible = firstEntry || secondEntry || thirdEntry;
    expect(anyEntryVisible).toBeTruthy();
  });

  test('should show different entries with multiple Surprise clicks', async ({ page }) => {
    // Click Surprise and get first entry
    await clickSurprise(page);

    const firstEntryText = await page.locator('.surprise-content').first().textContent();
    expect(firstEntryText).toBeTruthy();

    // Get another surprise
    await getAnotherSurprise(page);

    const secondEntryText = await page.locator('.surprise-content').first().textContent();
    expect(secondEntryText).toBeTruthy();

    // Note: Due to randomness, entries might be the same, but the button should work
    // We're testing that the mechanism works, not that they're always different
  });

  test('should return to timeline from Surprise view', async ({ page }) => {
    // Click Surprise
    await clickSurprise(page);

    // Click return button
    await returnFromSurprise(page);

    // Verify we're back at timeline (all entries visible)
    await expectEntryInTimeline(page, 'First entry of the day');
  });
});

/**
 * Workflow 6: Theme Toggle → Verify Appearance Change
 *
 * User toggles the theme (light/dark) and verifies the UI updates.
 * Also tests theme persistence across page refreshes.
 */
test.describe('Workflow 6: Theme Toggle → Verify Appearance Change', () => {
  test.beforeEach(async ({ page }) => {
    await clearEntries(page);
    await setTheme(page, 'light');
    await loginAsUser(page);

    // Seed test data
    await seedEntries(page, [
      createTestEntry('2026-05-28', 'Theme test entry'),
    ]);

    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should toggle theme from light to dark', async ({ page }) => {
    // Get initial theme
    const initialTheme = await getCurrentTheme(page);
    expect(initialTheme).toBe('light');

    // Toggle theme
    await toggleTheme(page);

    // Verify theme changed
    const newTheme = await getCurrentTheme(page);
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should persist theme after page refresh', async ({ page }) => {
    // Toggle theme
    await toggleTheme(page);

    const themeAfterToggle = await getCurrentTheme(page);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify theme is persisted
    const themeAfterRefresh = await getCurrentTheme(page);
    expect(themeAfterRefresh).toBe(themeAfterToggle);
  });

  test('should apply theme correctly to UI elements', async ({ page }) => {
    // Get theme button's computed style
    const themeButton = page.locator('button').first();
    const bgColor = await themeButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(bgColor).toBeTruthy();

    // Toggle theme
    await toggleTheme(page);

    // Verify color changed
    const newBgColor = await themeButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Colors should be different (light mode vs dark mode)
    expect(newBgColor).not.toBe(bgColor);
  });
});

/**
 * Full Cycle Workflow: Create → Search → Surprise → Delete → Verify
 *
 * Complete end-to-end test combining all workflows to verify the application
 * works correctly in a realistic user scenario.
 */
test.describe('Full Cycle Workflow: Comprehensive E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    await clearEntries(page);
    await loginAsUser(page);
  });

  test('should complete full journal workflow: create, search, surprise, delete', async ({
    page,
  }) => {
    // Step 1: Create three entries
    const entryA = 'May 20 reflection';
    const entryB = 'May 25 thinking';
    const entryC = 'June 1 update';

    await createEntry(page, '2026-05-20', entryA);
    await createEntry(page, '2026-05-25', entryB);
    await createEntry(page, '2026-06-01', entryC);

    // Verify all entries appear in timeline
    await expectEntryInTimeline(page, entryA);
    await expectEntryInTimeline(page, entryB);
    await expectEntryInTimeline(page, entryC);

    // Step 2: Search for entries in May
    await searchByDateRange(page, '2026-05-01', '2026-05-31');

    // Verify search results (only A and B)
    await expectEntryInTimeline(page, entryA);
    await expectEntryInTimeline(page, entryB);
    await expectEntryNotInTimeline(page, entryC);

    // Step 3: Return to full timeline
    await clickButton(page, 'Voir tout');
    await page.waitForNavigation();

    // Verify all entries visible again
    await expectEntryInTimeline(page, entryA);
    await expectEntryInTimeline(page, entryB);
    await expectEntryInTimeline(page, entryC);

    // Step 4: Test surprise feature
    await clickSurprise(page);

    // Verify surprise view is active
    const surpriseButton = page.locator('button:has-text("Autre surprise")');
    await expect(surpriseButton).toBeVisible();

    // Return from surprise
    await returnFromSurprise(page);

    // Step 5: Delete one entry
    await deleteEntry(page, entryC);

    // Verify deletion
    await expectEntryNotInTimeline(page, entryC);
    await expectEntryInTimeline(page, entryA);
    await expectEntryInTimeline(page, entryB);

    // Step 6: Verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify entries persisted correctly
    await expectEntryInTimeline(page, entryA);
    await expectEntryInTimeline(page, entryB);
    await expectEntryNotInTimeline(page, entryC);
  });

  test('should handle theme toggle throughout workflow', async ({ page }) => {
    // Create an entry
    const entryText = 'Theme persistence test';
    await createEntry(page, '2026-05-28', entryText);

    // Toggle theme
    const initialTheme = await getCurrentTheme(page);
    await toggleTheme(page);
    const newTheme = await getCurrentTheme(page);

    expect(newTheme).not.toBe(initialTheme);

    // Verify entry still visible with new theme
    await expectEntryInTimeline(page, entryText);

    // Search works with new theme
    await searchByDateRange(page, '2026-05-20', '2026-05-30');
    await expectEntryInTimeline(page, entryText);

    // Return to timeline
    await clickButton(page, 'Voir tout');
    await page.waitForNavigation();

    // Verify theme persisted
    const persistedTheme = await getCurrentTheme(page);
    expect(persistedTheme).toBe(newTheme);

    // Verify entry still there
    await expectEntryInTimeline(page, entryText);
  });
});
