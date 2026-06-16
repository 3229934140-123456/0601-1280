export type UserRole = 'farmer' | 'pilot' | 'supervisor' | 'env_officer' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  avatar?: string;
  region?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
