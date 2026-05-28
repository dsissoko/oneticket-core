import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

/**
 * Main Entry Point — Vite + React + Primer
 *
 * This file:
 * 1. Mounts React app to DOM with ReactDOM.createRoot()
 * 2. Loads all global styles (Primer CSS variables, light/dark theme)
 * 3. Implements root-level error boundary for startup errors
 * 4. Handles localStorage initialization gracefully
 * 5. No MSW setup (MVP: localStorage-only persistence)
 *
 * Global styles loaded include:
 * - Primer color variables (light/dark modes)
 * - Theme detection and switching via data-theme attribute
 * - Fallback light theme on root
 */

/**
 * Root Error Boundary Component
 * Catches and displays startup errors before React renders
 */
const RootErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div
    role="alert"
    style={{
      padding: '32px 24px',
      backgroundColor: '#fff5f5',
      border: '2px solid #fc8181',
      borderRadius: '8px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#c53030',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <h1 style={{ marginTop: 0, fontSize: '28px' }}>⚠️ Application Error</h1>
    <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
      Journal Personnel encountered an error during startup. Please try:
    </p>
    <ol style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'left' }}>
      <li>Refresh the page (Ctrl+R or Cmd+R)</li>
      <li>Clear your browser cache and localStorage</li>
      <li>Try a different browser</li>
    </ol>
    <details
      style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#fef5f5',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        maxWidth: '600px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
        Technical Details
      </summary>
      <code style={{ color: '#a71d5d' }}>
        {error.name}: {error.message}
        {'\n\n'}
        {error.stack}
      </code>
    </details>
  </div>
);

/**
 * Initialize Root-Level Error Handler
 * Catches errors thrown during React initialization
 */
function renderApp(): void {
  try {
    // ============ DOM Element Validation ============
    const rootElement = document.getElementById('app');
    if (!rootElement) {
      throw new Error(
        'Root element with id="app" not found in index.html. ' +
        'Please verify the HTML file contains <div id="app"></div>'
      );
    }

    // ============ Theme Initialization ============
    // Load saved theme from localStorage, fallback to system preference
    const initializeTheme = (): void => {
      try {
        const savedTheme = localStorage.getItem('journal_theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
      } catch (err) {
        // localStorage may be unavailable (private browsing, etc)
        console.warn('[main.tsx] localStorage unavailable for theme init:', err);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      }
    };

    initializeTheme();

    // ============ localStorage Availability Check ============
    // Test if localStorage is accessible (fails in some browsers/modes)
    const checkLocalStorageAvailability = (): boolean => {
      try {
        const test = '__test_localStorage__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (err) {
        console.warn(
          '[main.tsx] localStorage is unavailable. This app requires localStorage. ' +
          'Try disabling private/incognito mode.',
          err
        );
        return false;
      }
    };

    const isLocalStorageAvailable = checkLocalStorageAvailability();
    if (!isLocalStorageAvailable) {
      throw new Error(
        'localStorage is unavailable. This application requires persistent storage. ' +
        'Please disable private/incognito browsing mode.'
      );
    }

    // ============ React Root Creation ============
    const root = ReactDOM.createRoot(rootElement);

    // ============ Mount React App ============
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('[main.tsx] Journal Personnel app mounted successfully');
  } catch (error) {
    // ============ Startup Error Handling ============
    // If React fails to initialize, show error boundary fallback
    const errorElement = document.getElementById('app');
    if (errorElement) {
      const err = error instanceof Error ? error : new Error(String(error));
      errorElement.innerHTML = '';
      const root = ReactDOM.createRoot(errorElement);
      root.render(<RootErrorFallback error={err} />);
    }

    // Log error for debugging
    console.error('[main.tsx] Failed to initialize application:', error);
  }
}

// ============ Delayed Initialization ============
// Wait for DOM to be ready before rendering
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
