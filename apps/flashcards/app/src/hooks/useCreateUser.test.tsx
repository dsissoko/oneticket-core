import React from 'react';

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../test/utils';
import { useUsers } from './useUsers';
import { useCreateUser } from './useCreateUser';

function CreateUserTest() {
  const { data: users } = useUsers();
  const createUser = useCreateUser();

  return (
    <div>
      <p data-testid="count">{users?.length ?? 0}</p>
      <button onClick={() => createUser.mutate({ name: 'New User', email: 'new@test.com', role: 'user' })}>
        Create
      </button>
    </div>
  );
}

describe('useCreateUser', () => {
  it('creates a user and invalidates users cache', async () => {
    renderWithProviders(<CreateUserTest />);

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('5');
    });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('6');
    });
  });
});
