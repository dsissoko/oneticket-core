import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { ResultsScreen } from './ResultsScreen';

// Mock localStorage using vi.stubGlobal (ESM-safe, configurable)
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
};

describe('ResultsScreen', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('displays 0/0 when no results', async () => {
    renderWithProviders(<ResultsScreen />);
    // The score text is split across elements, so we check for the number spans
    await waitFor(() => {
      const spans = screen.getAllByText('0');
      expect(spans).toHaveLength(2); // both known and total are 0
    });
  });

  it('displays correct score X/Y', async () => {
    // Use mockImplementation to return specific data for the key
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'flashcards-session') {
        return JSON.stringify({
          results: [
            { cardId: 'card-1', known: true, timestamp: Date.now() },
            { cardId: 'card-2', known: false, timestamp: Date.now() },
            { cardId: 'card-3', known: true, timestamp: Date.now() },
          ],
        });
      }
      return null;
    });

    renderWithProviders(<ResultsScreen />, { initialPath: '/results' });

    // Wait for useEffect to load results from localStorage
    await waitFor(() => {
      const knownSpans = screen.getAllByText('2');
      expect(knownSpans.length).toBeGreaterThan(0);
    });

    const totalSpans = screen.getAllByText('3');
    expect(totalSpans.length).toBeGreaterThan(0);
  });

  it('shows replay and back to home buttons', () => {
    renderWithProviders(<ResultsScreen />);
    expect(screen.getByRole('button', { name: 'Replay' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument();
  });

  it('back to home link navigates to /', () => {
    renderWithProviders(<ResultsScreen />, { initialPath: '/results' });
    const link = screen.getByRole('link', { name: 'Back to Home' });
    expect(link).toHaveAttribute('href', '/');
  });
});
