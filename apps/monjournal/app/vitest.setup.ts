/**
 * Vitest setup file
 *
 * Configures test environment with necessary polyfills and global setup.
 */

import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Polyfill CSS.supports for jsdom — required by @primer/react
if (typeof window !== 'undefined' && !window.CSS) {
  Object.defineProperty(window, 'CSS', {
    value: { supports: () => false },
    writable: true,
  });
} else if (typeof window !== 'undefined' && !window.CSS.supports) {
  window.CSS.supports = () => false;
}

// Ensure localStorage is available in jsdom environment
beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
});
