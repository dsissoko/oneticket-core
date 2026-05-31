import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import './styles/globals.css';
import { AppLayout, ErrorBoundary, LoadingIndicator } from './components';
import { queryClient } from './lib/query-client';
import { logger } from './lib/logger';

// __ENABLE_MSW__ is defined at build time in vite.config.ts → define block.
// true  = MSW active (demo, preview, GitHub Pages — no backend needed)
// false = MSW disabled, real backend is used
declare const __ENABLE_MSW__: boolean;

// Global error boundary — catches anything outside React tree
window.addEventListener('unhandledrejection', (event) => {
  logger.error('[global] Unhandled promise rejection', event.reason);
});
window.addEventListener('error', (event) => {
  logger.error('[global] Uncaught error', event.error);
});

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
const DemoScreen = lazy(() =>
  import('./screens/DemoScreen').then((mod) => ({ default: mod.DemoScreen }))
);
const NotFoundScreen = lazy(() =>
  import('./screens/NotFoundScreen').then((mod) => ({ default: mod.NotFoundScreen }))
);
const GameScreen = lazy(() =>
  import('./screens/GameScreen').then((mod) => ({ default: mod.GameScreen }))
);

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
                <Route path="/demo" element={<DemoScreen />} />
                <Route path="/game" element={<GameScreen />} />
                <Route path="*" element={<NotFoundScreen />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

// Start MSW conditionally — __ENABLE_MSW__ is independent of dev/prod.
// MSW can be active on GitHub Pages for demo purposes.
async function startMockServiceWorker(): Promise<void> {
  if (!__ENABLE_MSW__) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({
    serviceWorker: {
      url: import.meta.env.BASE_URL + 'mockServiceWorker.js',
    },
    onUnhandledRequest(request, print) {
      // MSW should only intercept API calls — never navigation or static assets.
      // Navigation requests are SPA routes handled by React Router, not the network.
      // Static assets are served directly by the hosting platform.
      if (request.destination === 'document' || request.mode === 'navigate') return;
      if (new URL(request.url).pathname.match(/\.(js|css|png|svg|ico|woff2?|ttf)$/)) return;
      // Warn on unhandled API calls — useful for debugging missing handlers
      print.warning();
    },
  });
  logger.info('[msw] Mock Service Worker enabled');
}

async function main(): Promise<void> {
  try {
    await startMockServiceWorker();
    logger.info('[app] Starting');

    const root = document.getElementById('root');
    if (!root) throw new Error('Root element not found');

    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <App />
        </ThemeProvider>
      </React.StrictMode>,
    );

    logger.info('[app] Started');
  } catch (error) {
    logger.error('[app] Failed to start', error);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = '<p style="padding:2rem;font-family:sans-serif">Application failed to start. Please refresh.</p>';
    }
  }
}

void main();
