import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import './styles/globals.css';
import { AppLayout, ErrorBoundary, LoadingIndicator } from './components';
import { queryClient } from './lib/query-client';

// __ENABLE_MSW__ is defined at build time in vite.config.ts → define block.
// true  = MSW active (demo, preview, no-backend mode)
// false = MSW disabled, real backend is used
declare const __ENABLE_MSW__: boolean;

// Lazy load screen components
const HomeScreen = lazy(() =>
  import('./screens/HomeScreen').then((mod) => ({ default: mod.HomeScreen }))
);
const AboutScreen = lazy(() =>
  import('./screens/AboutScreen').then((mod) => ({ default: mod.AboutScreen }))
);
const HelpScreen = lazy(() =>
  import('./screens/HelpScreen').then((mod) => ({ default: mod.HelpScreen }))
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
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Suspense fallback={<LoadingIndicator />}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<HomeScreen />} />
                <Route path="/" element={<HomeScreen />} />
                <Route path="/about" element={<AboutScreen />} />
                <Route path="/help" element={<HelpScreen />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

// Start MSW conditionally — controlled by __ENABLE_MSW__ defined in vite.config.ts.
// This is independent of dev/prod: MSW can be active on GitHub Pages for demo purposes.
async function startMockServiceWorker(): Promise<void> {
  if (!__ENABLE_MSW__) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({
    serviceWorker: {
      url: import.meta.env.BASE_URL + 'mockServiceWorker.js',
    },
  });
}

startMockServiceWorker().then(() => {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
