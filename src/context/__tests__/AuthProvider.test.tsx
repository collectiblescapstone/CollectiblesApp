import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthContextProvider, useAuth } from '../AuthProvider'
import React from 'react'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { CapacitorHttp } from '@capacitor/core'

const pushMock = jest.fn()
const pathnameMock = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock
    }),
    usePathname: () => pathnameMock()
}))

jest.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            signInWithOAuth: jest.fn(),
            signOut: jest.fn(),
            getSession: jest.fn(),
            onAuthStateChange: jest.fn()
        }
    }
}))

// Mock CapacitorHttp for testing
jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn(),
        delete: jest.fn()
    }
}))

describe('AuthProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        pathnameMock.mockReturnValue('/home')
        ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
            data: { session: null }
        })
        ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
            () => ({
                data: { subscription: { unsubscribe: jest.fn() } }
            })
        )
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
    )

    it('provides default session as null', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })
        expect(result.current.session).toBeNull()
    })

    it('signUp returns success on valid response', async () => {
        ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({
            data: { user: { id: '1' }, session: { access_token: 'token' } },
            error: null
        })
        const { result } = renderHook(() => useAuth(), { wrapper })
        const res = await result.current.signUp('test@email.com', 'password')
        expect(res.success).toBe(true)
        expect(res.data.user).toEqual({ id: '1' })
        expect(res.data.session).toEqual({ access_token: 'token' })
        expect(res.error).toBeNull()
    })

    it('signUp returns error on failure', async () => {
        ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Signup error' }
        })
        const { result } = renderHook(() => useAuth(), { wrapper })
        const res = await result.current.signUp('fail@email.com', 'password')
        expect(res.success).toBe(false)
        expect(res.data.user).toBeNull()
        expect(res.data.session).toBeNull()
        expect(res.error).toBeDefined()
    })

    it('signIn returns success on valid response', async () => {
        ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
            data: { user: { id: '2' } },
            error: null
        })
        const { result } = renderHook(() => useAuth(), { wrapper })
        const res = await result.current.signIn('test@email.com', 'password')
        expect(res.success).toBe(true)
        expect(res.data).toEqual({ user: { id: '2' } })
    })

    it('signIn returns error on failure', async () => {
        ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
            data: null,
            error: { message: 'Sign-in error' }
        })
        const { result } = renderHook(() => useAuth(), { wrapper })
        const res = await result.current.signIn('fail@email.com', 'password')
        expect(res.success).toBe(false)
        expect(res.error).toBe('Sign-in error')
    })

    it('signIn handles unexpected errors', async () => {
        ;(supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue({
            message: 'Unexpected error'
        })
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const { result } = renderHook(() => useAuth(), { wrapper })
        await act(async () => {
            await result.current.signIn('fail@email.com', 'password')
        })
        expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Unexpected error during sign-in:',
            {
                message: 'Unexpected error'
            }
        )
        consoleErrorSpy.mockRestore()
    })

    it('signOut calls supabase signOut', async () => {
        ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null })
        const { result } = renderHook(() => useAuth(), { wrapper })
        await act(async () => {
            await result.current.signOut()
        })
        expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('signOut handles signOut error', async () => {
        ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
            error: { message: 'Sign-out error' }
        })
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const { result } = renderHook(() => useAuth(), { wrapper })
        await act(async () => {
            await result.current.signOut()
        })
        expect(supabase.auth.signOut).toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', {
            message: 'Sign-out error'
        })
        consoleErrorSpy.mockRestore()
    })

    it('updates session on auth state change', async () => {
        let authStateChangeCallback: (
            event: string,
            session: Session
        ) => void = () => {}
        ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
            (callback) => {
                authStateChangeCallback = callback
            }
        )

        const { result } = renderHook(() => useAuth(), { wrapper })

        const newSession = {
            user: { id: '3', app_metadata: { provider: 'email' } }
        } as Session
        act(() => {
            authStateChangeCallback('SIGNED_IN', newSession)
        })

        expect(result.current.session).toEqual(newSession)
    })

    it('throws error if useAuth is used outside provider', () => {
        // Remove wrapper to simulate outside provider
        const errorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        expect(() => renderHook(() => useAuth(), {})).toThrow(
            'useAuth must be used within an AuthContextProvider'
        )
        errorSpy.mockRestore()
    })

    describe('signInWithGoogle', () => {
        it('returns success on valid OAuth response', async () => {
            ;(supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
                data: {
                    provider: 'google',
                    url: 'https://accounts.google.com/oauth'
                },
                error: null
            })

            const { result } = renderHook(() => useAuth(), { wrapper })
            const res = await result.current.signInWithGoogle()

            expect(res.success).toBe(true)
            expect(res.data).toEqual({
                provider: 'google',
                url: 'https://accounts.google.com/oauth'
            })
            expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
                provider: 'google',
                options: {
                    redirectTo: expect.stringContaining('/home')
                }
            })
        })

        it('returns error on OAuth failure', async () => {
            ;(supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
                data: null,
                error: { message: 'OAuth error' }
            })

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            const { result } = renderHook(() => useAuth(), { wrapper })
            const res = await result.current.signInWithGoogle()

            expect(res.success).toBe(false)
            expect(res.error).toBe('OAuth error')
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Sign-in error:',
                'OAuth error'
            )
            consoleErrorSpy.mockRestore()
        })

        it('handles unexpected errors during OAuth', async () => {
            ;(supabase.auth.signInWithOAuth as jest.Mock).mockRejectedValue(
                new Error('Network error')
            )

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            const { result } = renderHook(() => useAuth(), { wrapper })
            const res = await result.current.signInWithGoogle()

            expect(res.success).toBe(false)
            expect(res.error).toBe(
                'An unexpected error occurred. Please try again.'
            )
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Unexpected error during sign-in:',
                expect.any(Error)
            )
            consoleErrorSpy.mockRestore()
        })
    })

    describe('deleteAccount', () => {
        it('deletes account successfully when session exists', async () => {
            const mockSession = {
                access_token: 'test-token',
                user: { id: '123' }
            } as Session

            ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: mockSession }
            })
            ;(CapacitorHttp.delete as jest.Mock).mockResolvedValue({
                status: 200,
                data: { success: true }
            })
            ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
                error: null
            })

            const { result } = renderHook(() => useAuth(), { wrapper })

            // Wait for session to be set
            await waitFor(() => {
                expect(result.current.session).toEqual(mockSession)
            })

            const res = await result.current.deleteAccount()

            expect(res.success).toBe(true)
            expect(CapacitorHttp.delete).toHaveBeenCalledWith({
                url: expect.stringContaining('/api/delete-account'),
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer test-token'
                }
            })
            expect(supabase.auth.signOut).toHaveBeenCalled()
            expect(pushMock).toHaveBeenCalledWith('/')
        })

        it('returns error when no session exists', async () => {
            ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: null }
            })

            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            const res = await result.current.deleteAccount()

            expect(res.success).toBe(false)
            expect(res.error).toBe('No active session')
            expect(CapacitorHttp.delete).not.toHaveBeenCalled()
        })

        it('handles API error response', async () => {
            const mockSession = {
                access_token: 'test-token',
                user: { id: '123' }
            } as Session

            ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: mockSession }
            })
            ;(CapacitorHttp.delete as jest.Mock).mockResolvedValue({
                status: 500,
                data: { error: 'Database error' }
            })

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.session).toEqual(mockSession)
            })

            const res = await result.current.deleteAccount()

            expect(res.success).toBe(false)
            expect(res.error).toBe('Database error')
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Delete account API error:',
                { error: 'Database error' }
            )
            consoleErrorSpy.mockRestore()
        })

        it('handles network errors', async () => {
            const mockSession = {
                access_token: 'test-token',
                user: { id: '123' }
            } as Session

            ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: mockSession }
            })
            ;(CapacitorHttp.delete as jest.Mock).mockRejectedValue(
                new Error('Network error')
            )

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.session).toEqual(mockSession)
            })

            const res = await result.current.deleteAccount()

            expect(res.success).toBe(false)
            expect(res.error).toBe('Network error during account deletion')
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error deleting account:',
                expect.any(Error)
            )
            consoleErrorSpy.mockRestore()
        })

        it('handles API error without specific error message', async () => {
            const mockSession = {
                access_token: 'test-token',
                user: { id: '123' }
            } as Session

            ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: mockSession }
            })
            ;(CapacitorHttp.delete as jest.Mock).mockResolvedValue({
                status: 400,
                data: {}
            })

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.session).toEqual(mockSession)
            })

            const res = await result.current.deleteAccount()

            expect(res.success).toBe(false)
            expect(res.error).toBe('Failed to delete account')
            consoleErrorSpy.mockRestore()
        })
    })

    describe('Google OAuth registration flow', () => {
        it('registers new Google user successfully', async () => {
            let authStateChangeCallback: (
                event: string,
                session: Session | null
            ) => void = () => {}

            ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
                (callback) => {
                    authStateChangeCallback = callback
                    return {
                        data: { subscription: { unsubscribe: jest.fn() } }
                    }
                }
            )
            ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
                status: 200,
                data: { status: 'created' }
            })

            renderHook(() => useAuth(), { wrapper })

            const googleSession = {
                access_token: 'google-token',
                user: {
                    id: 'google-user-id',
                    email: 'user@gmail.com',
                    app_metadata: { provider: 'google' }
                }
            } as Session

            await act(async () => {
                authStateChangeCallback('SIGNED_IN', googleSession)
            })

            expect(CapacitorHttp.post).toHaveBeenCalledWith({
                url: expect.stringContaining('/api/register-user/google'),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer google-token'
                },
                data: {
                    id: 'google-user-id',
                    email: 'user@gmail.com'
                }
            })
        })

        it('handles existing Google user without error', async () => {
            let authStateChangeCallback: (
                event: string,
                session: Session | null
            ) => void = () => {}

            ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
                (callback) => {
                    authStateChangeCallback = callback
                    return {
                        data: { subscription: { unsubscribe: jest.fn() } }
                    }
                }
            )
            ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
                status: 200,
                data: { status: 'exists' }
            })

            const { result } = renderHook(() => useAuth(), { wrapper })

            const googleSession = {
                access_token: 'google-token',
                user: {
                    id: 'existing-user-id',
                    email: 'existing@gmail.com',
                    app_metadata: { provider: 'google' }
                }
            } as Session

            await act(async () => {
                authStateChangeCallback('SIGNED_IN', googleSession)
            })

            await waitFor(() => {
                expect(result.current.session).toEqual(googleSession)
            })

            expect(supabase.auth.signOut).not.toHaveBeenCalled()
        })

        it('cleans up and signs out on registration failure', async () => {
            let authStateChangeCallback: (
                event: string,
                session: Session | null
            ) => void = () => {}

            ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
                (callback) => {
                    authStateChangeCallback = callback
                    return {
                        data: { subscription: { unsubscribe: jest.fn() } }
                    }
                }
            )
            ;(CapacitorHttp.post as jest.Mock)
                .mockResolvedValueOnce({
                    status: 500,
                    data: { error: 'Database error' }
                })
                .mockResolvedValueOnce({
                    status: 200,
                    data: { success: true }
                })
            ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
                error: null
            })

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            const { result } = renderHook(() => useAuth(), { wrapper })

            const googleSession = {
                access_token: 'google-token',
                user: {
                    id: 'failed-user-id',
                    email: 'failed@gmail.com',
                    app_metadata: { provider: 'google' }
                }
            } as Session

            await act(async () => {
                authStateChangeCallback('SIGNED_IN', googleSession)
            })

            await waitFor(() => {
                expect(CapacitorHttp.post).toHaveBeenCalledWith({
                    url: expect.stringContaining('/api/cleanup-failed-auth'),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: { userId: 'failed-user-id' }
                })
            })

            expect(supabase.auth.signOut).toHaveBeenCalled()
            expect(pushMock).toHaveBeenCalledWith(
                '/sign-in?error=registration_failed'
            )
            expect(result.current.session).toBeNull()
            consoleErrorSpy.mockRestore()
        })

        it('handles registration network error', async () => {
            let authStateChangeCallback: (
                event: string,
                session: Session | null
            ) => void = () => {}

            ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
                (callback) => {
                    authStateChangeCallback = callback
                    return {
                        data: { subscription: { unsubscribe: jest.fn() } }
                    }
                }
            )
            ;(CapacitorHttp.post as jest.Mock).mockRejectedValue(
                new Error('Network error')
            )
            ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
                error: null
            })

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            const { result } = renderHook(() => useAuth(), { wrapper })

            const googleSession = {
                access_token: 'google-token',
                user: {
                    id: 'network-error-user',
                    email: 'network@gmail.com',
                    app_metadata: { provider: 'google' }
                }
            } as Session

            await act(async () => {
                authStateChangeCallback('SIGNED_IN', googleSession)
            })

            await waitFor(() => {
                expect(supabase.auth.signOut).toHaveBeenCalled()
            })

            expect(pushMock).toHaveBeenCalledWith(
                '/sign-in?error=registration_failed'
            )
            expect(result.current.session).toBeNull()
            consoleErrorSpy.mockRestore()
        })

        it('handles Google user without email', async () => {
            let authStateChangeCallback: (
                event: string,
                session: Session | null
            ) => void = () => {}

            ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
                (callback) => {
                    authStateChangeCallback = callback
                    return {
                        data: { subscription: { unsubscribe: jest.fn() } }
                    }
                }
            )
            ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
                error: null
            })

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            renderHook(() => useAuth(), { wrapper })

            const googleSession = {
                access_token: 'google-token',
                user: {
                    id: 'no-email-user',
                    email: undefined,
                    app_metadata: { provider: 'google' }
                }
            } as Session

            await act(async () => {
                authStateChangeCallback('SIGNED_IN', googleSession)
            })

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'No email found in session'
                )
            })

            expect(supabase.auth.signOut).toHaveBeenCalled()
            expect(pushMock).toHaveBeenCalledWith(
                '/sign-in?error=registration_failed'
            )
            consoleErrorSpy.mockRestore()
        })

        it('does not register non-Google OAuth providers', async () => {
            let authStateChangeCallback: (
                event: string,
                session: Session | null
            ) => void = () => {}

            ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
                (callback) => {
                    authStateChangeCallback = callback
                    return {
                        data: { subscription: { unsubscribe: jest.fn() } }
                    }
                }
            )

            renderHook(() => useAuth(), { wrapper })

            const emailSession = {
                access_token: 'email-token',
                user: {
                    id: 'email-user',
                    email: 'user@example.com',
                    app_metadata: { provider: 'email' }
                }
            } as Session

            await act(async () => {
                authStateChangeCallback('SIGNED_IN', emailSession)
            })

            // Wait a bit to ensure async operations complete
            await new Promise((resolve) => setTimeout(resolve, 100))

            // Verify that registration API was not called for non-Google provider
            expect(CapacitorHttp.post).not.toHaveBeenCalled()
        })
    })

    describe('Routing behavior', () => {
        it('redirects to /unauthorized when no session on protected route', async () => {
            pathnameMock.mockReturnValue('/home')
            ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: null }
            })

            renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(pushMock).toHaveBeenCalledWith('/unauthorized')
            })
        })

        it('redirects to /home when session exists on public route', async () => {
            pathnameMock.mockReturnValue('/sign-in')
            const mockSession = {
                user: { id: '123' }
            } as Session

            ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: mockSession }
            })

            renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(pushMock).toHaveBeenCalledWith('/home')
            })
        })

        it('does not redirect when on public route without session', async () => {
            pathnameMock.mockReturnValue('/sign-in')
            ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: null }
            })

            renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(pushMock).not.toHaveBeenCalled()
            })
        })

        it('does not redirect when on protected route with session', async () => {
            pathnameMock.mockReturnValue('/home')
            const mockSession = {
                user: { id: '123' }
            } as Session

            ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: mockSession }
            })

            renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(pushMock).not.toHaveBeenCalled()
            })
        })
    })

    describe('signOut with router redirect', () => {
        it('redirects to home page on successful sign out', async () => {
            ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
                error: null
            })

            const { result } = renderHook(() => useAuth(), { wrapper })

            await act(async () => {
                await result.current.signOut()
            })

            expect(supabase.auth.signOut).toHaveBeenCalled()
            expect(pushMock).toHaveBeenCalledWith('/')
        })

        it('does not redirect on sign out error', async () => {
            ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
                error: { message: 'Sign-out error' }
            })

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            const { result } = renderHook(() => useAuth(), { wrapper })

            await act(async () => {
                await result.current.signOut()
            })

            expect(supabase.auth.signOut).toHaveBeenCalled()
            expect(pushMock).not.toHaveBeenCalledWith('/')
            consoleErrorSpy.mockRestore()
        })
    })

    describe('signUp email normalization', () => {
        it('converts email to lowercase during signUp', async () => {
            ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({
                data: { user: { id: '1' }, session: null },
                error: null
            })

            const { result } = renderHook(() => useAuth(), { wrapper })
            await result.current.signUp('TEST@EXAMPLE.COM', 'password')

            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password'
            })
        })
    })

    describe('signIn email normalization', () => {
        it('converts email to lowercase during signIn', async () => {
            ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
                data: { user: { id: '2' } },
                error: null
            })

            const { result } = renderHook(() => useAuth(), { wrapper })
            await result.current.signIn('TEST@EXAMPLE.COM', 'password')

            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password'
            })
        })
    })
})
