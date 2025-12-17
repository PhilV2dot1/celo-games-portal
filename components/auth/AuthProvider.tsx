'use client';

/**
 * AuthProvider - Authentication Context Provider
 *
 * Manages authentication state across the application using Supabase Auth.
 * Provides functions for signup, signin, signout, and wallet/Farcaster linking.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  // State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  loading: boolean;

  // Authentication functions
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // Social auth
  signInWithGoogle: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;

  // Wallet/Farcaster linking
  linkWallet: (address: string) => Promise<{ success: boolean; error?: string }>;
  linkFarcaster: (fid: number) => Promise<{ success: boolean; error?: string }>;

  // Profile claiming
  claimProfile: (localStats?: any) => Promise<{ success: boolean; error?: string }>;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Computed properties
  const isAuthenticated = !!user;
  const isAnonymous = !isAuthenticated;

  // ============================================================================
  // Authentication Functions
  // ============================================================================

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Échec de la création du compte' };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de la création du compte',
      };
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Échec de la connexion' };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de la connexion',
      };
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  /**
   * Sign in with Twitter
   */
  const signInWithTwitter = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('Twitter sign in error:', error);
    }
  };

  // ============================================================================
  // Wallet/Farcaster Linking
  // ============================================================================

  /**
   * Link wallet address to current authenticated user
   */
  const linkWallet = async (address: string) => {
    if (!user) {
      return { success: false, error: 'Vous devez être connecté' };
    }

    try {
      const response = await fetch('/api/auth/claim-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authUserId: user.id,
          walletAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Échec du lien wallet' };
      }

      return { success: true };
    } catch (error) {
      console.error('Link wallet error:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors du lien wallet',
      };
    }
  };

  /**
   * Link Farcaster ID to current authenticated user
   */
  const linkFarcaster = async (fid: number) => {
    if (!user) {
      return { success: false, error: 'Vous devez être connecté' };
    }

    try {
      const response = await fetch('/api/auth/claim-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authUserId: user.id,
          fid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Échec du lien Farcaster' };
      }

      return { success: true };
    } catch (error) {
      console.error('Link Farcaster error:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors du lien Farcaster',
      };
    }
  };

  // ============================================================================
  // Profile Claiming
  // ============================================================================

  /**
   * Claim profile - migrate localStorage stats to authenticated account
   */
  const claimProfile = async (localStats?: any) => {
    if (!user) {
      return { success: false, error: 'Vous devez être connecté' };
    }

    try {
      // Call signup endpoint with local stats to migrate
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authUserId: user.id,
          localStats,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Échec de la réclamation du profil' };
      }

      return {
        success: true,
        ...data,
      };
    } catch (error) {
      console.error('Claim profile error:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de la réclamation du profil',
      };
    }
  };

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: AuthContextType = {
    // State
    user,
    session,
    isAuthenticated,
    isAnonymous,
    loading,

    // Functions
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithTwitter,
    linkWallet,
    linkFarcaster,
    claimProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * useAuth hook - Access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
