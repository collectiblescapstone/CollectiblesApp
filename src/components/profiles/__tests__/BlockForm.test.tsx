import { renderWithTheme } from '@/utils/testing-utils'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import BlockForm from '../BlockForm'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush
    })
}))

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

// Mock useProfileSelected
const mockSetProfileSelected = jest.fn()

jest.mock('../../../context/ProfileSelectionProvider', () => ({
    useProfileSelected: () => ({ setProfileSelected: mockSetProfileSelected })
}))

// Import the mocked module
import { CapacitorHttp } from '@capacitor/core'
import { baseUrl } from '@/utils/constants'
const mockCapacitorHttp = CapacitorHttp as jest.Mocked<typeof CapacitorHttp>

describe('BlockForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the BlockForm component with the correct props', () => {
        const mockProps = {
            onCancel: jest.fn(),
            userId: '123'
        }

        renderWithTheme(<BlockForm {...mockProps} />)

        expect(screen.getByText('Block User')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Are you sure you want to block this user? This action cannot be undone.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' })
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Block User' })
        ).toBeInTheDocument()
    })

    it('calls onCancel when Cancel button is clicked', () => {
        const mockOnCancel = jest.fn()
        const mockProps = {
            onCancel: mockOnCancel,
            userId: '123'
        }

        renderWithTheme(<BlockForm {...mockProps} />)

        const cancelButton = screen.getByRole('button', { name: /cancel/i })
        cancelButton.click()

        expect(mockOnCancel).toHaveBeenCalled()
    })

    it('sends block request and handles success response', async () => {
        mockCapacitorHttp.post.mockResolvedValueOnce({
            status: 200,
            data: {},
            headers: {},
            url: ''
        })

        const mockOnCancel = jest.fn()
        const mockProps = {
            onCancel: mockOnCancel,
            userId: '123'
        }

        renderWithTheme(<BlockForm {...mockProps} />)

        const blockButton = screen.getByRole('button', { name: /block user/i })
        fireEvent.click(blockButton)

        await waitFor(() => {
            expect(mockCapacitorHttp.post).toHaveBeenCalledWith({
                url: `${baseUrl}/api/block-user`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${mockSession.access_token}`
                },
                data: {
                    userId: mockSession.user.id,
                    blockedUserId: '123'
                }
            })
        })

        await waitFor(() => {
            expect(mockOnCancel).toHaveBeenCalled()
            expect(mockSetProfileSelected).toHaveBeenCalledWith('')
            expect(mockPush).toHaveBeenCalledWith('/trade')
        })
    })

    it('shows an error and does not navigate on unsuccessful response', async () => {
        mockCapacitorHttp.post.mockResolvedValueOnce({
            status: 400,
            data: { error: 'Failed to block user' },
            headers: {},
            url: ''
        })

        const mockOnCancel = jest.fn()
        renderWithTheme(<BlockForm onCancel={mockOnCancel} userId="123" />)

        fireEvent.click(screen.getByRole('button', { name: /block user/i }))

        await waitFor(() => {
            expect(screen.getByText('Failed to block user')).toBeInTheDocument()
        })

        expect(mockOnCancel).not.toHaveBeenCalled()
        expect(mockSetProfileSelected).not.toHaveBeenCalled()
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('shows fallback error message when API error is missing', async () => {
        mockCapacitorHttp.post.mockResolvedValueOnce({
            status: 500,
            data: {},
            headers: {},
            url: ''
        })

        renderWithTheme(<BlockForm onCancel={jest.fn()} userId="123" />)

        fireEvent.click(screen.getByRole('button', { name: /block user/i }))

        await waitFor(() => {
            expect(screen.getByText('Unknown error')).toBeInTheDocument()
        })
    })
})
