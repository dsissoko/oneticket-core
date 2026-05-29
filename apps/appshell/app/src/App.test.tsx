import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App component', () => {
  it('renders the AppShell Skeleton heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /AppShell Skeleton/i });
    expect(heading).toBeInTheDocument();
  });

  it('displays the correct text content', () => {
    render(<App />);
    expect(screen.getByText('AppShell Skeleton')).toBeInTheDocument();
  });
});
