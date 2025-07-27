export interface Role {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  join_date?: string;
  createdAt: string;
  updatedAt: string;
  role_id: string;
  role?: Role;
  status?: 'active' | 'pending' | 'suspended';
  last_login?: string;
  preferences?: any;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role_id: string;
  status?: 'active' | 'pending' | 'suspended';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role_id?: string;
  status?: 'active' | 'pending' | 'suspended';
  avatar?: File;
} 