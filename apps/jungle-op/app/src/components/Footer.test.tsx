
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { Footer } from './layout/Footer';

describe('Footer', () => {
  it('renders N1 copyright and links', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/jungle-op/)).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Issues')).toBeInTheDocument();
  });

  it('renders N2 Avatar link to GitHub profile', () => {
    renderWithProviders(<Footer />);
    const profileLink = screen.getByTitle('Profil GitHub @dsissoko');
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', 'https://github.com/dsissoko');
  });

  it('renders N2 social links', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Stargazers')).toBeInTheDocument();
  });
});
