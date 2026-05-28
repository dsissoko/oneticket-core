/**
 * Vitest setup file
 *
 * Configures test environment with necessary polyfills and global setup.
 */

import { beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Ensure localStorage is available in jsdom environment
beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
});
