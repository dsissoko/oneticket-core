import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { HomeScreen } from './HomeScreen';

describe('HomeScreen', () => {
  it('renders theme picker showing Africa', () => {
    renderWithProviders(<HomeScreen />);
    // Check the Theme label is present and the value shows Africa
    const themeSection = screen.getByText('Theme').parentElement;
    expect(themeSection?.textContent).toContain('Africa');
  });

  it('renders mode selector showing flip', () => {
    renderWithProviders(<HomeScreen />);
    const modeSection = screen.getByText('Mode').parentElement;
    expect(modeSection?.textContent).toContain('flip');
  });

  it('renders Start button linking to /session', () => {
    renderWithProviders(<HomeScreen />);
    const startLink = screen.getByRole('link', { name: 'Start' });
    expect(startLink).toHaveAttribute('href', '/session');
  });

  it('Start button is clickable', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomeScreen />, { initialPath: '/' });
    await user.click(screen.getByRole('link', { name: 'Start' }));
    // MemoryRouter doesn't update window.location, verify link is correct
    expect(screen.getByRole('link', { name: 'Start' })).toHaveAttribute('href', '/session');
  });
});