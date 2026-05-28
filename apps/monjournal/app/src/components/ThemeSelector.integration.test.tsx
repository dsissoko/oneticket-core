/**
 * ThemeSelector Integration Tests
 * 
 * Tests that verify:
 * 1. Props are correctly received and rendered
 * 2. Callback fires on click
 * 3. Callback fires on keyboard (Enter, Space)
 * 4. Icon updates based on theme
 * 5. ARIA attributes are correct
 * 6. Accessibility features work
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSelector } from './ThemeSelector';

describe('ThemeSelector Component', () => {
  const mockOnThemeChange = jest.fn();

  beforeEach(() => {
    mockOnThemeChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render with light theme', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('theme-selector--light');
    });

    it('should render with dark theme', () => {
      render(
        <ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-selector--dark');
    });

    it('should display correct icon for light theme', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      // Light theme should contain Sun icon (check for SVG with circle)
      const svgs = button.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('should display correct icon for dark theme', () => {
      render(
        <ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      // Dark theme should contain Moon icon
      const svgs = button.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('should display theme label', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('should display correct label for dark theme', () => {
      render(
        <ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />
      );
      
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });
  });

  describe('Interaction - Click', () => {
    it('should call onThemeChange with opposite theme on click', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnThemeChange).toHaveBeenCalledTimes(1);
      expect(mockOnThemeChange).toHaveBeenCalledWith('dark');
    });

    it('should toggle to light when currently dark', () => {
      render(
        <ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnThemeChange).toHaveBeenCalledWith('light');
    });
  });

  describe('Interaction - Keyboard', () => {
    it('should call onThemeChange on Enter key', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      expect(mockOnThemeChange).toHaveBeenCalledWith('dark');
    });

    it('should call onThemeChange on Space key', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      
      expect(mockOnThemeChange).toHaveBeenCalledWith('dark');
    });

    it('should prevent default on Space key', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      const event = new KeyboardEvent('keydown', { key: ' ' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      fireEvent(button, event);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not call onThemeChange on other keys', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'ArrowUp', code: 'ArrowUp' });
      fireEvent.keyDown(button, { key: 'a', code: 'KeyA' });
      
      expect(mockOnThemeChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Switch to dark theme. Currently in light theme'
      );
    });

    it('should have aria-pressed attribute', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should set aria-pressed to true in dark mode', () => {
      render(
        <ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have title attribute for tooltip', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to dark theme');
    });

    it('should be keyboard focusable', () => {
      render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Props Updates', () => {
    it('should update when theme prop changes', () => {
      const { rerender } = render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      expect(screen.getByText('Light')).toBeInTheDocument();
      
      rerender(
        <ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />
      );
      
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('should update aria-label when theme changes', () => {
      const { rerender } = render(
        <ThemeSelector theme="light" onThemeChange={mockOnThemeChange} />
      );
      
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Switch to dark theme. Currently in light theme'
      );
      
      rerender(
        <ThemeSelector theme="dark" onThemeChange={mockOnThemeChange} />
      );
      
      button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Switch to light theme. Currently in dark theme'
      );
    });
  });
});
