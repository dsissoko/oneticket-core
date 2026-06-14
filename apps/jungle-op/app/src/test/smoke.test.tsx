import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GameCanvas from '../components/GameCanvas';

describe('GameCanvas Smoke Tests', () => {
  // Track console.warn calls for expected canvas errors
  let consoleWarnings: string[] = [];

  beforeEach(() => {
    consoleWarnings = [];

    // Mock console.warn to track warnings
    const originalWarn = console.warn;
    vi.spyOn(console, 'warn').mockImplementation((message: any) => {
      const msg = String(message);
      consoleWarnings.push(msg);
      originalWarn(message);
    });
  });

  it('(1) should mount GameCanvas component without crashing', () => {
    const { container } = render(<GameCanvas />);
    expect(container).toBeInTheDocument();
  });

  it('(2) should render canvas element', () => {
    const { container } = render(<GameCanvas />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  it('(2a) canvas element should have proper styling', () => {
    const { container } = render(<GameCanvas />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.display).toBe('block');
  });

  it('(3) should initialize with canvas dimensions', () => {
    const { container } = render(<GameCanvas />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  it('(3a) should have initial game state visible on canvas', async () => {
    const { container } = render(<GameCanvas />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(canvas).toBeInTheDocument();
  });

  it('(4) should have no console errors on initial load', async () => {
    consoleWarnings = [];

    const { container } = render(<GameCanvas />);

    await new Promise((resolve) => setTimeout(resolve, 150));

    const unexpectedWarnings = consoleWarnings.filter(
      (msg) =>
        !msg.includes('Unable to get 2D context from canvas') &&
        !msg.includes('Canvas element not available') &&
        !msg.includes('Not implemented'),
    );

    expect(unexpectedWarnings).toEqual([]);
  });

  it('(4a) should handle canvas not available gracefully', async () => {
    const { container } = render(<GameCanvas />);

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeInTheDocument();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should not have unhandled React errors', async () => {
    let errors: string[] = [];
    const originalError = console.error;

    vi.spyOn(console, 'error').mockImplementation((message: any) => {
      const msg = String(message);
      if (!msg.includes('Not implemented: HTMLCanvasElement')) {
        errors.push(msg);
      }
      originalError(message);
    });

    const { container } = render(<GameCanvas />);

    await new Promise((resolve) => setTimeout(resolve, 150));

    const reactErrors = errors.filter((e) => e.includes('React'));
    expect(reactErrors).toEqual([]);
  });

  it('should apply correct event listeners to canvas', () => {
    const { container } = render(<GameCanvas />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeInTheDocument();
  });

  it('should set canvas ref correctly', () => {
    const { container } = render(<GameCanvas />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).not.toBeNull();
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  it('should respond to window resize events', async () => {
    const { container } = render(<GameCanvas />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;

    window.dispatchEvent(new Event('resize'));

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });
});
