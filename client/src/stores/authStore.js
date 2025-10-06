import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../config';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Initialize auth state from storage
  initializeAuth: async () => {
    try {
      set({ loading: true });
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        set({
          token,
          user: JSON.parse(userData),
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false });
    }
  },

  // Login
  login: async (email, password) => {
    try {
      console.log('🔄 Starting login process...');
      console.log('📧 Email:', email);
      const apiUrl = `${getApiUrl()}/auth/login`;
      console.log('🌐 API URL:', apiUrl);
      
      set({ loading: true, error: null });
      
      const requestBody = JSON.stringify({ email, password });
      console.log('📦 Request body:', requestBody);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      const data = await response.json();
      console.log('📄 Response data:', data);

      if (response.ok) {
        console.log('✅ Login successful!');
        console.log('👤 User data:', data.user);
        
        // Validate that we have both token and user
        if (!data.token) {
          console.log('❌ Missing token in response');
          set({ loading: false, error: 'Invalid server response - missing token' });
          return { success: false, error: 'Invalid server response' };
        }
        
        if (!data.user) {
          console.log('❌ Missing user data in response');
          set({ loading: false, error: 'Invalid server response - missing user data' });
          return { success: false, error: 'Invalid server response' };
        }
        
        // Store in AsyncStorage
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        return { success: true };
      } else {
        console.log('❌ Login failed:', data.message);
        set({ loading: false, error: data.message || 'Login failed' });
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.log('🚨 Network error caught:', error);
      console.log('🚨 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      set({ loading: false, error: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  },

  // Register
  register: async (userName, email, password, college) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch(`${getApiUrl()}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName, email, password, college }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store in AsyncStorage
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        return { success: true };
      } else {
        set({ loading: false, error: data.message || 'Registration failed' });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loading: false, error: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  },

  // Logout
  logout: async () => {
    try {
      const { token } = get();
      
      if (token) {
        await fetch(`${getApiUrl()}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      // Clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state anyway
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Update user
  updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
}));

export default useAuthStore;