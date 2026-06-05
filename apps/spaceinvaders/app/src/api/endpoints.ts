const API_BASE_URL = '/api';

export const endpoints = {
  users: {
    list: () => `${API_BASE_URL}/users`,
    detail: (id: string) => `${API_BASE_URL}/users/${id}`,
    profile: () => `${API_BASE_URL}/users/profile`,
  },
};
