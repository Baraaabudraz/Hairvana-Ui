import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
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
          // In a real app with a backend, you would make an API call
          // For this demo, we'll simulate a login
          if (email === 'admin@hairvana.com' && password === 'admin123') {
            const mockUser = {
              id: '1',
              email: 'admin@hairvana.com',
              name: 'John Smith',
              role: 'admin' as const,
              avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
            };
            
            const mockToken = 'mock-jwt-token';
            
            set({ 
              user: mockUser, 
              token: mockToken,
              isLoading: false 
            });
            return;
          }
          
          // For Supabase integration
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) throw error;
          
          if (data.user && data.session) {
            // Fetch user details from your users table
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (userError) throw userError;
            
            set({ 
              user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                avatar: userData.avatar
              }, 
              token: data.session.access_token,
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Sign out from Supabase
        supabase.auth.signOut().catch(console.error);
        
        // Clear local state
        set({ user: null, token: null });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token });
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