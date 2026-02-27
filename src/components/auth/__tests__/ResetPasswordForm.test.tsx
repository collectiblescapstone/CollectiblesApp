import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom' // Needed for the "toBeInTheDocument" matcher
import ResetPasswordForm from '../ResetPasswordForm'
import { renderWithTheme } from '../../../utils/testing-utils'
import { supabase } from '@/lib/supabase'

// Mock Auth context and Next.js router
const signOutMock = jest.fn()
const pushMock = jest.fn()

jest.mock('../../../context/AuthProvider', () => ({
    useAuth: () => ({
        session: 'some-session',
        loading: false,
        signOut: signOutMock
    })
}))

jest.mock('../../../lib/supabase', () => ({
    supabase: {
        auth: {
            updateUser: jest.fn().mockResolvedValue({ error: null })
        }
    }
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock
    })
}))

describe('ResetPasswordForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders Sign In form if session exists', () => {
        renderWithTheme(<ResetPasswordForm />)
        expect(
            screen.getByRole('heading', { name: /reset your password/i })
        ).toBeInTheDocument()
        expect(screen.getByText(/^New Password$/i)).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText(/^enter your password$/i)
        ).toBeInTheDocument()
        expect(screen.getByText(/^Retype New Password$/i)).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText(/^re-enter your password$/i)
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^reset password$/i })
        ).toBeInTheDocument()
    })

    it('calls signOut and navigates on successful password reset', async () => {
        ;(supabase.auth.updateUser as jest.Mock).mockResolvedValue({
            error: null
        })

        renderWithTheme(<ResetPasswordForm />)
        fireEvent.change(
            screen.getByPlaceholderText(/^enter your password$/i),
            {
                target: { value: 'NewPassword123!' }
            }
        )
        fireEvent.change(
            screen.getByPlaceholderText(/^re-enter your password$/i),
            {
                target: { value: 'NewPassword123!' }
            }
        )
        fireEvent.click(
            screen.getByRole('button', { name: /^reset password$/i })
        )

        await waitFor(() => {
            expect(signOutMock).toHaveBeenCalled()
            expect(pushMock).toHaveBeenCalledWith('/sign-in')
        })
    })

    it('shows error message on password mismatch', async () => {
        renderWithTheme(<ResetPasswordForm />)
        fireEvent.change(
            screen.getByPlaceholderText(/^enter your password$/i),
            {
                target: { value: 'NewPassword123!' }
            }
        )
        fireEvent.change(
            screen.getByPlaceholderText(/^re-enter your password$/i),
            {
                target: { value: 'DifferentPassword123!' }
            }
        )
        fireEvent.click(
            screen.getByRole('button', { name: /^reset password$/i })
        )
        await waitFor(() => {
            expect(
                screen.getByText(/Passwords do not match. Please try again./i)
            ).toBeInTheDocument()
        })
    })

    it('shows error message on weak password error', async () => {
        ;(supabase.auth.updateUser as jest.Mock).mockResolvedValue({
            error: { code: 'weak_password' }
        })

        renderWithTheme(<ResetPasswordForm />)
        fireEvent.change(
            screen.getByPlaceholderText(/^enter your password$/i),
            {
                target: { value: 'weak' }
            }
        )
        fireEvent.change(
            screen.getByPlaceholderText(/^re-enter your password$/i),
            {
                target: { value: 'weak' }
            }
        )
        fireEvent.click(
            screen.getByRole('button', { name: /^reset password$/i })
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    /The password is not valid. It must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character./i
                )
            ).toBeInTheDocument()
        })
    })

    it('shows error message on same password error', async () => {
        ;(supabase.auth.updateUser as jest.Mock).mockResolvedValue({
            error: { code: 'same_password' }
        })

        renderWithTheme(<ResetPasswordForm />)
        fireEvent.change(
            screen.getByPlaceholderText(/^enter your password$/i),
            {
                target: { value: 'SamePassword123!' }
            }
        )
        fireEvent.change(
            screen.getByPlaceholderText(/^re-enter your password$/i),
            {
                target: { value: 'SamePassword123!' }
            }
        )
        fireEvent.click(
            screen.getByRole('button', { name: /^reset password$/i })
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    /New password should be different from old password./i
                )
            ).toBeInTheDocument()
        })
    })

    it('shows error message on generic reset error', async () => {
        ;(supabase.auth.updateUser as jest.Mock).mockResolvedValue({
            error: { code: 'some_other_error' }
        })

        renderWithTheme(<ResetPasswordForm />)
        fireEvent.change(
            screen.getByPlaceholderText(/^enter your password$/i),
            {
                target: { value: 'ValidPassword123!' }
            }
        )
        fireEvent.change(
            screen.getByPlaceholderText(/^re-enter your password$/i),
            {
                target: { value: 'ValidPassword123!' }
            }
        )
        fireEvent.click(
            screen.getByRole('button', { name: /^reset password$/i })
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    /There was an error sending the password reset email. Please try again later./i
                )
            ).toBeInTheDocument()
        })
    })
})
