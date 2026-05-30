import React from 'react';

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { renderWithProviders } from '../test/utils';
import { createUserSchema, type CreateUserFormData } from '../lib/schemas/user';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

function TestForm({ onSubmit }: { onSubmit: (data: CreateUserFormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'user' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input placeholder="Name" {...register('name')} />
      {errors.name && <p>{errors.name.message}</p>}
      <Input placeholder="Email" {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <Button type="submit">Submit</Button>
    </form>
  );
}

describe('UserForm Zod validation', () => {
  it('blocks submit and shows error for invalid email', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<TestForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks submit and shows error for empty name', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<TestForm onSubmit={onSubmit} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits successfully with valid data', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<TestForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'alice@test.com' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }).closest('form')!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Alice',
          email: 'alice@test.com',
          role: 'user',
        }),
        expect.anything() // event object
      );
    });
  });
});
