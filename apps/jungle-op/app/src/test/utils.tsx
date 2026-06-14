import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

/**
 * Test wrapper providing all app providers.
 * Use with MemoryRouter for route-dependent components.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  initialPath?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { initialPath = '/' }: WrapperOptions = {}
) {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <MemoryRouter initialEntries={[initialPath]}>
          {ui}
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
