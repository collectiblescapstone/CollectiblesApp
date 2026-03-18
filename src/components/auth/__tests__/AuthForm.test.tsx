import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthForm from '../AuthForm'
import { renderWithTheme } from '../../../utils/testing-utils'

// --------------------
// Mock Auth context
// --------------------
const signInMock = jest.fn()
const signInWithGoogleMock = jest.fn()

jest.mock('../../../context/AuthProvider', () => ({
    useAuth: () => ({
        signIn: signInMock,
        signInWithGoogle: signInWithGoogleMock
    })
}))

// --------------------
// Mock Next.js router
// --------------------
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: pushMock }),
    useSearchParams: () => ({ get: jest.fn() })
}))

// --------------------
// Mock fetchUserProfile
// --------------------
jest.mock('../../../utils/profiles/userNameProfilePuller', () => ({
    fetchUserProfile: jest.fn().mockResolvedValue({ email: 'test@example.com' })
}))

// --------------------
// Mock Logo SVG
// --------------------
jest.mock('@/components/logo/Logo', () => ({
    Logo: () => <svg data-testid="logo" />
}))

// --------------------
// Tests
// --------------------
describe('AuthForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the logo', () => {
        renderWithTheme(<AuthForm />)
        expect(screen.getByTestId('logo')).toBeInTheDocument()
    })

    it('renders Sign In form', () => {
        renderWithTheme(<AuthForm />)
        expect(screen.getByTestId('logo')).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { name: /sign in to your account/i })
        ).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText(/me@example.com/i)
        ).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText(/enter your password/i)
        ).toBeInTheDocument()
        expect(screen.getByText(/forgot your password?/i)).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^sign in$/i })
        ).toBeInTheDocument()
        expect(screen.getAllByText('OR', { exact: true })).toHaveLength(2)
        expect(
            screen.getByRole('button', { name: /sign in with google/i })
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^sign up$/i })
        ).toBeInTheDocument()
    })

    it('redirects to forgot password page on link click', async () => {
        renderWithTheme(<AuthForm />)
        fireEvent.click(screen.getByText(/forgot your password?/i))

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/forget-password')
        })
    })

    it('calls signIn and navigates on successful login', async () => {
        signInMock.mockResolvedValue({ success: true })

        renderWithTheme(<AuthForm />)
        fireEvent.change(screen.getByPlaceholderText(/me@example.com/i), {
            target: { value: 'test@example.com' }
        })
        fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
            target: { value: 'password123' }
        })
        fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

        await waitFor(() => {
            expect(signInMock).toHaveBeenCalledWith(
                'test@example.com',
                'password123'
            )
            expect(pushMock).toHaveBeenCalledWith('/home')
        })
    })

    it('shows error message on invalid credentials', async () => {
        signInMock.mockResolvedValue({
            success: false,
            error: 'Invalid login credentials'
        })

        renderWithTheme(<AuthForm />)
        fireEvent.change(screen.getByPlaceholderText(/me@example.com/i), {
            target: { value: 'wrong@example.com' }
        })
        fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
            target: { value: 'wrongpass' }
        })
        fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

        await waitFor(() => {
            expect(pushMock).not.toHaveBeenCalled()
            expect(
                screen.getByText(
                    /an account doesn't exist with this email\/username/i
                )
            ).toBeInTheDocument()
        })
    })

    it('shows error message on unconfirmed email', async () => {
        signInMock.mockResolvedValue({
            success: false,
            error: 'Email not confirmed'
        })

        renderWithTheme(<AuthForm />)
        fireEvent.change(screen.getByPlaceholderText(/me@example.com/i), {
            target: { value: 'wrong@example.com' }
        })
        fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
            target: { value: 'wrongpass' }
        })
        fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

        await waitFor(() => {
            expect(pushMock).not.toHaveBeenCalled()
            expect(
                screen.getByText(/your email address has not been confirmed/i)
            ).toBeInTheDocument()
        })
    })

    it('shows error message on unknown error', async () => {
        signInMock.mockResolvedValue({
            success: false,
            error: 'Any other error'
        })

        renderWithTheme(<AuthForm />)
        fireEvent.change(screen.getByPlaceholderText(/me@example.com/i), {
            target: { value: 'wrong@example.com' }
        })
        fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
            target: { value: 'wrongpass' }
        })
        fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

        await waitFor(() => {
            expect(pushMock).not.toHaveBeenCalled()
            expect(
                screen.getByText(/an unknown error occurred/i)
            ).toBeInTheDocument()
        })
    })

    it('redirects to sign-up page on Sign Up button click', async () => {
        renderWithTheme(<AuthForm />)
        fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/sign-up')
        })
    })

    it('handles Google sign-in button click', async () => {
        signInWithGoogleMock.mockResolvedValue({ success: true })

        renderWithTheme(<AuthForm />)
        const googleButton = screen.getByRole('button', {
            name: /sign in with google/i
        })
        fireEvent.click(googleButton)

        await waitFor(() => expect(signInWithGoogleMock).toHaveBeenCalled())
    })

    it('handles error on Google sign-in button click', async () => {
        signInWithGoogleMock.mockResolvedValue({ success: false })

        renderWithTheme(<AuthForm />)
        const googleButton = screen.getByRole('button', {
            name: /sign in with google/i
        })
        fireEvent.click(googleButton)

        await waitFor(() => {
            expect(signInWithGoogleMock).toHaveBeenCalled()
            expect(
                screen.getByText(/an error occurred during google sign in/i)
            ).toBeInTheDocument()
        })
    })
})
