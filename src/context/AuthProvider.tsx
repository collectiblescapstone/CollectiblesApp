'use client';
import { supabase } from '@/utils/supabase';
import type {
  User,
  Session,
  AuthError,
  WeakPassword,
} from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextData {
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    data: {
      user: User | null;
      session: Session | null;
    };
    error?: AuthError | null;
  }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    data?: {
      user: User;
      session: Session;
      weakPassword?: WeakPassword;
    };
    error?: string;
  }>;
  signOut: () => Promise<void>;
  session: Session | null;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);

  // Sign up
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
    });

    if (error) {
      console.error('Error signing up: ', error);
      return {
        success: false,
        data: { user: null, session: null },
        error,
      };
    }

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      // Handle Supabase error explicitly
      if (error) {
        console.error('Sign-in error:', error.message); // Log the error for debugging
        return { success: false, error: error.message }; // Return the error
      }

      return { success: true, data }; // Return the user data
    } catch (error) {
      // Handle unexpected issues
      console.error('Unexpected error during sign-in:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ signUp, signIn, signOut, session }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};
