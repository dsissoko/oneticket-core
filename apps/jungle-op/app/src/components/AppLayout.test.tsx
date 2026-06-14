
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../test/utils';
import { AppLayout } from './layout/AppLayout';

describe('AppLayout', () => {
  it('renders Header, Outlet content, and Footer', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<div>Page Content</div>} />
        </Route>
      </Routes>
    );

    // Header — logo link
    expect(screen.getAllByText('jungle-op').length).toBeGreaterThan(0);

    // Outlet content
    expect(screen.getByText('Page Content')).toBeInTheDocument();

    // Footer — copyright
    expect(screen.getByText(/© 2026 jungle-op/)).toBeInTheDocument();
  });

  it('renders ThemeToggle in Header', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<div />} />
        </Route>
      </Routes>
    );
    // Multiple elements with aria-label="Toggle theme" may exist — just check at least one
    const toggles = screen.getAllByLabelText('Toggle theme');
    expect(toggles.length).toBeGreaterThan(0);
  });
});
