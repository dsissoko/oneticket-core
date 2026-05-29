import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout, ErrorBoundary, LoadingIndicator } from './components';

// Lazy load page components
const HomePage = lazy(() =>
  import('./pages/HomePage').then((mod) => ({ default: mod.HomePage }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((mod) => ({ default: mod.AboutPage }))
);
const HelpPage = lazy(() =>
  import('./pages/HelpPage').then((mod) => ({ default: mod.HelpPage }))
);
const UsersPage = lazy(() =>
  import('./pages/UsersPage').then((mod) => ({ default: mod.UsersPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((mod) => ({ default: mod.NotFoundPage }))
);

/**
 * App Component
 *
 * Root application component. Wraps Routes with AppLayout and ErrorBoundary
 * to ensure consistent header, footer, layout, and error handling across all pages.
 * Uses lazy loading with Suspense for optimized code splitting.
 */
function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<LoadingIndicator />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export { App };
