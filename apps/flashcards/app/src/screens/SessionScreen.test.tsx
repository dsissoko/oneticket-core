import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { SessionScreen } from './SessionScreen';

// Mock useSession hook
vi.mock('@/hooks/useSession', () => ({
  useSession: () => ({
    currentIndex: 0,
    results: [],
    recordResult: vi.fn(),
    nextCard: vi.fn(),
    previousCard: vi.fn(),
    resetSession: vi.fn(),
    themeId: null,
    mode: null,
    setPreferences: vi.fn(),
  }),
}));

// Wrapper with router
function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: BrowserRouter });
}

const mockCards = [
  { id: 'card-1', front: 'France', back: 'Paris' },
  { id: 'card-2', front: 'Germany', back: 'Berlin' },
  { id: 'card-3', front: 'Italy', back: 'Rome' },
];

describe('SessionScreen', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders ProgressBar with correct values', () => {
    renderWithRouter(<SessionScreen cards={mockCards} />);

    const progressText = screen.getByText('1/3');
    expect(progressText).toBeTruthy();
  });

  it('displays FlashcardDisplay with current card country', () => {
    renderWithRouter(<SessionScreen cards={mockCards} />);

    const flashcardFront = screen.getByTestId('flashcard-front');
    expect(flashcardFront).toHaveTextContent('France');
  });

  it('shows country name initially (not flipped)', () => {
    renderWithRouter(<SessionScreen cards={mockCards} />);

    const front = screen.getByTestId('flashcard-front');
    expect(front).toBeVisible();
    const back = screen.getByTestId('flashcard-back');
    expect(back).not.toBeVisible();
  });

  it('flips card on click and shows capital', () => {
    renderWithRouter(<SessionScreen cards={mockCards} />);

    const cardButton = screen.getByTestId('flashcard-container').querySelector('button');
    expect(cardButton).toBeTruthy();

    fireEvent.click(cardButton!);

    const front = screen.getByTestId('flashcard-front');
    expect(front).not.toBeVisible();
    const back = screen.getByTestId('flashcard-back');
    expect(back).toBeVisible();
    expect(back).toHaveTextContent('Paris');
  });

  it('shows ScoreButtons after flip', () => {
    renderWithRouter(<SessionScreen cards={mockCards} />);

    // Initially no ScoreButtons
    expect(screen.queryByText('I knew it')).toBeNull();
    expect(screen.queryByText("I didn't know")).toBeNull();

    // Flip the card
    const cardButton = screen.getByTestId('flashcard-container').querySelector('button');
    fireEvent.click(cardButton!);

    // ScoreButtons should now be visible
    expect(screen.getByText('I knew it')).toBeTruthy();
    expect(screen.getByText("I didn't know")).toBeTruthy();
  });

  it('hides ScoreButtons when card is not flipped', () => {
    renderWithRouter(<SessionScreen cards={mockCards} />);

    expect(screen.queryByText('I knew it')).toBeNull();
    expect(screen.queryByText("I didn't know")).toBeNull();
  });

  it('records result and advances to next card on "I knew it"', () => {
    const { useSession } = vi.mocked(require('@/hooks/useSession'));
    const mockRecordResult = vi.fn();
    const mockNextCard = vi.fn();

    useSession.mockReturnValue({
      currentIndex: 0,
      results: [],
      recordResult: mockRecordResult,
      nextCard: mockNextCard,
      previousCard: vi.fn(),
      resetSession: vi.fn(),
      themeId: null,
      mode: null,
      setPreferences: vi.fn(),
    });

    const { useNavigate } = require('react-router-dom');
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    renderWithRouter(<SessionScreen cards={mockCards} />);

    // Flip card
    const cardButton = screen.getByTestId('flashcard-container').querySelector('button');
    fireEvent.click(cardButton!);

    // Click "I knew it"
    fireEvent.click(screen.getByText('I knew it'));

    expect(mockRecordResult).toHaveBeenCalledWith('card-1', true);
    expect(mockNextCard).toHaveBeenCalled();
  });

  it('records result and advances to next card on "I didn\'t know"', () => {
    const { useSession } = vi.mocked(require('@/hooks/useSession'));
    const mockRecordResult = vi.fn();
    const mockNextCard = vi.fn();

    useSession.mockReturnValue({
      currentIndex: 0,
      results: [],
      recordResult: mockRecordResult,
      nextCard: mockNextCard,
      previousCard: vi.fn(),
      resetSession: vi.fn(),
      themeId: null,
      mode: null,
      setPreferences: vi.fn(),
    });

    const { useNavigate } = require('react-router-dom');
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    renderWithRouter(<SessionScreen cards={mockCards} />);

    // Flip card
    const cardButton = screen.getByTestId('flashcard-container').querySelector('button');
    fireEvent.click(cardButton!);

    // Click "I didn't know"
    fireEvent.click(screen.getByText("I didn't know"));

    expect(mockRecordResult).toHaveBeenCalledWith('card-1', false);
    expect(mockNextCard).toHaveBeenCalled();
  });

  it('navigates to /results when last card is answered', () => {
    const { useSession } = vi.mocked(require('@/hooks/useSession'));
    const mockRecordResult = vi.fn();
    const mockNextCard = vi.fn();

    useSession.mockReturnValue({
      currentIndex: 2, // Last card index (0-indexed, 3 cards total)
      results: [],
      recordResult: mockRecordResult,
      nextCard: mockNextCard,
      previousCard: vi.fn(),
      resetSession: vi.fn(),
      themeId: null,
      mode: null,
      setPreferences: vi.fn(),
    });

    const { useNavigate } = require('react-router-dom');
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    renderWithRouter(<SessionScreen cards={mockCards} />);

    // Flip card
    const cardButton = screen.getByTestId('flashcard-container').querySelector('button');
    fireEvent.click(cardButton!);

    // Click "I knew it" on last card
    fireEvent.click(screen.getByText('I knew it'));

    expect(mockNavigate).toHaveBeenCalledWith('/results');
  });

  it('displays message when no cards available', () => {
    renderWithRouter(<SessionScreen cards={[]} />);

    expect(screen.getByText('No cards available for this session.')).toBeTruthy();
  });

  it('displays second card after first is answered', () => {
    const { useSession } = vi.mocked(require('@/hooks/useSession'));
    const mockRecordResult = vi.fn();
    const mockNextCard = vi.fn();

    useSession.mockReturnValue({
      currentIndex: 1, // Second card
      results: [],
      recordResult: mockRecordResult,
      nextCard: mockNextCard,
      previousCard: vi.fn(),
      resetSession: vi.fn(),
      themeId: null,
      mode: null,
      setPreferences: vi.fn(),
    });

    renderWithRouter(<SessionScreen cards={mockCards} />);

    // Should show Germany (second card)
    const front = screen.getByTestId('flashcard-front');
    expect(front).toHaveTextContent('Germany');

    // Progress should show 2/3
    expect(screen.getByText('2/3')).toBeTruthy();
  });
});