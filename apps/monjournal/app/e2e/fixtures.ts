import { Page } from '@playwright/test';

/**
 * Test Entry interface
 */
export interface TestEntry {
  id: string;
  date: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a test entry object
 */
export function createTestEntry(date: string, text: string): TestEntry {
  const now = new Date().toISOString();
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date,
    text,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Seed localStorage with test entries
 */
export async function seedEntries(page: Page, entries: TestEntry[]): Promise<void> {
  await page.evaluate((entriesToSeed) => {
    localStorage.setItem('journal-entries', JSON.stringify(entriesToSeed));
  }, entries);
}

/**
 * Clear all entries from localStorage
 */
export async function clearEntries(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('journal-entries');
    localStorage.removeItem('journal-theme');
  });
}

/**
 * Set theme in localStorage
 */
export async function setTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.evaluate((themeValue) => {
    localStorage.setItem('journal-theme', themeValue);
  }, theme);
}

/**
 * Get all entries from localStorage
 */
export async function getEntriesFromStorage(page: Page): Promise<TestEntry[]> {
  const entries = await page.evaluate(() => {
    const stored = localStorage.getItem('journal-entries');
    return stored ? JSON.parse(stored) : [];
  });
  return entries;
}

/**
 * Preset test data: three entries across different dates
 */
export const testDataMultipleDates = [
  createTestEntry('2026-05-20', 'Entry A - May 20'),
  createTestEntry('2026-05-25', 'Entry B - May 25'),
  createTestEntry('2026-06-01', 'Entry C - June 1'),
];

/**
 * Preset test data: entries for theme persistence testing
 */
export const testDataForTheme = [
  createTestEntry('2026-05-28', 'Morning thoughts - may need theme persist test'),
  createTestEntry('2026-05-27', 'Yesterday\'s reflection'),
];

/**
 * Preset test data: multiple entries on same date
 */
export const testDataSameDate = [
  createTestEntry('2026-05-28', 'First entry of the day'),
  createTestEntry('2026-05-28', 'Second entry of the day'),
  createTestEntry('2026-05-28', 'Third entry of the day'),
];

/**
 * Preset test data: long text entries
 */
export const testDataLongText = [
  createTestEntry(
    '2026-05-20',
    'This is a very long entry that tests how the application handles lengthy text content. It should wrap properly and display clearly in the timeline view. The content should be readable and not overflow.'
  ),
  createTestEntry(
    '2026-05-25',
    'Another comprehensive journal entry with detailed thoughts about the day. ' +
      'It contains multiple sentences to ensure the text rendering is working correctly. ' +
      'The application should handle this gracefully without any display issues.'
  ),
];

/**
 * Create a random entry for surprise testing
 */
export function createRandomTestEntry(): TestEntry {
  const dates = ['2026-05-01', '2026-05-15', '2026-05-20', '2026-05-25', '2026-06-01'];
  const texts = [
    'Random reflection 1',
    'Random reflection 2',
    'Random reflection 3',
    'Random reflection 4',
    'Random reflection 5',
  ];

  const date = dates[Math.floor(Math.random() * dates.length)];
  const text = texts[Math.floor(Math.random() * texts.length)];

  return createTestEntry(date, text);
}
