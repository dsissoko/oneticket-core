import React from 'react';

import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { FlashcardDisplay } from './FlashcardDisplay';
import type { Card } from '@/types';

const mockCard: Card = {
  id: 'card-1',
  front: 'France',
  back: 'Paris',
};

describe('FlashcardDisplay', () => {
  it('renders front face with country name', () => {
    const onFlip = vi.fn();
    renderWithProviders(
      <FlashcardDisplay card={mockCard} isFlipped={false} onFlip={onFlip} />
    );

    const front = screen.getByTestId('flashcard-front');
    expect(front).toHaveTextContent('France');
  });

  it('calls onFlip when clicked', () => {
    const onFlip = vi.fn();
    renderWithProviders(
      <FlashcardDisplay card={mockCard} isFlipped={false} onFlip={onFlip} />
    );

    const button = screen.getByRole('button');
    button.click();

    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it('calls onFlip when Enter key is pressed', () => {
    const onFlip = vi.fn();
    renderWithProviders(
      <FlashcardDisplay card={mockCard} isFlipped={false} onFlip={onFlip} />
    );

    const button = screen.getByRole('button');
    button.focus();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it('calls onFlip when Space key is pressed', () => {
    const onFlip = vi.fn();
    renderWithProviders(
      <FlashcardDisplay card={mockCard} isFlipped={false} onFlip={onFlip} />
    );

    const button = screen.getByRole('button');
    button.focus();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it('shows back face content when flipped', () => {
    const onFlip = vi.fn();
    renderWithProviders(
      <FlashcardDisplay card={mockCard} isFlipped={true} onFlip={onFlip} />
    );

    const back = screen.getByTestId('flashcard-back');
    expect(back).toHaveTextContent('Paris');
  });

  it('shows aria-label for unflipped state', () => {
    const onFlip = vi.fn();
    renderWithProviders(
      <FlashcardDisplay card={mockCard} isFlipped={false} onFlip={onFlip} />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Show capital');
  });

  it('shows aria-label for flipped state', () => {
    const onFlip = vi.fn();
    renderWithProviders(
      <FlashcardDisplay card={mockCard} isFlipped={true} onFlip={onFlip} />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Show country name');
  });
});
