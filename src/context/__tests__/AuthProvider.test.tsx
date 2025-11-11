import { renderHook, act } from '@testing-library/react';
import { AuthContextProvider, useAuth } from '../AuthProvider';
import React from 'react';
import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';

jest.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(() => {});
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContextProvider>{children}</AuthContextProvider>
  );

  it('provides default session as null', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.session).toBeNull();
  });

  it('signUp returns success on valid response', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: '1' }, session: { access_token: 'token' } },
      error: null,
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    const res = await result.current.signUp('test@email.com', 'password');
    expect(res.success).toBe(true);
    expect(res.data.user).toEqual({ id: '1' });
    expect(res.data.session).toEqual({ access_token: 'token' });
    expect(res.error).toBeNull();
  });

  it('signUp returns error on failure', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Signup error' },
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    const res = await result.current.signUp('fail@email.com', 'password');
    expect(res.success).toBe(false);
    expect(res.data.user).toBeNull();
    expect(res.data.session).toBeNull();
    expect(res.error).toBeDefined();
  });

  it('signIn returns success on valid response', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: '2' } },
      error: null,
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    const res = await result.current.signIn('test@email.com', 'password');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ user: { id: '2' } });
  });

  it('signIn returns error on failure', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Sign-in error' },
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    const res = await result.current.signIn('fail@email.com', 'password');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Sign-in error');
  });

  it('signIn handles unexpected errors', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue({
      message: 'Unexpected error',
    });
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signIn('fail@email.com', 'password');
    });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Unexpected error during sign-in:',
      {
        message: 'Unexpected error',
      }
    );
    consoleErrorSpy.mockRestore();
  });

  it('signOut calls supabase signOut', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signOut();
    });
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('signOut handles signOut error', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: { message: 'Sign-out error' },
    });
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signOut();
    });
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', {
      message: 'Sign-out error',
    });
    consoleErrorSpy.mockRestore();
  });

  it('updates session on auth state change', async () => {
    let authStateChangeCallback: (
      event: string,
      session: Session
    ) => void = () => {};
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
      (callback) => {
        authStateChangeCallback = callback;
      }
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    const newSession = { user: { id: '3' } } as Session;
    act(() => {
      authStateChangeCallback('SIGNED_IN', newSession);
    });

    expect(result.current.session).toEqual(newSession);
  });

  it('throws error if useAuth is used outside provider', () => {
    // Remove wrapper to simulate outside provider
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth(), {})).toThrow(
      'useAuth must be used within an AuthContextProvider'
    );
    errorSpy.mockRestore();
  });
});
