import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { DemoScreen } from './DemoScreen';

describe('DemoScreen', () => {
  it('renders 4 tabs', () => {
    renderWithProviders(<DemoScreen />);
    expect(screen.getByRole('tab', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Logger' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Auth' })).toBeInTheDocument();
  });

  it('Users tab shows user list', async () => {
    renderWithProviders(<DemoScreen />);
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('Logger tab shows 4 log level buttons', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DemoScreen />);
    await user.click(screen.getByRole('tab', { name: 'Logger' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Debug' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Info' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Warn' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Error' })).toBeInTheDocument();
    });
  });

  it('Auth tab shows epic-1 placeholder text', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DemoScreen />);
    await user.click(screen.getByRole('tab', { name: 'Auth' }));
    await waitFor(() => {
      expect(screen.getByText(/Auth0 integration/)).toBeInTheDocument();
    });
  });
});
