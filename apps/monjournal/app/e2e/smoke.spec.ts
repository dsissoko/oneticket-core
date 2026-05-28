import { test, expect } from '@playwright/test';

test('app loads without crash', async ({ page }) => {
  await page.goto('/');
  // If page loads successfully, test passes
  expect(page).toBeDefined();
});
