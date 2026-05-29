import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useCreateUser } from '../hooks/useCreateUser';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { useDeleteUser } from '../hooks/useDeleteUser';
import type { CreateUserRequest, User } from '../api/types';

export function UsersPage(): React.ReactElement {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    name: '',
    role: 'user',
  });

  const usersQuery = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        data: formData,
      });
      setEditingId(null);
    } else {
      await createMutation.mutateAsync(formData);
    }

    setFormData({ email: '', name: '', role: 'user' });
    setShowForm(false);
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ email: '', name: '', role: 'user' });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Users Management</h1>

      {usersQuery.isLoading && <div>Loading users...</div>}

      {usersQuery.isError && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error loading users: {usersQuery.error?.message}
        </div>
      )}

      {usersQuery.isSuccess && (
        <>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              marginBottom: '20px',
              padding: '8px 16px',
              backgroundColor: '#0366d6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showForm ? 'Cancel' : 'Add User'}
          </button>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              style={{
                marginBottom: '20px',
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{ marginLeft: '8px', padding: '4px' }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{ marginLeft: '8px', padding: '4px' }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label>
                  Role:
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    style={{ marginLeft: '8px', padding: '4px' }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    marginRight: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {createMutation.isError && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              Error creating user: {createMutation.error?.message}
            </div>
          )}

          {updateMutation.isError && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              Error updating user: {updateMutation.error?.message}
            </div>
          )}

          {deleteMutation.isError && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              Error deleting user: {deleteMutation.error?.message}
            </div>
          )}

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '20px',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.data?.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: '1px solid #ddd' }}
                >
                  <td style={{ padding: '12px' }}>{user.name}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>{user.role}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleEdit(user)}
                      style={{
                        marginRight: '8px',
                        padding: '4px 8px',
                        backgroundColor: '#0366d6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={deleteMutation.isPending}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
