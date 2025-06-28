import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser, logoutUser, getCurrentUser } from '@/api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'salon' | 'user';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { user, token } = await loginUser(email, password);
          
          set({ 
            user, 
            token,
            isLoading: false 
          });
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await logoutUser();
          set({ user: null, token: null });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token });
      },
      
      checkSession: async () => {
        set({ isLoading: true });
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            set({ user: null, token: null, isLoading: false });
            return;
          }
          
          const userData = await getCurrentUser();
          
          if (!userData) {
            set({ user: null, token: null, isLoading: false });
            return;
          }
          
          set({ 
            user: userData,
            token,
            isLoading: false 
          });
        } catch (error) {
          console.error('Session check error:', error);
          set({ user: null, token: null, isLoading: false });
        }
      },
    }),
    {
      name: 'hairvana-auth',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);