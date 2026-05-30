import React from 'react';

import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../test/utils';
import { AppLayout } from '../components/layout/AppLayout';
import { HomeScreen } from './HomeScreen';
import { AboutScreen } from './AboutScreen';
import { HelpScreen } from './HelpScreen';
import { NotFoundScreen } from './NotFoundScreen';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomeScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/help" element={<HelpScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Route>
    </Routes>
  );
}

describe('Routing', () => {
  it('/ renders HomeScreen', () => {
    renderWithProviders(<AppRoutes />, { initialPath: '/' });
    expect(screen.getByText('Welcome to the foundation.')).toBeInTheDocument();
  });

  it('/about renders AboutScreen', () => {
    renderWithProviders(<AppRoutes />, { initialPath: '/about' });
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  it('/help renders HelpScreen', () => {
    renderWithProviders(<AppRoutes />, { initialPath: '/help' });
    expect(screen.getByText('Help & FAQ')).toBeInTheDocument();
  });

  it('unknown route renders NotFoundScreen', () => {
    renderWithProviders(<AppRoutes />, { initialPath: '/nonexistent' });
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });
});
