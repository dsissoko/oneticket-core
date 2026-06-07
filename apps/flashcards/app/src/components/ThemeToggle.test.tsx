
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('renders theme toggle button with aria-label', () => {
    renderWithProviders(<ThemeToggle />);
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
  });

  it('opens dropdown with theme options when clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />);
    await user.click(screen.getByLabelText('Toggle theme'));
    await waitFor(() => {
      expect(screen.getByText('System')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });
  });

  it('applies .dark class to html when Dark is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />);
    await user.click(screen.getByLabelText('Toggle theme'));
    await waitFor(() => screen.getByText('Dark'));
    await user.click(screen.getByText('Dark'));
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
  });
});
