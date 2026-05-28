/**
 * Vitest type extensions for @testing-library/jest-dom matchers
 * 
 * Extends Vitest's Assertion interface to include @testing-library/jest-dom matchers
 */

import '@testing-library/jest-dom';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  }
}
