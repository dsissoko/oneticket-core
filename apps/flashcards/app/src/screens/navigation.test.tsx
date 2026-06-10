import React from 'react';

import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithProviders } from '../test/utils';
import { HomeScreen } from './HomeScreen';
import { AboutScreen } from './AboutScreen';
import { AppLayout } from '../components/layout/AppLayout';

function LocationDisplay() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname}</p>;
}

describe('Internal Navigation', () => {
  it('clicking About navigates to /about', () => {
    renderWithProviders(
      <>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomeScreen />} />
            <Route path="/about" element={<AboutScreen />} />
          </Route>
        </Routes>
        <LocationDisplay />
      </>
    );

    fireEvent.click(screen.getByText('About'));
    expect(screen.getByTestId('location').textContent).toBe('/about');
  });

  it('all internal links use Link not <a href>', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomeScreen />} />
        </Route>
      </Routes>
    );

    // All anchors should have href starting with / (relative, no domain)
    const anchors = document.querySelectorAll('a[href]');
    anchors.forEach(anchor => {
      const href = anchor.getAttribute('href') ?? '';
      if (!href.startsWith('http') && !href.startsWith('mailto')) {
        expect(href).toMatch(/^\//);
      }
    });
  });
});
