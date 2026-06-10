import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import './styles/globals.css';
import { AppLayout, ErrorBoundary, LoadingIndicator } from './components';
import { queryClient } from './lib/query-client';
import { logger } from './lib/logger';
import { I18nProvider } from './i18n/I18nContext';
import { ThemeDataProvider } from './context/ThemeContext';
import { engineRegistry } from '@/engine/EngineRegistry';
import { TextEngine } from '@/engine/TextEngine';
import { MarkdownEngine } from '@/engine/MarkdownEngine';
import { ScoreEngine } from '@/engine/ScoreEngine';

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
const SessionScreen = lazy(() =>
  import('./screens/SessionScreen').then((mod) => ({ default: mod.SessionScreen }))
);
const ResultsScreen = lazy(() =>
  import('./screens/ResultsScreen').then((mod) => ({ default: mod.ResultsScreen }))
);
const NotFoundScreen = lazy(() =>
  import('./screens/NotFoundScreen').then((mod) => ({ default: mod.NotFoundScreen }))
);

function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeDataProvider>
          <ErrorBoundary>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Suspense fallback={<LoadingIndicator />}>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route index element={<HomeScreen />} />
                  <Route path="/about" element={<AboutScreen />} />
                  <Route path="/session" element={<SessionScreen />} />
                  <Route path="/results" element={<ResultsScreen />} />
                  <Route path="*" element={<NotFoundScreen />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
        </ThemeDataProvider>
      </I18nProvider>
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

    engineRegistry.register('text', TextEngine);
    engineRegistry.register('markdown', MarkdownEngine);
    engineRegistry.register('score', new ScoreEngine());

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
