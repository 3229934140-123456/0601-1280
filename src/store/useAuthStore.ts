import { create } from 'zustand';
import type { User, UserRole } from '../types/user';
import { mockUsers, roleNames } from '../mock/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: (username: string, password: string, role: UserRole) => {
    const user = mockUsers.find(u => u.username === username && u.role === role);
    if (user && password === '123456') {
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  hasPermission: (requiredRoles: UserRole[]) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return requiredRoles.includes(user.role);
  },
}));

export { roleNames };
