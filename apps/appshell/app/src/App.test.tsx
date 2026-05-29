import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import App from './App';

describe('App', () => {
  it('should render without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>,
    );
    // App renders successfully if this doesn't throw
    expect(true).toBe(true);
  });

  it('should have routes defined', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>,
    );
    // Basic smoke test: app renders the home screen
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
