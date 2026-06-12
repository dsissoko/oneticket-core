import React, { Suspense, lazy, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import './styles/globals.css';
import { AppLayout, ErrorBoundary, LoadingIndicator, RequireAuth } from './components';
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
const AccountPage = lazy(() =>
  import('./screens/AccountPage').then((mod) => ({ default: mod.AccountPage }))
);

/**
 * Handles SPA redirect from GitHub Pages 404.html.
 * When a user navigates directly to a deep link (e.g. /appshell-auth0/appshell-auth0/app/account),
 * GitHub Pages serves 404.html which stores the path in sessionStorage and redirects to index.html.
 * This component reads that stored path and navigates to it.
 */
function SpaRedirectHandler(): null {
  const navigate = useNavigate();

  useEffect(() => {
    const storedPath = sessionStorage.getItem('spa-redirect-path');
    if (storedPath) {
      sessionStorage.removeItem('spa-redirect-path');
      // Strip the basename from the path since React Router handles it
      const base = import.meta.env.BASE_URL;
      const pathWithoutBase = storedPath.startsWith(base)
        ? storedPath.slice(base.length - 1) // keep leading /
        : storedPath;
      navigate(pathWithoutBase, { replace: true });
    }
  }, [navigate]);

  return null;
}

/**
 * Auth0 configuration — read at build time from Vite env vars.
 * When deployed without Auth0 env vars (e.g. GitHub Pages demo),
 * the app runs without authentication (graceful degradation).
 */
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined;
const isAuth0Configured = !!(auth0Domain && auth0ClientId);

if (!isAuth0Configured) {
  logger.warn(
    '[auth0] VITE_AUTH0_DOMAIN or VITE_AUTH0_CLIENT_ID not set — running without authentication. ' +
    'See .env.example for configuration.'
  );
}

function App(): React.ReactElement {
  const appContent = (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SpaRedirectHandler />
      <Suspense fallback={<LoadingIndicator />}>
        <Routes>
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index element={<HomeScreen />} />
            <Route path="/" element={<HomeScreen />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/help" element={<HelpScreen />} />
            <Route path="/demo" element={<DemoScreen />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="*" element={<NotFoundScreen />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );

  if (!isAuth0Configured) {
    // No Auth0 — render app without authentication provider
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          {appContent}
        </ErrorBoundary>
      </QueryClientProvider>
    );
  }

  // Auth0 configured — wrap with Auth0Provider
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Auth0Provider
          domain={auth0Domain}
          clientId={auth0ClientId}
          authorizationParams={{
            redirect_uri: window.location.href,
          }}
          cacheLocation="localstorage"
        >
          {appContent}
        </Auth0Provider>
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
