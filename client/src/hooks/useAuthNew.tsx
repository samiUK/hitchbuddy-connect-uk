import { useState, useEffect, createContext, useContext } from 'react';
import { ClientStorage } from '../utils/clientStorage';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType: 'rider' | 'driver';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, userType: 'rider' | 'driver') => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to get cached user first
      const cachedUser = ClientStorage.getCachedUserProfile();
      if (cachedUser) {
        setUser(cachedUser);
        setLoading(false);
        // Validate cached user in background
        validateCachedUser(cachedUser);
        return;
      }

      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Cache the user profile
        ClientStorage.cacheUserProfile(data.user);
      } else {
        setUser(null);
        ClientStorage.clearCache('hitchbuddy_user_profile');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      ClientStorage.clearCache('hitchbuddy_user_profile');
    } finally {
      setLoading(false);
    }
  };

  const validateCachedUser = async (cachedUser: User) => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (JSON.stringify(data.user) !== JSON.stringify(cachedUser)) {
          setUser(data.user);
          ClientStorage.cacheUserProfile(data.user);
        }
      } else {
        setUser(null);
        ClientStorage.clearCache('hitchbuddy_user_profile');
      }
    } catch (error) {
      // Keep cached user if validation fails
      console.warn('User validation failed, keeping cached user');
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    userType: 'rider' | 'driver'
  ) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          userType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return {};
      } else {
        return { error: data.error || 'Sign up failed' };
      }
    } catch (error) {
      return { error: 'Network error occurred' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return {};
      } else {
        return { error: data.error || 'Sign in failed' };
      }
    } catch (error) {
      return { error: 'Network error occurred' };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return {};
      } else {
        return { error: data.error || 'Reset password failed' };
      }
    } catch (error) {
      return { error: 'Network error occurred' };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return {};
      } else {
        return { error: data.error || 'Update profile failed' };
      }
    } catch (error) {
      return { error: 'Network error occurred' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};