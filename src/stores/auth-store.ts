import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser, logoutUser, getCurrentUser } from '@/api/auth';
import { isTokenValid, clearInvalidToken } from '@/lib/tokenUtils';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'salon' | 'customer';
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
  refreshSession: () => Promise<boolean>;
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
          
          // Ensure token is stored in localStorage
          if (token) {
            localStorage.setItem('token', token);
          }
          
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
          // Ensure token is removed from localStorage
          clearInvalidToken();
          set({ user: null, token: null });
        } catch (error) {
          console.error('Logout error:', error);
          // Even if logout API fails, clear local state
          clearInvalidToken();
          set({ user: null, token: null });
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token });
      },
      
      checkSession: async () => {
        const state = get();
        
        // Prevent duplicate calls
        if (state.isLoading) {
          console.log('🔍 Session check already in progress, skipping duplicate call');
          return;
        }
        
        set({ isLoading: true });
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            set({ user: null, token: null, isLoading: false });
            return;
          }
          
          // Check if token is valid before making API call
          if (!isTokenValid(token)) {
            clearInvalidToken();
            set({ user: null, token: null, isLoading: false });
            return;
          }
          
          const userData = await getCurrentUser();
          
          if (!userData) {
            // Clear invalid token
            clearInvalidToken();
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
          // Clear invalid token on error
          clearInvalidToken();
          set({ user: null, token: null, isLoading: false });
        }
      },

      refreshSession: async () => {
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            return false;
          }
          
          // Check if token is valid
          if (!isTokenValid(token)) {
            clearInvalidToken();
            set({ user: null, token: null });
            return false;
          }
          
          const userData = await getCurrentUser();
          
          if (!userData) {
            clearInvalidToken();
            set({ user: null, token: null });
            return false;
          }
          
          set({ 
            user: userData,
            token
          });
          
          return true;
        } catch (error) {
          console.error('Session refresh error:', error);
          clearInvalidToken();
          set({ user: null, token: null });
          return false;
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