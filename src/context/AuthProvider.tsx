'use client'
import { supabase } from '@/lib/supabase'
import { baseUrl } from '@/utils/constants'
import { CapacitorHttp } from '@capacitor/core'
import type {
    User,
    Session,
    AuthError,
    WeakPassword,
    Provider
} from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextData {
    signUp: (
        email: string,
        password: string
    ) => Promise<{
        success: boolean
        data: {
            user: User | null
            session: Session | null
        }
        error?: AuthError | null
    }>
    signIn: (
        email: string,
        password: string
    ) => Promise<{
        success: boolean
        data?: {
            user: User
            session: Session
            weakPassword?: WeakPassword
        }
        error?: string
    }>
    signInWithGoogle: () => Promise<
        | {
              success: boolean
              error: string
              data?: undefined
          }
        | {
              success: boolean
              data: {
                  provider: Provider
                  url: string
              }
              error?: undefined
          }
    >
    signOut: () => Promise<void>
    deleteAccount: () => Promise<{
        success: boolean
        error?: string
    }>
    session: Session | null
    loading: boolean
}

const publicRoutes = [
    '/sign-in',
    '/sign-up',
    '/unauthorized',
    '/',
    '/forget-password'
]

const AuthContext = createContext<AuthContextData | undefined>(undefined)

export const AuthContextProvider = ({
    children
}: {
    children: React.ReactNode
}) => {
    const router = useRouter()
    const pathname = usePathname()

    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<Session | null>(null)

    // Sign up
    const signUp = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email: email.toLowerCase(),
            password: password
        })

        if (error) {
            console.error('Error signing up: ', error)
            return {
                success: false,
                data: { user: null, session: null },
                error
            }
        }

        return {
            success: true,
            data: {
                user: data.user,
                session: data.session
            },
            error: null
        }
    }

    // Sign in
    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: password
            })

            // Handle Supabase error explicitly
            if (error) {
                console.error('Sign-in error:', error.message) // Log the error for debugging
                return { success: false, error: error.message } // Return the error
            }

            return { success: true, data } // Return the user data
        } catch (error) {
            // Handle unexpected issues
            console.error('Unexpected error during sign-in:', error)
            return {
                success: false,
                error: 'An unexpected error occurred. Please try again.'
            }
        }
    }

    // Google Sign in
    const signInWithGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${baseUrl}/home`
                }
            })

            // Handle Supabase error explicitly
            if (error) {
                console.error('Sign-in error:', error.message) // Log the error for debugging
                return { success: false, error: error.message } // Return the error
            }

            return { success: true, data } // Return the user data
        } catch (error) {
            // Handle unexpected issues
            console.error('Unexpected error during sign-in:', error)
            return {
                success: false,
                error: 'An unexpected error occurred. Please try again.'
            }
        }
    }

    // Register Google OAuth user
    const registerGoogleUser = async (session: Session) => {
        try {
            const userId = session.user.id
            const email = session.user.email
            const accessToken = session.access_token

            if (!email) {
                console.error('No email found in session')
                return { success: false, error: 'No email found' }
            }

            const response = await CapacitorHttp.post({
                url: `${baseUrl}/api/register-user/google`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                data: { id: userId, email }
            })

            const data = response.data

            if (response.status !== 200) {
                console.error('Registration API error:', data)
                return {
                    success: false,
                    error: data.error || 'Registration failed'
                }
            }

            // Check if user already existed (not an error)
            if (data.status === 'exists') {
                return { success: true, alreadyExists: true }
            }

            return { success: true, alreadyExists: false }
        } catch (error) {
            console.error('Error registering Google user:', error)
            return {
                success: false,
                error: 'Network error during registration'
            }
        }
    }

    // Cleanup failed auth user
    const cleanupFailedAuth = async (userId: string, accessToken: string) => {
        try {
            await CapacitorHttp.post({
                url: `${baseUrl}/api/cleanup-failed-auth`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                data: { userId }
            })
        } catch (error) {
            console.error('Error cleaning up failed auth:', error)
        }
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session === null && !publicRoutes.includes(pathname)) {
                router.push('/unauthorized')
            } else if (session && publicRoutes.includes(pathname)) {
                router.push('/home')
            }
            setSession(session)
            setLoading(false)
        })

        supabase.auth.onAuthStateChange(async (event, session) => {
            // Handle Google OAuth sign-in
            if (event === 'SIGNED_IN' && session) {
                const provider = session.user.app_metadata.provider

                if (provider === 'google') {
                    const result = await registerGoogleUser(session)

                    if (!result.success) {
                        // Registration failed - cleanup and sign out
                        console.error('Registration failed:', result.error)
                        await cleanupFailedAuth(
                            session.user.id,
                            session.access_token
                        )
                        await supabase.auth.signOut()
                        router.push('/sign-in?error=registration_failed')
                        setSession(null)
                        setLoading(false)
                        return
                    }
                }
            }

            // Normal auth state change handling
            if (session === null && !publicRoutes.includes(pathname)) {
                router.push('/unauthorized')
            } else if (session && publicRoutes.includes(pathname)) {
                router.push('/home')
            }
            setSession(session)
            setLoading(false)
        })
        // Empty dependency array to run only once on mount
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Sign out
    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error signing out:', error)
        } else {
            router.push('/')
        }
    }

    // Delete account
    const deleteAccount = async () => {
        try {
            if (!session) {
                return { success: false, error: 'No active session' }
            }

            const accessToken = session.access_token

            const response = await CapacitorHttp.delete({
                url: `${baseUrl}/api/delete-account`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                }
            })

            const data = response.data

            if (response.status !== 200) {
                console.error('Delete account API error:', data)
                return {
                    success: false,
                    error: data.error || 'Failed to delete account'
                }
            }

            // Sign out after successful deletion
            await supabase.auth.signOut()
            router.push('/')

            return { success: true }
        } catch (error) {
            console.error('Error deleting account:', error)
            return {
                success: false,
                error: 'Network error during account deletion'
            }
        }
    }

    return (
        <AuthContext.Provider
            value={{
                signUp,
                signIn,
                signInWithGoogle,
                signOut,
                deleteAccount,
                session,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthContextProvider')
    }
    return context
}
