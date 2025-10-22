import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { profilesApi } from '@/lib/supabase-api';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setupProfile: (profileData: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!session;

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Temporarily skip profile loading to get into the app
        console.log('🚀 Skipping profile fetch - creating minimal profile');
        setProfile({
          id: 'temp-' + session.user.id,
          user_id: session.user.id,
          name: session.user.email?.split('@')[0] || 'User',
          bio: null,
          role: null,
          department: null,
          avatar: null,
          phone: null,
          location: null,
          skills: null,
          is_onboarding_complete: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsLoading(false);
        // await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log('🔍 Fetching profile for user:', userId);
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('⏰ Profile fetch timeout - forcing loading to false');
      setIsLoading(false);
      setProfile(null);
    }, 10000); // 10 second timeout

    try {
      console.log('📡 Making Supabase query...');
      const result = await Promise.race([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 8000)
        )
      ]) as any;
      
      const { data, error } = result;

      clearTimeout(timeoutId);
      console.log('📊 Profile query result:', { data, error });

      if (error && error.code === 'PGRST116') {
        console.log('🆕 Profile not found, creating new profile...');
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            is_onboarding_complete: false,
          })
          .select()
          .single();

        console.log('📝 Profile creation result:', { newProfile, createError });

        if (createError) {
          console.error('❌ Error creating profile:', createError);
          setProfile(null);
        } else {
          console.log('✅ Profile created successfully:', newProfile);
          setProfile(newProfile);
        }
      } else if (error) {
        console.error('❌ Profile fetch error:', error);
        // Don't throw, just set profile to null and continue
        setProfile(null);
      } else {
        console.log('✅ Profile found:', data);
        setProfile(data);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('💥 Fatal error fetching profile:', error);
      
      // If it's a timeout or RLS issue, create a minimal profile to continue
      const errorMessage = (error as Error)?.message || '';
      if (errorMessage === 'Query timeout' || errorMessage.includes('policy')) {
        console.log('🔄 Attempting to create fallback profile...');
        try {
          const { data: fallbackProfile, error: fallbackError } = await supabase
            .from('profiles')
            .upsert({
              user_id: userId,
              is_onboarding_complete: false,
              name: 'User',
            })
            .select()
            .single();
          
          if (!fallbackError) {
            console.log('✅ Fallback profile created:', fallbackProfile);
            setProfile(fallbackProfile);
          } else {
            console.error('❌ Fallback profile failed:', fallbackError);
            setProfile(null);
          }
        } catch (fallbackErr) {
          console.error('💥 Fallback profile error:', fallbackErr);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    } finally {
      console.log('🏁 Setting loading to false');
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Profile will be fetched automatically by the auth state change listener
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Profile will be created automatically by the auth state change listener
      // when the user is confirmed and authenticated
    } catch (error: any) {
      throw new Error(error.message || 'Sign up failed');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Sign out failed');
    }
  };

  const setupProfile = async (profileData: Partial<Profile>) => {
    if (!user) throw new Error('No authenticated user');

    try {
      const updatedProfile = await profilesApi.update(user.id, {
        ...profileData,
        is_onboarding_complete: true,
      });

      setProfile(updatedProfile);
    } catch (error: any) {
      console.error('Profile setup error:', error);
      throw new Error(error.message || 'Profile setup failed');
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    setupProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}
