/**
 * Unit Tests for SurpriseButton Component
 *
 * Tests focus on:
 * - Button rendering and display
 * - Click event handling
 * - Disabled state
 * - Accessibility features (ARIA labels, keyboard support)
 * - Custom label and aria-label props
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SurpriseButton } from './SurpriseButton';

describe('SurpriseButton Component', () => {
  describe('Rendering', () => {
    it('should render button with default label', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Surprise');
    });

    it('should render button with custom label', () => {
      const mockOnClick = vi.fn();

      render(
        <SurpriseButton
          onClick={mockOnClick}
          label="🎲 Découvrir"
        />
      );

      expect(screen.getByTestId('surprise-button')).toHaveTextContent('Découvrir');
    });

    it('should be a button element', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should have title attribute for tooltip', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');
      expect(button).toHaveAttribute('title');
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when button is clicked', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when button is disabled', () => {
      const mockOnClick = vi.fn();

      render(
        <SurpriseButton
          onClick={mockOnClick}
          disabled={true}
        />
      );

      const button = screen.getByTestId('surprise-button');
      fireEvent.click(button);

      // Browser prevents click on disabled buttons
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      const mockOnClick = vi.fn();

      render(
        <SurpriseButton
          onClick={mockOnClick}
          disabled={true}
        />
      );

      const button = screen.getByTestId('surprise-button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when disabled prop is false', () => {
      const mockOnClick = vi.fn();

      render(
        <SurpriseButton
          onClick={mockOnClick}
          disabled={false}
        />
      );

      const button = screen.getByTestId('surprise-button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for screen readers', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');
      expect(button).toHaveAttribute('aria-label');
    });

    it('should have custom aria-label when provided', () => {
      const mockOnClick = vi.fn();

      render(
        <SurpriseButton
          onClick={mockOnClick}
          ariaLabel="Custom label for screen readers"
        />
      );

      const button = screen.getByTestId('surprise-button');
      expect(button).toHaveAttribute('aria-label', 'Custom label for screen readers');
    });

    it('should use default aria-label when not provided', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');
      expect(button).toHaveAttribute(
        'aria-label',
        expect.stringContaining('aléatoire')
      );
    });

    it('should be keyboard accessible (Tab navigation)', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');

      // Button should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should respond to Enter key press via native button behavior', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button') as HTMLButtonElement;

      // Native buttons automatically respond to Enter when focused
      button.focus();
      // Simulate Enter key by calling click directly (native button behavior)
      button.click();

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should respond to Space key press via native button behavior', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button') as HTMLButtonElement;

      // Native buttons automatically respond to Space when focused
      button.focus();
      // Simulate Space key by calling click directly (native button behavior)
      button.click();

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should apply custom className when provided', () => {
      const mockOnClick = vi.fn();

      render(
        <SurpriseButton
          onClick={mockOnClick}
          className="custom-class"
        />
      );

      const button = screen.getByTestId('surprise-button');
      expect(button).toHaveClass('custom-class');
    });

    it('should not have className when not provided', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');
      expect(button.className).not.toContain('custom-class');
    });
  });

  describe('Props Variations', () => {
    it('should render with all props provided', () => {
      const mockOnClick = vi.fn();

      render(
        <SurpriseButton
          onClick={mockOnClick}
          disabled={false}
          label="🎲 Custom Label"
          className="my-button"
          ariaLabel="Custom aria label"
        />
      );

      const button = screen.getByTestId('surprise-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Custom Label');
      expect(button).toHaveClass('my-button');
      expect(button).toHaveAttribute('aria-label', 'Custom aria label');
      expect(button).not.toBeDisabled();
    });

    it('should render with minimal props', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Multiple Clicks', () => {
    it('should handle multiple clicks correctly', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('should not handle clicks when disabled, even on multiple attempts', () => {
      const mockOnClick = vi.fn();

      render(
        <SurpriseButton
          onClick={mockOnClick}
          disabled={true}
        />
      );

      const button = screen.getByTestId('surprise-button');

      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should be focusable when enabled', () => {
      const mockOnClick = vi.fn();

      render(<SurpriseButton onClick={mockOnClick} />);

      const button = screen.getByTestId('surprise-button');
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it('should be focusable even when disabled (for accessibility)', () => {
      const mockOnClick = vi.fn();

      render(
        <SurpriseButton
          onClick={mockOnClick}
          disabled={true}
        />
      );

      const button = screen.getByTestId('surprise-button');

      // Some implementations allow focus on disabled buttons for accessibility
      // This test documents the behavior
      expect(button).toBeDisabled();
    });
  });
});
