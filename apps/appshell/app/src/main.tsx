import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { App } from './index';
import { queryClient } from './lib/queryClient';
import './main.css';

// __ENABLE_MSW__ is defined at build time in vite.config.ts
declare const __ENABLE_MSW__: boolean;

// Initialize MSW in development
if (__ENABLE_MSW__ && import.meta.env.DEV) {
  import('./mocks/browser');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
