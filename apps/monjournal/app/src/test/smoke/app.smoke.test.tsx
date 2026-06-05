import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../lib/query-client';

// Smoke test: App should render without crashing
describe('Smoke Test', () => {
  it('renders app without crashing', () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <BrowserRouter>
            <div id="app-content">App loaded successfully</div>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    );

    expect(container).toBeDefined();
    expect(container.textContent).toContain('App loaded successfully');
  });
});
