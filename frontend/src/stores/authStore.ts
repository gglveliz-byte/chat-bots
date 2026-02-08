import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  role?: string;
  email_verified?: boolean;
}

interface Business {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  country?: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

interface Service {
  id: string;
  service_id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  status: string;
  trial_ends_at?: string;
  subscription_ends_at?: string;
}

interface AuthState {
  user: User | null;
  business: Business | null;
  services: Service[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  login: (email: string, password: string, userType?: string) => Promise<boolean>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (data: Partial<User>) => void;
  updateBusiness: (data: Partial<Business>) => void;
  setServices: (services: Service[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      business: null,
      services: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      login: async (email: string, password: string, userType: string = 'client') => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login(email, password, userType);
          const { user, business, services, tokens } = response.data.data;

          // Guardar tokens en cookies
          Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
          Cookies.set('refreshToken', tokens.refreshToken, { expires: 30 });

          set({
            user,
            business: business || null,
            services: services || [],
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Error al iniciar sesión',
          });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.register(data);
          const { user, tokens } = response.data.data;

          // Guardar tokens en cookies
          Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
          Cookies.set('refreshToken', tokens.refreshToken, { expires: 30 });

          set({
            user,
            business: null,
            services: [],
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Error al registrarse',
          });
          return false;
        }
      },

      logout: async () => {
        try {
          const refreshToken = Cookies.get('refreshToken');
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        } finally {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');

          set({
            user: null,
            business: null,
            services: [],
            isAuthenticated: false,
          });
        }
      },

      checkAuth: async () => {
        const accessToken = Cookies.get('accessToken');

        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await authApi.getMe();
          const userData = response.data.data;

          set({
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              type: userData.type,
              role: userData.role,
              email_verified: userData.email_verified,
            },
            business: userData.business_name ? {
              id: userData.id,
              name: userData.business_name,
              industry: userData.industry,
              description: userData.business_description,
              country: userData.country,
              address: userData.business_address,
              website: userData.website,
              phone: userData.business_phone,
              email: userData.business_email,
              logo_url: userData.logo_url,
            } : null,
            services: userData.services || [],
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');

          set({
            user: null,
            business: null,
            services: [],
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (data) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },

      updateBusiness: (data) => {
        const currentBusiness = get().business;
        set({ business: currentBusiness ? { ...currentBusiness, ...data } : data as Business });
      },

      setServices: (services) => set({ services }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        business: state.business,
        services: state.services,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
