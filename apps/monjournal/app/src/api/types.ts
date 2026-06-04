export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface GetUsersResponse {
  data: User[];
  total: number;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface CreateUserResponse {
  data: User;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserResponse {
  data: User;
}
