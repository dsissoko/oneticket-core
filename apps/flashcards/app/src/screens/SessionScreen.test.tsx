import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { SessionScreen } from './SessionScreen';
import { ThemeContext } from '@/context/ThemeContext';
import { I18nProvider } from '@/i18n/I18nContext';
import type { Card } from '@/types';

// Mock useSession hook at module scope (ESM-compatible)
vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}));

import { useSession } from '@/hooks/useSession';

// Mock useNavigate
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

import { useNavigate } from 'react-router-dom';

const mockCards: Card[] = [
  { id: 'card-1', front: 'France', back: 'Paris' },
];

function renderSessionScreen(cards?: Card[]) {
  const mockNavigate = vi.fn();
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  vi.mocked(useSession).mockReturnValue({
    results: [],
    recordResult: vi.fn(),
    resetSession: vi.fn(),
  });

  return render(
    <ThemeContext.Provider value={{ themes: [], currentTheme: { id: 'test', name: 'Test', cards: cards ?? [] }, selectedThemeId: 'test', selectTheme: vi.fn() }}>
      <I18nProvider>
        <MemoryRouter>
          <SessionScreen cards={cards} />
        </MemoryRouter>
      </I18nProvider>
    </ThemeContext.Provider>,
  );
}

describe('SessionScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays message when no cards available', () => {
    renderSessionScreen([]);
    expect(screen.getByText('No cards available for this session.')).toBeInTheDocument();
  });

  it('renders flashcard with front content', () => {
    renderSessionScreen(mockCards);
    const front = screen.getByTestId('flashcard-front');
    // With a single card, shuffle always returns that card
    expect(front).toHaveTextContent('France');
  });

  it('flips card on click and shows back content', () => {
    renderSessionScreen(mockCards);

    const cardButton = screen.getByTestId('flashcard-container').querySelector('button');
    expect(cardButton).toBeTruthy();
    fireEvent.click(cardButton!);

    const back = screen.getByTestId('flashcard-back');
    expect(back).toHaveTextContent('Paris');
  });

  it('shows ScoreButtons after flip', () => {
    renderSessionScreen(mockCards);

    expect(screen.queryByText('I knew it')).toBeNull();
    expect(screen.queryByText("I didn't know")).toBeNull();

    const cardButton = screen.getByTestId('flashcard-container').querySelector('button');
    fireEvent.click(cardButton!);

    expect(screen.getByText('I knew it')).toBeInTheDocument();
    expect(screen.getByText("I didn't know")).toBeInTheDocument();
  });

  it('records result and navigates to /results on last card', () => {
    const mockRecordResult = vi.fn();
    vi.mocked(useSession).mockReturnValue({
      results: [],
      recordResult: mockRecordResult,
      resetSession: vi.fn(),
    });
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    render(
      <ThemeContext.Provider value={{ themes: [], currentTheme: { id: 'test', name: 'Test', cards: mockCards }, selectedThemeId: 'test', selectTheme: vi.fn() }}>
        <I18nProvider>
          <MemoryRouter>
            <SessionScreen cards={mockCards} />
          </MemoryRouter>
        </I18nProvider>
      </ThemeContext.Provider>,
    );

    // Flip card
    const cardButton = screen.getByTestId('flashcard-container').querySelector('button');
    fireEvent.click(cardButton!);

    // Click "I knew it" on the only card
    fireEvent.click(screen.getByText('I knew it'));

    expect(mockRecordResult).toHaveBeenCalledWith('card-1', true);
    expect(mockNavigate).toHaveBeenCalledWith('/results');
  });

  it('records unknown result on "I didn\'t know"', () => {
    const mockRecordResult = vi.fn();
    vi.mocked(useSession).mockReturnValue({
      results: [],
      recordResult: mockRecordResult,
      resetSession: vi.fn(),
    });

    render(
      <ThemeContext.Provider value={{ themes: [], currentTheme: { id: 'test', name: 'Test', cards: mockCards }, selectedThemeId: 'test', selectTheme: vi.fn() }}>
        <I18nProvider>
          <MemoryRouter>
            <SessionScreen cards={mockCards} />
          </MemoryRouter>
        </I18nProvider>
      </ThemeContext.Provider>,
    );

    // Flip card
    const cardButton = screen.getByTestId('flashcard-container').querySelector('button');
    fireEvent.click(cardButton!);

    fireEvent.click(screen.getByText("I didn't know"));

    expect(mockRecordResult).toHaveBeenCalledWith('card-1', false);
  });
});
