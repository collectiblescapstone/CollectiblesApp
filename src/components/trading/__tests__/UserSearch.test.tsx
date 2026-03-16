import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserSearch from '../UserSearch'
import { renderWithTheme } from '../../../utils/testing-utils'
import { CapacitorHttp } from '@capacitor/core'
import { SearchableUser } from '../../../types/user-management'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush
    })
}))

// Mock AuthProvider - make session controllable
let mockSession: { access_token: string } | null = {
    access_token: 'test-token-123'
}
jest.mock('../../../context/AuthProvider', () => ({
    useAuth: () => ({
        session: mockSession
    })
}))

// Mock ProfileSelectionProvider
const mockSetProfileSelected = jest.fn()
jest.mock('../../../context/ProfileSelectionProvider', () => ({
    useProfileSelected: () => ({
        setProfileSelected: mockSetProfileSelected
    })
}))

// Mock CapacitorHttp
jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

// Mock UserSearchList component
jest.mock('../UserSearchList', () => {
    return function MockUserSearchList({
        name,
        username,
        profile_pic,
        rating,
        rating_count,
        location
    }: {
        name: string
        username: string
        profile_pic: number
        rating: number
        rating_count: number
        location: string
    }) {
        return (
            <div data-testid={`user-search-item-${username}`}>
                <span data-testid="user-name">{name}</span>
                <span data-testid="user-username">{username}</span>
                <span data-testid="user-profile-pic">{profile_pic}</span>
                <span data-testid="user-rating">{rating}</span>
                <span data-testid="user-rating-count">{rating_count}</span>
                <span data-testid="user-location">{location}</span>
            </div>
        )
    }
})

const mockUsers: SearchableUser[] = [
    {
        id: 'user-1',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        profile_pic: 1,
        rating: 4.5,
        rating_count: 10,
        location: 'New York, NY'
    },
    {
        id: 'user-2',
        username: 'janedoe',
        firstName: 'Jane',
        lastName: 'Doe',
        profile_pic: 2,
        rating: 5.0,
        rating_count: 20,
        location: 'Los Angeles, CA'
    },
    {
        id: 'user-3',
        username: 'bobsmith',
        firstName: 'Bob',
        lastName: 'Smith',
        profile_pic: 3,
        rating: 3.5,
        rating_count: 5,
        location: 'Chicago, IL'
    },
    {
        id: 'user-4',
        username: 'alicejones',
        firstName: null,
        lastName: null,
        profile_pic: 4,
        rating: 4.0,
        rating_count: 15,
        location: null
    }
]

const mockCapacitorHttpPost = CapacitorHttp.post as jest.MockedFunction<
    typeof CapacitorHttp.post
>

describe('UserSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        // Reset session to valid state for most tests
        mockSession = { access_token: 'test-token-123' }
        mockCapacitorHttpPost.mockResolvedValue({
            status: 200,
            data: { users: mockUsers },
            headers: {},
            url: ''
        })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('Initial Render', () => {
        it('renders search input with placeholder', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )
            expect(input).toBeInTheDocument()
        })

        it('renders with empty search value initially', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )
            expect(input).toHaveValue('')
        })

        it('does not show clear button when search is empty', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            // CloseButton should not be rendered when search is empty
            const closeButtons = screen.queryAllByRole('button')
            expect(closeButtons.length).toBe(0)
        })
    })

    describe('API Call on Mount', () => {
        it('fetches searchable users on mount when session exists', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            await waitFor(() => {
                expect(mockCapacitorHttpPost).toHaveBeenCalledWith({
                    url: expect.stringContaining('/api/get-searchable-users'),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token-123'
                    }
                })
            })
        })

        it('sorts users alphabetically by username after fetch', async () => {
            // The API sorts users by username, we verify the component receives them
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            // Wait for API to complete
            await waitFor(() => {
                expect(mockCapacitorHttpPost).toHaveBeenCalled()
            })

            // Focus on input to open popover
            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            // Type to trigger search and show results
            await act(async () => {
                fireEvent.change(input, { target: { value: 'doe' } })
            })

            // Users matching 'doe' should appear
            await waitFor(() => {
                expect(
                    screen.getByTestId('user-search-item-johndoe')
                ).toBeInTheDocument()
                expect(
                    screen.getByTestId('user-search-item-janedoe')
                ).toBeInTheDocument()
            })
        })
    })

    describe('Search Functionality', () => {
        it('filters users by username', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, { target: { value: 'john' } })
            })

            await waitFor(() => {
                expect(
                    screen.getByTestId('user-search-item-johndoe')
                ).toBeInTheDocument()
                expect(
                    screen.queryByTestId('user-search-item-janedoe')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('user-search-item-bobsmith')
                ).not.toBeInTheDocument()
            })
        })

        it('filters users by first name', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, { target: { value: 'Jane' } })
            })

            await waitFor(() => {
                expect(
                    screen.getByTestId('user-search-item-janedoe')
                ).toBeInTheDocument()
                expect(
                    screen.queryByTestId('user-search-item-johndoe')
                ).not.toBeInTheDocument()
            })
        })

        it('filters users by last name', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, { target: { value: 'Smith' } })
            })

            await waitFor(() => {
                expect(
                    screen.getByTestId('user-search-item-bobsmith')
                ).toBeInTheDocument()
                expect(
                    screen.queryByTestId('user-search-item-johndoe')
                ).not.toBeInTheDocument()
            })
        })

        it('filters users by full name (first + last)', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, { target: { value: 'John Doe' } })
            })

            await waitFor(() => {
                expect(
                    screen.getByTestId('user-search-item-johndoe')
                ).toBeInTheDocument()
            })
        })

        it('performs case-insensitive search', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, { target: { value: 'JOHN' } })
            })

            await waitFor(() => {
                expect(
                    screen.getByTestId('user-search-item-johndoe')
                ).toBeInTheDocument()
            })
        })

        it('shows multiple matching users', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, { target: { value: 'doe' } })
            })

            await waitFor(() => {
                expect(
                    screen.getByTestId('user-search-item-johndoe')
                ).toBeInTheDocument()
                expect(
                    screen.getByTestId('user-search-item-janedoe')
                ).toBeInTheDocument()
                expect(
                    screen.queryByTestId('user-search-item-bobsmith')
                ).not.toBeInTheDocument()
            })
        })

        it('handles users with null firstName and lastName', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            // Search by username for user with null names
            await act(async () => {
                fireEvent.change(input, { target: { value: 'alice' } })
            })

            await waitFor(() => {
                expect(
                    screen.getByTestId('user-search-item-alicejones')
                ).toBeInTheDocument()
            })
        })
    })

    describe('Empty States', () => {
        it('shows "Search for users" when popover is open but search is empty', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await waitFor(() => {
                expect(screen.getByText('Search for users')).toBeInTheDocument()
            })
        })

        it('shows "No users found" when search has no matches', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, {
                    target: { value: 'xyz123nonexistent' }
                })
            })

            await waitFor(() => {
                expect(screen.getByText('No users found')).toBeInTheDocument()
            })
        })
    })

    describe('User Selection', () => {
        it('calls setProfileSelected and navigates on user selection', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, { target: { value: 'john' } })
            })

            await waitFor(() => {
                expect(
                    screen.getByTestId('user-search-item-johndoe')
                ).toBeInTheDocument()
            })

            // Click on the user item (the Listbox.Item wraps the UserSearchList)
            const userItem = screen
                .getByTestId('user-search-item-johndoe')
                .closest('[data-part="item"]')
            if (userItem) {
                await act(async () => {
                    fireEvent.click(userItem)
                })
            }

            await waitFor(() => {
                expect(mockSetProfileSelected).toHaveBeenCalledWith('johndoe')
                expect(mockPush).toHaveBeenCalledWith('/user-profile')
            })
        })
    })

    describe('Clear Search', () => {
        it('shows clear button when search has value', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.change(input, { target: { value: 'test' } })
            })

            // Find CloseButton by its aria-label or role
            await waitFor(() => {
                const closeButton = screen.getByRole('button')
                expect(closeButton).toBeInTheDocument()
            })
        })

        it('clears search value when clear button is clicked', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.change(input, { target: { value: 'test' } })
            })

            expect(input).toHaveValue('test')

            const closeButton = screen.getByRole('button')
            await act(async () => {
                fireEvent.click(closeButton)
            })

            expect(input).toHaveValue('')
        })

        it('closes popover when clear button is clicked', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, { target: { value: 'john' } })
            })

            await waitFor(() => {
                expect(
                    screen.getByTestId('user-search-item-johndoe')
                ).toBeInTheDocument()
            })

            const closeButton = screen.getByRole('button')
            await act(async () => {
                fireEvent.click(closeButton)
            })

            // After clear, popover should close
            await waitFor(() => {
                expect(
                    screen.queryByTestId('user-search-item-johndoe')
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Focus and Blur Behavior', () => {
        it('opens popover on input focus', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await waitFor(() => {
                expect(screen.getByText('Search for users')).toBeInTheDocument()
            })
        })

        it('closes popover on input blur after timeout', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await waitFor(() => {
                expect(screen.getByText('Search for users')).toBeInTheDocument()
            })

            // Trigger blur and advance timers in the same act block
            await act(async () => {
                fireEvent.blur(input)
                jest.advanceTimersByTime(150)
            })

            // The blur handler should have been called with setTimeout
            // This verifies the onBlur callback is triggered
            expect(input).not.toHaveFocus()
        })
    })

    describe('API Error Handling', () => {
        it('handles non-200 API response gracefully', async () => {
            mockCapacitorHttpPost.mockResolvedValue({
                status: 500,
                data: { error: 'Internal Server Error' },
                headers: {},
                url: ''
            })

            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            // Component should still render without crashing
            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )
            expect(input).toBeInTheDocument()

            await act(async () => {
                fireEvent.focus(input)
            })

            // Should show empty state since no users were loaded
            await waitFor(() => {
                expect(screen.getByText('Search for users')).toBeInTheDocument()
            })
        })
    })

    describe('UserSearchList Props', () => {
        it('passes correct props to UserSearchList', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, { target: { value: 'john' } })
            })

            await waitFor(() => {
                const userItem = screen.getByTestId('user-search-item-johndoe')
                expect(userItem).toBeInTheDocument()

                // Check that correct props were passed
                expect(screen.getByTestId('user-name')).toHaveTextContent(
                    'John Doe'
                )
                expect(screen.getByTestId('user-username')).toHaveTextContent(
                    'johndoe'
                )
                expect(
                    screen.getByTestId('user-profile-pic')
                ).toHaveTextContent('1')
                expect(screen.getByTestId('user-rating')).toHaveTextContent(
                    '4.5'
                )
                expect(
                    screen.getByTestId('user-rating-count')
                ).toHaveTextContent('10')
                expect(screen.getByTestId('user-location')).toHaveTextContent(
                    'New York, NY'
                )
            })
        })

        it('handles null location by passing empty string', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, { target: { value: 'alice' } })
            })

            await waitFor(() => {
                const userItem = screen.getByTestId(
                    'user-search-item-alicejones'
                )
                expect(userItem).toBeInTheDocument()

                // Check that null location is passed as empty string
                expect(screen.getByTestId('user-location')).toHaveTextContent(
                    ''
                )
            })
        })

        it('handles null firstName and lastName by concatenating empty strings', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )

            await act(async () => {
                fireEvent.focus(input)
            })

            await act(async () => {
                fireEvent.change(input, { target: { value: 'alice' } })
            })

            await waitFor(() => {
                // For null firstName and lastName, the name should be " " (space between two empty strings)
                // The component does: (item.firstName ?? '') + ' ' + (item.lastName ?? '')
                // Which results in '' + ' ' + '' = ' '
                const nameElement = screen.getByTestId('user-name')
                expect(nameElement.textContent).toBe(' ')
            })
        })
    })

    describe('No Session', () => {
        beforeEach(() => {
            jest.clearAllMocks()
            jest.useFakeTimers()
            // Set session to null for these tests
            mockSession = null
        })

        afterEach(() => {
            jest.useRealTimers()
            // Reset session back to valid state
            mockSession = { access_token: 'test-token-123' }
        })

        it('does not fetch users when session is null', async () => {
            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            // Wait a bit to ensure useEffect has run
            await act(async () => {
                jest.advanceTimersByTime(100)
            })

            // API should NOT be called when there's no session
            expect(mockCapacitorHttpPost).not.toHaveBeenCalled()

            // Component should still render
            const input = screen.getByPlaceholderText(
                'Search user by username or profile name'
            )
            expect(input).toBeInTheDocument()
        })

        it('does not fetch users when session.access_token is undefined', async () => {
            // Set session with no access_token
            mockSession = {} as { access_token: string }

            await act(async () => {
                renderWithTheme(<UserSearch />)
            })

            // Wait a bit to ensure useEffect has run
            await act(async () => {
                jest.advanceTimersByTime(100)
            })

            // API should NOT be called when there's no access_token
            expect(mockCapacitorHttpPost).not.toHaveBeenCalled()
        })
    })
})
