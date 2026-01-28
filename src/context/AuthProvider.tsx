'use client';
import { supabase } from '@/utils/supabase';
import type {
  User,
  Session,
  AuthError,
  WeakPassword,
} from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';
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
  loading: boolean;
}

const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/unauthorized',
  '/',
  '/forget-password',
];

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
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
      if (session === null && !publicRoutes.includes(pathname)) {
        router.push('/unauthorized');
      } else if (session && publicRoutes.includes(pathname)) {
        router.push('/home');
      }
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session === null && !publicRoutes.includes(pathname)) {
        router.push('/unauthorized');
      } else if (session && publicRoutes.includes(pathname)) {
        router.push('/home');
      }
      setSession(session);
      setLoading(false);
    });
  }, [pathname, router]);

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ signUp, signIn, signOut, session, loading }}>
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
