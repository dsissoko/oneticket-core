import '@testing-library/jest-dom';

// Polyfill CSS.supports for jsdom — required by @primer/react if used
if (typeof window !== 'undefined' && !window.CSS) {
  Object.defineProperty(window, 'CSS', {
    value: { supports: () => false },
    writable: true,
  });
} else if (typeof window !== 'undefined' && !window.CSS.supports) {
  window.CSS.supports = () => false;
}
