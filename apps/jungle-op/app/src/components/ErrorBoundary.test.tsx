import React from 'react';

import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { ErrorBoundary } from './ErrorBoundary';

function BrokenComponent(): React.ReactElement {
  throw new Error('Test render error');
}

describe('ErrorBoundary', () => {
  it('catches render errors and shows fallback UI', () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test render error')).toBeInTheDocument();
    expect(screen.getByText('Return Home')).toBeInTheDocument();

    spy.mockRestore();
  });

  it('renders children when no error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });
});
