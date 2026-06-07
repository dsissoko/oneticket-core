import '@testing-library/jest-dom';
import { vi } from 'vitest';

if (typeof window !== 'undefined' && !window.CSS) {
  Object.defineProperty(window, 'CSS', {
    value: { supports: () => false },
    writable: true,
  });
} else if (typeof window !== 'undefined' && !window.CSS.supports) {
  window.CSS.supports = () => false;
}

if (typeof HTMLCanvasElement !== 'undefined') {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => ({
      clearRect: () => undefined,
      fillRect: () => undefined,
      fillText: () => undefined,
      font: '',
      fillStyle: '',
    }) as unknown as CanvasRenderingContext2D,
  );
}
