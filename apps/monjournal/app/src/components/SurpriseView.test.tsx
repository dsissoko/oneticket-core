/**
 * Unit Tests for SurpriseView Component
 *
 * Tests focus on:
 * - Entry display with proper formatting
 * - Empty state handling and messaging
 * - Button interactions (next, back)
 * - Keyboard navigation (Escape)
 * - Accessibility features (ARIA labels, roles)
 * - Loading state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { JournalEntry } from '../domain/Entry';
import { SurpriseView } from './SurpriseView';

/**
 * Mock journal entry for testing
 */
const mockEntry: JournalEntry = {
  id: 'a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p',
  date: '2024-01-15',
  text: 'This is a test entry with some content.',
  createdAt: '2024-01-15T10:30:00.000Z',
  updatedAt: '2024-01-15T12:45:30.000Z',
};

const mockEntryNoUpdate: JournalEntry = {
  id: 'b2c3d4e5-f6g7-4h8i-9j0k-1l2m3n4o5p6q',
  date: '2024-01-10',
  text: 'Entry without updates.',
  createdAt: '2024-01-10T09:00:00.000Z',
  updatedAt: '2024-01-10T09:00:00.000Z',
};

describe('SurpriseView Component', () => {
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnCreateEntry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Entry Display', () => {
    it('should render entry with full content when entry is provided', () => {
      render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(
        screen.getByTestId(`surprise-view-${mockEntry.id}`)
      ).toBeInTheDocument();
      // Date is formatted using locale 'fr-FR' so we expect French format
      expect(screen.getByTestId('surprise-entry-date')).toHaveTextContent(
        'lundi 15 janvier 2024'
      );
      expect(screen.getByTestId('surprise-entry-text')).toHaveTextContent(
        'This is a test entry with some content.'
      );
    });

    it('should display created and updated timestamps', () => {
      render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('surprise-entry-created-at')).toBeInTheDocument();
      expect(
        screen.getByTestId('surprise-entry-updated-at')
      ).toBeInTheDocument();
    });

    it('should not display updated timestamp when equal to created timestamp', () => {
      render(
        <SurpriseView
          entry={mockEntryNoUpdate}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.queryByTestId('surprise-entry-updated-at')).not.toBeInTheDocument();
    });

    it('should preserve whitespace and line breaks in entry text', () => {
      const multilineEntry: JournalEntry = {
        ...mockEntry,
        text: 'Line 1\nLine 2\n\nLine 4',
      };

      render(
        <SurpriseView
          entry={multilineEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const textElement = screen.getByTestId('surprise-entry-text');
      expect(textElement).toHaveStyle('whiteSpace: pre-wrap');
    });

    it('should display dice emoji in header', () => {
      render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const emojis = screen.getAllByText('🎲');
      expect(emojis.length).toBeGreaterThan(0);
    });
  });

  describe('Button Interactions', () => {
    it('should call onNext when "Autre surprise" button is clicked', () => {
      render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const nextButton = screen.getByTestId('surprise-next-button');
      fireEvent.click(nextButton);

      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('should call onBack when "Retour" button is clicked', () => {
      render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByTestId('surprise-back-button');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should disable buttons when isLoading is true', () => {
      const { rerender } = render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      const nextButton = screen.getByTestId('surprise-next-button');
      const backButton = screen.getByTestId('surprise-back-button');

      expect(nextButton).not.toBeDisabled();
      expect(backButton).not.toBeDisabled();

      rerender(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
          isLoading={true}
        />
      );

      expect(nextButton).toBeDisabled();
      expect(backButton).toBeDisabled();
    });

    it('should display loading indicator when isLoading is true', () => {
      render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
          isLoading={true}
        />
      );

      expect(screen.getByTestId('surprise-loading-indicator')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should call onBack when Escape key is pressed', () => {
      render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should clean up event listener on unmount', () => {
      const { unmount } = render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const spy = vi.spyOn(window, 'removeEventListener');

      unmount();

      expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));

      spy.mockRestore();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when error is provided and entry is null', () => {
      render(
        <SurpriseView
          entry={null}
          onNext={mockOnNext}
          onBack={mockOnBack}
          error="Aucune entrée trouvée"
        />
      );

      expect(
        screen.getByTestId('surprise-view-empty-state')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Aucune entrée trouvée')
      ).toBeInTheDocument();
    });

    it('should display "Créer une entrée" button in empty state', () => {
      render(
        <SurpriseView
          entry={null}
          onNext={mockOnNext}
          onBack={mockOnBack}
          error="Aucune entrée trouvée"
          onCreateEntry={mockOnCreateEntry}
        />
      );

      const createButton = screen.getByTestId('surprise-create-entry-button');
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveTextContent('Créer une entrée');
    });

    it('should call onCreateEntry when "Créer une entrée" button is clicked', () => {
      render(
        <SurpriseView
          entry={null}
          onNext={mockOnNext}
          onBack={mockOnBack}
          error="Aucune entrée trouvée"
          onCreateEntry={mockOnCreateEntry}
        />
      );

      const createButton = screen.getByTestId('surprise-create-entry-button');
      fireEvent.click(createButton);

      expect(mockOnCreateEntry).toHaveBeenCalledTimes(1);
    });

    it('should display helper text in empty state', () => {
      render(
        <SurpriseView
          entry={null}
          onNext={mockOnNext}
          onBack={mockOnBack}
          error="Aucune entrée trouvée"
        />
      );

      expect(
        screen.getByText('Créez votre première entrée pour utiliser la Surprise.')
      ).toBeInTheDocument();
    });

    it('should not render when entry is null and no error', () => {
      const { container } = render(
        <SurpriseView
          entry={null}
          onNext={mockOnNext}
          onBack={mockOnBack}
          error={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on buttons', () => {
      render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const nextButton = screen.getByTestId('surprise-next-button');
      const backButton = screen.getByTestId('surprise-back-button');

      expect(nextButton).toHaveAttribute('aria-label');
      expect(backButton).toHaveAttribute('aria-label', expect.stringContaining('Escape'));
    });

    it('should have role="region" on main article', () => {
      render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const article = screen.getByRole('region');
      expect(article).toBeInTheDocument();
    });

    it('should have status role on loading indicator', () => {
      render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
          isLoading={true}
        />
      );

      const loadingIndicator = screen.getByTestId('surprise-loading-indicator');
      expect(loadingIndicator).toHaveAttribute('role', 'status');
      expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper headings hierarchy', () => {
      render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle entry with very long text', () => {
      const longText = 'a'.repeat(5000);
      const longEntry: JournalEntry = {
        ...mockEntry,
        text: longText,
      };

      render(
        <SurpriseView
          entry={longEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('surprise-entry-text')).toHaveTextContent('a');
    });

    it('should handle dates in different formats', () => {
      const futureEntry: JournalEntry = {
        ...mockEntry,
        date: '2024-12-31',
      };

      render(
        <SurpriseView
          entry={futureEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('surprise-entry-date')).toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <SurpriseView
          entry={mockEntry}
          onNext={mockOnNext}
          onBack={mockOnBack}
          className="custom-class"
        />
      );

      const article = container.querySelector('article.custom-class');
      expect(article).toBeInTheDocument();
    });
  });
});
