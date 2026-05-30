import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '../test/utils';
import { useUsers } from './useUsers';
import { server } from '../../vitest.setup';

function UsersDisplay() {
  const { data, isLoading, isError } = useUsers();
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading users</p>;
  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

describe('useUsers', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<UsersDisplay />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders list of users after fetch', async () => {
    renderWithProviders(<UsersDisplay />);
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });
  });

  it('shows error state when API returns 500', async () => {
    server.use(
      http.get('/api/users', () => HttpResponse.error())
    );
    renderWithProviders(<UsersDisplay />);
    await waitFor(() => {
      expect(screen.getByText('Error loading users')).toBeInTheDocument();
    });
  });
});
