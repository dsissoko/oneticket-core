import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../vitest.setup';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDeleteUser } from './useDeleteUser';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useDeleteUser', () => {
  it('calls DELETE /api/users/:id and succeeds', async () => {
    let deletedId = '';
    server.use(
      http.delete('/api/users/:id', ({ params }) => {
        deletedId = params.id as string;
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('42');
    });

    expect(deletedId).toBe('42');
  });
});
