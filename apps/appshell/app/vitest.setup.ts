/**
 * Vitest Global Setup File
 *
 * This file is automatically loaded by Vitest before running tests.
 * It configures:
 * - DOM testing library matchers
 * - Global test utilities
 * - MSW (Mock Service Worker) setup
 * - Global cleanup
 */

import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Cleanup after each test
 * Unmounts React components and clears the DOM
 */
afterEach(() => {
  cleanup();
});

/**
 * Mock window.matchMedia for media query tests
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * Mock IntersectionObserver for visibility-related tests
 */
class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  callback: IntersectionObserverCallback;

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
}

global.IntersectionObserver = MockIntersectionObserver as any;

/**
 * Suppress specific console warnings in tests
 * Only use for framework-level warnings that don't affect test quality
 */
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  });
});

afterEach(() => {
  console.error = originalError;
});
