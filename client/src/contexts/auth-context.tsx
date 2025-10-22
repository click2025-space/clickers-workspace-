import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import type { User, Profile } from '@shared/schema';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, confirmPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  setupProfile: (profileData: any) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      refreshAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshAuth = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      const response = await apiRequest('GET', '/api/auth/me', undefined, {
        Authorization: `Bearer ${storedToken}`,
      });

      setUser(response.user);
      setProfile(response.profile);
      setToken(storedToken);
    } catch (error) {
      console.error('Auth refresh failed:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/signin', {
        email,
        password,
      });

      setUser(response.user);
      setProfile(response.profile);
      setToken(response.token);
      localStorage.setItem('auth_token', response.token);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, confirmPassword: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/signup', {
        email,
        password,
        confirmPassword,
      });

      setUser(response.user);
      setProfile(response.profile);
      setToken(response.token);
      localStorage.setItem('auth_token', response.token);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (token) {
        await apiRequest('POST', '/api/auth/signout', undefined, {
          Authorization: `Bearer ${token}`,
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    }
  };

  const setupProfile = async (profileData: any) => {
    try {
      const response = await apiRequest('POST', '/api/profile/setup', profileData, {
        Authorization: `Bearer ${token}`,
      });

      setProfile(response.profile);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    token,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    setupProfile,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
