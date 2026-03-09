import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DeleteAccount from '../DeleteAccount'
import { renderWithTheme } from '../../../utils/testing-utils'

// Mock functions
const deleteAccountMock = jest.fn()

// Mock AuthProvider
jest.mock('../../../context/AuthProvider', () => ({
    useAuth: () => ({
        deleteAccount: deleteAccountMock
    })
}))

// Mock PopupUI
const mockPopupUIOpen = jest.fn()
const mockPopupUIClose = jest.fn()

jest.mock('../../ui/PopupUI', () => ({
    __esModule: true,
    default: {
        get open() {
            return mockPopupUIOpen
        },
        get close() {
            return mockPopupUIClose
        },
        Viewport: () => null
    }
}))

describe('DeleteAccount Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Main Button', () => {
        it('renders the delete account button', () => {
            renderWithTheme(<DeleteAccount />)
            const button = screen.getByRole('button', {
                name: /delete my account/i
            })
            expect(button).toBeInTheDocument()
        })

        it('button has red color scheme', () => {
            renderWithTheme(<DeleteAccount />)
            const button = screen.getByRole('button', {
                name: /delete my account/i
            })
            // Check for red color palette class or attribute
            expect(button).toBeInTheDocument()
        })

        it('opens popup when button is clicked', () => {
            renderWithTheme(<DeleteAccount />)
            const button = screen.getByRole('button', {
                name: /delete my account/i
            })

            fireEvent.click(button)

            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'delete-account',
                expect.objectContaining({
                    title: '⚠️ Delete Account?',
                    onClickClose: expect.any(Function)
                })
            )
        })
    })

    describe('PopupUI Integration', () => {
        it('passes correct title to PopupUI', () => {
            renderWithTheme(<DeleteAccount />)
            const button = screen.getByRole('button', {
                name: /delete my account/i
            })

            fireEvent.click(button)

            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'delete-account',
                expect.objectContaining({
                    title: '⚠️ Delete Account?'
                })
            )
        })

        it('calls PopupUI.close when onClickClose is triggered', () => {
            renderWithTheme(<DeleteAccount />)
            const button = screen.getByRole('button', {
                name: /delete my account/i
            })

            fireEvent.click(button)

            // Get the onClickClose callback and call it
            const openCall = mockPopupUIOpen.mock.calls[0]
            const onClickClose = openCall[1].onClickClose

            onClickClose()

            expect(mockPopupUIClose).toHaveBeenCalledWith('delete-account')
        })
    })

    describe('DeleteAccountForm', () => {
        let formComponent: React.ReactElement

        beforeEach(() => {
            renderWithTheme(<DeleteAccount />)
            const button = screen.getByRole('button', {
                name: /delete my account/i
            })
            fireEvent.click(button)

            // Extract the form component from PopupUI.open call
            const openCall = mockPopupUIOpen.mock.calls[0]
            formComponent = openCall[1].content
        })

        it('renders warning text about permanent deletion', () => {
            renderWithTheme(formComponent)

            expect(
                screen.getByText(/this action cannot be undone/i)
            ).toBeInTheDocument()
            expect(
                screen.getByText(/collection, wishlist, and profile/i)
            ).toBeInTheDocument()
        })

        it('renders confirmation text input instruction', () => {
            renderWithTheme(formComponent)

            expect(
                screen.getByText(/to confirm, please type/i)
            ).toBeInTheDocument()
            expect(screen.getByText('delete_account')).toBeInTheDocument()
        })

        it('renders input field with correct placeholder', () => {
            renderWithTheme(formComponent)

            const input = screen.getByPlaceholderText(
                /type delete_account here/i
            )
            expect(input).toBeInTheDocument()
        })

        it('renders delete button', () => {
            renderWithTheme(formComponent)

            const deleteButton = screen.getByRole('button', {
                name: 'Delete My Account'
            })
            expect(deleteButton).toBeInTheDocument()
        })
    })

    describe('Form Validation', () => {
        let formComponent: React.ReactElement

        beforeEach(() => {
            renderWithTheme(<DeleteAccount />)
            const button = screen.getByRole('button', {
                name: /delete my account/i
            })
            fireEvent.click(button)

            const openCall = mockPopupUIOpen.mock.calls[0]
            formComponent = openCall[1].content
        })

        it('shows error when input is empty', async () => {
            renderWithTheme(formComponent)

            const deleteButton = screen.getByRole('button', {
                name: 'Delete My Account'
            })
            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(
                    screen.getByText(/this field is required/i)
                ).toBeInTheDocument()
            })

            expect(deleteAccountMock).not.toHaveBeenCalled()
        })

        it('shows error when incorrect text is entered', async () => {
            renderWithTheme(formComponent)

            const input = screen.getByPlaceholderText(
                /type delete_account here/i
            )
            const deleteButton = screen.getByRole('button', {
                name: 'Delete My Account'
            })

            fireEvent.change(input, { target: { value: 'wrong_text' } })
            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /you must type "delete_account" exactly to confirm/i
                    )
                ).toBeInTheDocument()
            })

            expect(deleteAccountMock).not.toHaveBeenCalled()
        })

        it('shows error when text is case-incorrect', async () => {
            renderWithTheme(formComponent)

            const input = screen.getByPlaceholderText(
                /type delete_account here/i
            )
            const deleteButton = screen.getByRole('button', {
                name: 'Delete My Account'
            })

            fireEvent.change(input, { target: { value: 'DELETE_ACCOUNT' } })
            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /you must type "delete_account" exactly to confirm/i
                    )
                ).toBeInTheDocument()
            })

            expect(deleteAccountMock).not.toHaveBeenCalled()
        })

        it('calls deleteAccount when correct text is entered', async () => {
            deleteAccountMock.mockResolvedValue({ success: true })

            renderWithTheme(formComponent)

            const input = screen.getByPlaceholderText(
                /type delete_account here/i
            )
            const deleteButton = screen.getByRole('button', {
                name: 'Delete My Account'
            })

            fireEvent.change(input, { target: { value: 'delete_account' } })
            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(deleteAccountMock).toHaveBeenCalledTimes(1)
            })
        })
    })

    describe('Delete Account Flow', () => {
        let formComponent: React.ReactElement

        beforeEach(() => {
            renderWithTheme(<DeleteAccount />)
            const button = screen.getByRole('button', {
                name: /delete my account/i
            })
            fireEvent.click(button)

            const openCall = mockPopupUIOpen.mock.calls[0]
            formComponent = openCall[1].content
        })

        it('shows loading state during deletion', async () => {
            deleteAccountMock.mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(() => resolve({ success: true }), 100)
                    )
            )

            renderWithTheme(formComponent)

            const input = screen.getByPlaceholderText(
                /type delete_account here/i
            )
            const deleteButton = screen.getByRole('button', {
                name: 'Delete My Account'
            })

            fireEvent.change(input, { target: { value: 'delete_account' } })
            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(
                    screen.getByText(/deleting account/i)
                ).toBeInTheDocument()
            })
        })

        it('disables input during deletion', async () => {
            deleteAccountMock.mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(() => resolve({ success: true }), 100)
                    )
            )

            renderWithTheme(formComponent)

            const input = screen.getByPlaceholderText(
                /type delete_account here/i
            ) as HTMLInputElement
            const deleteButton = screen.getByRole('button', {
                name: 'Delete My Account'
            })

            fireEvent.change(input, { target: { value: 'delete_account' } })
            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(input.disabled).toBe(true)
            })
        })

        it('calls deleteAccount from AuthProvider on success', async () => {
            deleteAccountMock.mockResolvedValue({ success: true })

            renderWithTheme(formComponent)

            const input = screen.getByPlaceholderText(
                /type delete_account here/i
            )
            const deleteButton = screen.getByRole('button', {
                name: 'Delete My Account'
            })

            fireEvent.change(input, { target: { value: 'delete_account' } })
            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(deleteAccountMock).toHaveBeenCalledTimes(1)
            })
        })

        it('displays error message when deletion fails', async () => {
            deleteAccountMock.mockResolvedValue({
                success: false,
                error: 'Failed to delete account'
            })

            renderWithTheme(formComponent)

            const input = screen.getByPlaceholderText(
                /type delete_account here/i
            )
            const deleteButton = screen.getByRole('button', {
                name: 'Delete My Account'
            })

            fireEvent.change(input, { target: { value: 'delete_account' } })
            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(
                    screen.getByText(/failed to delete account/i)
                ).toBeInTheDocument()
            })
        })

        it('displays generic error message when no error is provided', async () => {
            deleteAccountMock.mockResolvedValue({
                success: false
            })

            renderWithTheme(formComponent)

            const input = screen.getByPlaceholderText(
                /type delete_account here/i
            )
            const deleteButton = screen.getByRole('button', {
                name: 'Delete My Account'
            })

            fireEvent.change(input, { target: { value: 'delete_account' } })
            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /failed to delete account. please try again./i
                    )
                ).toBeInTheDocument()
            })
        })

        it('re-enables button after error', async () => {
            deleteAccountMock.mockResolvedValue({
                success: false,
                error: 'Network error'
            })

            renderWithTheme(formComponent)

            const input = screen.getByPlaceholderText(
                /type delete_account here/i
            )
            const deleteButton = screen.getByRole('button', {
                name: 'Delete My Account'
            })

            fireEvent.change(input, { target: { value: 'delete_account' } })
            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(screen.getByText(/network error/i)).toBeInTheDocument()
            })

            // Button should be re-enabled after error
            expect(deleteButton).not.toBeDisabled()
        })
    })
})
