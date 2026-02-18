import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom' // Needed for the "toBeInTheDocument" matcher
import RegistrationForm from '../RegistrationForm'
import { renderWithTheme } from '../../../utils/testing-utils'
import { CapacitorHttp } from '@capacitor/core'

// Mock Auth context and Next.js router
const signUpMock = jest.fn()
const pushMock = jest.fn()

jest.mock('../../../context/AuthProvider', () => ({
    useAuth: () => ({
        signUp: signUpMock
    })
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock
    })
}))

jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

jest.mock('../../../utils/profiles/userNameProfilePuller', () => ({
    fetchUserProfile: jest.fn().mockResolvedValue({ email: 'test@example.com' })
}))

describe('RegistrationForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders Sign In form if session exists', () => {
        renderWithTheme(<RegistrationForm />)
        expect(
            screen.getByRole('heading', { name: /sign up for an account/i })
        ).toBeInTheDocument()
        expect(screen.getByText(/^email$/i)).toBeInTheDocument()
        expect(screen.getByText(/^username$/i)).toBeInTheDocument()
        expect(screen.getByText(/^first name$/i)).toBeInTheDocument()
        expect(screen.getByText(/^last name$/i)).toBeInTheDocument()
        expect(screen.getByText(/^password$/i)).toBeInTheDocument()
        expect(screen.getByText(/^retype password$/i)).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^sign up$/i })
        ).toBeInTheDocument()
    })

    it('calls signUp and navigates on successful registration', async () => {
        signUpMock.mockResolvedValue({
            success: true,
            data: { user: { id: 'user-id' } }
        })
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            ok: true,
            data: { success: true }
        })

        renderWithTheme(<RegistrationForm />)
        fireEvent.change(
            screen.getByPlaceholderText(/enter your username or email/i),
            {
                target: { value: 'test@email.com' }
            }
        )
        fireEvent.change(screen.getByPlaceholderText(/my_username/i), {
            target: { value: 'testuser' }
        })
        fireEvent.change(screen.getByPlaceholderText(/first name/i), {
            target: { value: 'Test' }
        })
        fireEvent.change(screen.getByPlaceholderText(/last name/i), {
            target: { value: 'User' }
        })
        fireEvent.change(
            screen.getByPlaceholderText(/^enter your password$/i),
            {
                target: { value: 'password123' }
            }
        )
        fireEvent.change(
            screen.getByPlaceholderText(/^re-enter your password$/i),
            {
                target: { value: 'password123' }
            }
        )
        fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

        await waitFor(() => {
            expect(signUpMock).toHaveBeenCalledWith(
                'test@email.com',
                'password123'
            )
            expect(pushMock).toHaveBeenCalledWith('/sign-in')
        })
    })

    it('shows error message on password mismatch', async () => {
        renderWithTheme(<RegistrationForm />)
        fireEvent.change(
            screen.getByPlaceholderText(/enter your username or email/i),
            {
                target: { value: 'test@email.com' }
            }
        )
        fireEvent.change(screen.getByPlaceholderText(/my_username/i), {
            target: { value: 'testuser' }
        })
        fireEvent.change(
            screen.getByPlaceholderText(/^enter your password$/i),
            {
                target: { value: 'password123' }
            }
        )
        fireEvent.change(
            screen.getByPlaceholderText(/^re-enter your password$/i),
            {
                target: { value: 'differentPassword' }
            }
        )
        fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

        await waitFor(() => {
            expect(
                screen.getByText(/Passwords do not match. Please try again./i)
            ).toBeInTheDocument()
        })
    })

    it('shows error message on username already taken', async () => {
        signUpMock.mockResolvedValue({
            success: true,
            data: { user: { id: 'user-id' } }
        })
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            ok: true,
            data: {
                error: true,
                message: { code: 'P2002' }
            }
        })

        renderWithTheme(<RegistrationForm />)
        fireEvent.change(
            screen.getByPlaceholderText(/enter your username or email/i),
            {
                target: { value: 'test@email.com' }
            }
        )
        fireEvent.change(screen.getByPlaceholderText(/my_username/i), {
            target: { value: 'testuser' }
        })
        fireEvent.change(
            screen.getByPlaceholderText(/^enter your password$/i),
            {
                target: { value: 'password123' }
            }
        )
        fireEvent.change(
            screen.getByPlaceholderText(/^re-enter your password$/i),
            {
                target: { value: 'password123' }
            }
        )
        fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

        await waitFor(() => {
            expect(
                screen.getByText(
                    /An account with this username already exists. Please pick a different username./i
                )
            ).toBeInTheDocument()
        })
    })

    it('shows error message on existing user failure', async () => {
        signUpMock.mockResolvedValue({
            success: false,
            error: { code: 'user_already_exists' }
        })

        renderWithTheme(<RegistrationForm />)
        fireEvent.change(
            screen.getByPlaceholderText(/enter your username or email/i),
            {
                target: { value: 'test@email.com' }
            }
        )
        fireEvent.change(screen.getByPlaceholderText(/my_username/i), {
            target: { value: 'testuser' }
        })
        fireEvent.change(
            screen.getByPlaceholderText(/^enter your password$/i),
            {
                target: { value: 'password123' }
            }
        )
        fireEvent.change(
            screen.getByPlaceholderText(/^re-enter your password$/i),
            {
                target: { value: 'password123' }
            }
        )
        fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

        await waitFor(() => {
            expect(
                screen.getByText(
                    /An account with this email already exists. Please sign in or reset your password./i
                )
            ).toBeInTheDocument()
        })
    })

    it('shows error message on weak password failure', async () => {
        signUpMock.mockResolvedValue({
            success: false,
            error: { code: 'weak_password' }
        })

        renderWithTheme(<RegistrationForm />)
        fireEvent.change(
            screen.getByPlaceholderText(/enter your username or email/i),
            {
                target: { value: 'test@email.com' }
            }
        )
        fireEvent.change(screen.getByPlaceholderText(/my_username/i), {
            target: { value: 'testuser' }
        })
        fireEvent.change(
            screen.getByPlaceholderText(/^enter your password$/i),
            {
                target: { value: 'password123' }
            }
        )
        fireEvent.change(
            screen.getByPlaceholderText(/^re-enter your password$/i),
            {
                target: { value: 'password123' }
            }
        )
        fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

        await waitFor(() => {
            expect(
                screen.getByText(
                    /The password is not valid. It must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character./i
                )
            ).toBeInTheDocument()
        })
    })

    it('shows error message on any other error', async () => {
        signUpMock.mockResolvedValue({
            success: false,
            error: { code: 'unknown_error' }
        })

        renderWithTheme(<RegistrationForm />)
        fireEvent.change(
            screen.getByPlaceholderText(/enter your username or email/i),
            {
                target: { value: 'test@email.com' }
            }
        )
        fireEvent.change(screen.getByPlaceholderText(/my_username/i), {
            target: { value: 'testuser' }
        })
        fireEvent.change(
            screen.getByPlaceholderText(/^enter your password$/i),
            {
                target: { value: 'password123' }
            }
        )
        fireEvent.change(
            screen.getByPlaceholderText(/^re-enter your password$/i),
            {
                target: { value: 'password123' }
            }
        )
        fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))

        await waitFor(() => {
            expect(
                screen.getByText(
                    /An unexpected error occurred. Please try again./i
                )
            ).toBeInTheDocument()
        })
    })
})
