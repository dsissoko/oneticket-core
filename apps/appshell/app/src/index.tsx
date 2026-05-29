import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './main.css';
import { AppLayout } from './components';

/**
 * Home Page Component
 *
 * Placeholder for the home page content.
 */
function HomePage(): React.ReactElement {
  return (
    <div className="flex items-center justify-center flex-grow bg-background text-foreground py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AppShell</h1>
        <p className="text-lg text-muted">Welcome to the foundation.</p>
      </div>
    </div>
  );
}

/**
 * App Component
 *
 * Root application component. Wraps Routes with AppLayout
 * to ensure consistent header, footer, and layout across all pages.
 */
function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<div className="flex-grow p-8"><h2 className="text-2xl font-bold">About</h2></div>} />
          <Route path="/help" element={<div className="flex-grow p-8"><h2 className="text-2xl font-bold">Help</h2></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
