import { Page, expect } from '@playwright/test';

/**
 * Helper: Navigate to the app home page
 */
export async function loginAsUser(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page).toHaveTitle(/Journal Personnel/i);
}

/**
 * Helper: Click a button by its text content
 */
export async function clickButton(page: Page, buttonText: string): Promise<void> {
  await page.click(`button:has-text("${buttonText}")`);
}

/**
 * Helper: Fill form inputs (date and text fields)
 */
export async function fillForm(
  page: Page,
  fields: {
    date?: string;
    text?: string;
  }
): Promise<void> {
  if (fields.date) {
    await page.fill('input[type="date"]', fields.date);
  }
  if (fields.text) {
    await page.fill('textarea', fields.text);
  }
}

/**
 * Helper: Verify toast message appears
 */
export async function expectToast(page: Page, message: string): Promise<void> {
  const toastLocator = page.locator(`text=${message}`);
  await expect(toastLocator).toBeVisible();
  // Wait for toast to disappear (typical duration ~2s)
  await expect(toastLocator).toHaveCount(0, { timeout: 5000 });
}

/**
 * Helper: Create a new entry via the form
 */
export async function createEntry(
  page: Page,
  date: string,
  text: string
): Promise<void> {
  // Click the "Nouvelle entrée" button
  await clickButton(page, 'Nouvelle entrée');

  // Wait for form to appear
  await page.waitForSelector('input[type="date"]');

  // Fill form
  await fillForm(page, { date, text });

  // Click save button
  await clickButton(page, 'Sauvegarder');

  // Wait for navigation back to timeline
  await page.waitForNavigation();
}

/**
 * Helper: Edit an entry
 */
export async function editEntry(
  page: Page,
  entryText: string,
  newDate: string,
  newText: string
): Promise<void> {
  // Click on the entry to open details
  await page.click(`text=${entryText}`);

  // Wait for detail view and click edit button
  await page.waitForSelector('button:has-text("Éditer")');
  await clickButton(page, 'Éditer');

  // Wait for form and update
  await page.waitForSelector('input[type="date"]');
  await fillForm(page, { date: newDate, text: newText });

  // Save
  await clickButton(page, 'Sauvegarder');

  // Wait for navigation back
  await page.waitForNavigation();
}

/**
 * Helper: Delete an entry
 */
export async function deleteEntry(page: Page, entryText: string): Promise<void> {
  // Click on the entry to open details
  await page.click(`text=${entryText}`);

  // Wait for detail view and click delete button
  await page.waitForSelector('button:has-text("Supprimer")');
  await clickButton(page, 'Supprimer');

  // Wait for confirmation/deletion
  // Assuming the app shows a confirmation or directly deletes
  await page.waitForNavigation();
}

/**
 * Helper: Search entries by date range
 */
export async function searchByDateRange(
  page: Page,
  startDate: string,
  endDate: string
): Promise<void> {
  // Click search button
  await clickButton(page, 'Rechercher');

  // Wait for search panel
  await page.waitForSelector('input[type="date"]');

  // Set date range (assuming two date inputs)
  const dateInputs = await page.locator('input[type="date"]').all();
  await dateInputs[0].fill(startDate);
  await dateInputs[1].fill(endDate);

  // Submit search
  await clickButton(page, 'Rechercher');

  // Wait for results
  await page.waitForSelector('text=Résultats');
}

/**
 * Helper: Click the Surprise button to get a random entry
 */
export async function clickSurprise(page: Page): Promise<void> {
  await clickButton(page, 'Surprise');
  await page.waitForSelector('text=Autre surprise');
}

/**
 * Helper: Get another surprise entry
 */
export async function getAnotherSurprise(page: Page): Promise<void> {
  await clickButton(page, 'Autre surprise');
  // Wait for content to update
  await page.waitForTimeout(100);
}

/**
 * Helper: Return from surprise to timeline
 */
export async function returnFromSurprise(page: Page): Promise<void> {
  await clickButton(page, 'Retour');
  await page.waitForNavigation();
}

/**
 * Helper: Toggle theme
 */
export async function toggleTheme(page: Page): Promise<void> {
  // Find the theme toggle button (typically a button with an icon)
  const themeButton = page.locator('button[data-testid="theme-toggle"], button:has-text("Thème")').first();
  if (await themeButton.isVisible()) {
    await themeButton.click();
  } else {
    // Fallback: click the first button in the header that might toggle theme
    await page.click('button:nth-child(1)');
  }
  await page.waitForTimeout(300);
}

/**
 * Helper: Check if entry is visible in timeline
 */
export async function expectEntryInTimeline(page: Page, entryText: string): Promise<void> {
  await expect(page.locator(`text=${entryText}`)).toBeVisible();
}

/**
 * Helper: Check if entry is NOT visible in timeline
 */
export async function expectEntryNotInTimeline(page: Page, entryText: string): Promise<void> {
  await expect(page.locator(`text=${entryText}`)).not.toBeVisible();
}

/**
 * Helper: Get the current theme
 */
export async function getCurrentTheme(page: Page): Promise<string> {
  const theme = await page.evaluate(() => {
    return document.documentElement.getAttribute('data-color-mode') || 'light';
  });
  return theme;
}

/**
 * Helper: Clear all entries from localStorage
 */
export async function clearEntries(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('journal-entries');
  });
}

/**
 * Helper: Get all entries from localStorage
 */
export async function getEntriesFromStorage(page: Page): Promise<any[]> {
  const entries = await page.evaluate(() => {
    const stored = localStorage.getItem('journal-entries');
    return stored ? JSON.parse(stored) : [];
  });
  return entries;
}
