import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ReportForm from '../ReportForm'
import { renderWithTheme } from '../../../utils/testing-utils'

// Mock CapacitorHttp
jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

// Mock useAuth
const mockSession = {
    access_token: 'test-token',
    user: { id: 'current-user-id' }
}

jest.mock('../../../context/AuthProvider', () => ({
    useAuth: () => ({ session: mockSession })
}))

// Import the mocked module
import { CapacitorHttp } from '@capacitor/core'
const mockCapacitorHttp = CapacitorHttp as jest.Mocked<typeof CapacitorHttp>

// Helper function to click Chakra checkbox by finding the control div
const clickChakraCheckbox = async (labelText: string) => {
    const label = screen.getByText(labelText)
    const checkboxRoot = label.closest('label')
    if (checkboxRoot) {
        const control = checkboxRoot.querySelector('[data-part="control"]')
        if (control) {
            await act(async () => {
                fireEvent.click(control)
            })
        }
    }
}

describe('ReportForm', () => {
    const mockCloseOnSubmit = jest.fn()
    const mockUserId = 'reported-user-123'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering', () => {
        it('renders the form with all checkbox options', () => {
            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            expect(
                screen.getByText('Verbal Abuse or Offensive Language')
            ).toBeInTheDocument()
            expect(
                screen.getByText('Spamming or Unwanted Messages')
            ).toBeInTheDocument()
            expect(
                screen.getByText('Harassment or Bullying')
            ).toBeInTheDocument()
            expect(
                screen.getByText('Scamming or Fraudulent Activity')
            ).toBeInTheDocument()
            expect(
                screen.getByText('Inappropriate Name or Username')
            ).toBeInTheDocument()
            expect(
                screen.getByText('Inappropriate Profile Bio')
            ).toBeInTheDocument()
        })

        it('renders the reason textarea', () => {
            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            expect(screen.getByText('Reason for Report')).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText(
                    'Please provide additional details about your report'
                )
            ).toBeInTheDocument()
        })

        it('renders submit and cancel buttons', () => {
            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            expect(
                screen.getByRole('button', { name: 'Submit Report' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Cancel' })
            ).toBeInTheDocument()
        })
    })

    describe('Cancel Button', () => {
        it('calls closeOnSubmit when cancel button is clicked', () => {
            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

            expect(mockCloseOnSubmit).toHaveBeenCalledTimes(1)
        })
    })

    describe('Form Validation', () => {
        it('shows error when no checkbox is selected and form is submitted', async () => {
            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            // Fill in reason but don't select any checkbox
            const textarea = screen.getByPlaceholderText(
                'Please provide additional details about your report'
            )
            fireEvent.change(textarea, {
                target: { value: 'This is a valid reason for reporting' }
            })

            fireEvent.click(
                screen.getByRole('button', { name: 'Submit Report' })
            )

            await waitFor(() => {
                expect(
                    screen.getByText('Please select at least one report type')
                ).toBeInTheDocument()
            })
        })

        it('shows error when reason is too short', async () => {
            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            // Enter a short reason
            const textarea = screen.getByPlaceholderText(
                'Please provide additional details about your report'
            )
            fireEvent.change(textarea, { target: { value: 'Short' } })

            fireEvent.click(
                screen.getByRole('button', { name: 'Submit Report' })
            )

            await waitFor(() => {
                expect(
                    screen.getByText('Reason must be at least 10 characters')
                ).toBeInTheDocument()
            })
        })

        it('shows error when reason is empty', async () => {
            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            fireEvent.click(
                screen.getByRole('button', { name: 'Submit Report' })
            )

            await waitFor(() => {
                expect(
                    screen.getByText('Reason is required')
                ).toBeInTheDocument()
            })
        })
    })

    describe('Form Submission', () => {
        it('calls API on valid form submission', async () => {
            mockCapacitorHttp.post.mockResolvedValueOnce({
                status: 200,
                data: {},
                headers: {},
                url: ''
            })

            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            // Click checkbox control to trigger the Chakra checkbox state change
            await clickChakraCheckbox('Verbal Abuse or Offensive Language')

            // Enter valid reason
            const textarea = screen.getByPlaceholderText(
                'Please provide additional details about your report'
            )
            await act(async () => {
                fireEvent.change(textarea, {
                    target: {
                        value: 'This user has been very abusive and rude'
                    }
                })
            })

            await act(async () => {
                fireEvent.click(
                    screen.getByRole('button', { name: 'Submit Report' })
                )
            })

            await waitFor(() => {
                expect(mockCapacitorHttp.post).toHaveBeenCalled()
            })
        })

        it('shows success message after successful submission', async () => {
            mockCapacitorHttp.post.mockResolvedValueOnce({
                status: 200,
                data: {},
                headers: {},
                url: ''
            })

            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            await clickChakraCheckbox('Spamming or Unwanted Messages')

            const textarea = screen.getByPlaceholderText(
                'Please provide additional details about your report'
            )
            await act(async () => {
                fireEvent.change(textarea, {
                    target: { value: 'This user keeps sending spam messages' }
                })
            })

            await act(async () => {
                fireEvent.click(
                    screen.getByRole('button', { name: 'Submit Report' })
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Report submitted successfully')
                ).toBeInTheDocument()
            })
        })

        it('shows error on server failure with error message', async () => {
            mockCapacitorHttp.post.mockResolvedValueOnce({
                status: 500,
                data: { error: 'Server error occurred' },
                headers: {},
                url: ''
            })

            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            await clickChakraCheckbox('Harassment or Bullying')

            const textarea = screen.getByPlaceholderText(
                'Please provide additional details about your report'
            )
            await act(async () => {
                fireEvent.change(textarea, {
                    target: { value: 'This user has been harassing others' }
                })
            })

            await act(async () => {
                fireEvent.click(
                    screen.getByRole('button', { name: 'Submit Report' })
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Server error occurred')
                ).toBeInTheDocument()
            })
        })

        it('shows default error message when server returns no error', async () => {
            mockCapacitorHttp.post.mockResolvedValueOnce({
                status: 400,
                data: {},
                headers: {},
                url: ''
            })

            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            await clickChakraCheckbox('Scamming or Fraudulent Activity')

            const textarea = screen.getByPlaceholderText(
                'Please provide additional details about your report'
            )
            await act(async () => {
                fireEvent.change(textarea, {
                    target: {
                        value: 'This user tried to scam me with fake cards'
                    }
                })
            })

            await act(async () => {
                fireEvent.click(
                    screen.getByRole('button', { name: 'Submit Report' })
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Failed to submit report')
                ).toBeInTheDocument()
            })
        })

        it('shows error on network exception', async () => {
            mockCapacitorHttp.post.mockRejectedValueOnce(
                new Error('Network error')
            )

            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            await clickChakraCheckbox('Inappropriate Name or Username')

            const textarea = screen.getByPlaceholderText(
                'Please provide additional details about your report'
            )
            await act(async () => {
                fireEvent.change(textarea, {
                    target: {
                        value: 'This user has inappropriate username content'
                    }
                })
            })

            await act(async () => {
                fireEvent.click(
                    screen.getByRole('button', { name: 'Submit Report' })
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'An error occurred while submitting the report'
                    )
                ).toBeInTheDocument()
            })
        })
    })

    describe('Checkbox Interactions', () => {
        it('renders all six checkbox options', () => {
            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            const checkboxes = screen.getAllByRole('checkbox')
            expect(checkboxes).toHaveLength(6)
        })
    })

    describe('Textarea Interactions', () => {
        it('allows typing in the textarea', () => {
            renderWithTheme(
                <ReportForm
                    closeOnSubmit={mockCloseOnSubmit}
                    userId={mockUserId}
                />
            )

            const textarea = screen.getByPlaceholderText(
                'Please provide additional details about your report'
            )

            fireEvent.change(textarea, {
                target: { value: 'This is my report reason' }
            })

            expect(textarea).toHaveValue('This is my report reason')
        })
    })
})
