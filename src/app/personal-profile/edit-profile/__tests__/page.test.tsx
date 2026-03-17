import '@testing-library/jest-dom'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PersonalProfileScreen from '../page'
import { useAuth } from '@/context/AuthProvider'
import { renderWithTheme } from '@/utils/testing-utils'
import { fetchUserProfile } from '@/utils/profiles/userIDProfilePuller'
import { UserProfile, VisibilityValues } from '@/types/personal-profile'
import { CapacitorHttp } from '@capacitor/core'
import AvatarPopup from '@/components/ui/PopupUI'

jest.mock('../../../../context/AuthProvider.tsx', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

jest.mock('../../../../utils/profiles/userIDProfilePuller', () => ({
    fetchUserProfile: jest.fn()
}))

const mockRouterPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockRouterPush
    })
}))

jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        patch: jest.fn(),
        post: jest.fn()
    }
}))

jest.mock('../../../../components/edit-profile/DeleteAccount.tsx', () => ({
    __esModule: true,
    default: () => <div data-testid="delete-account">Delete Account</div>
}))

jest.mock('../../../../components/ui/PopupUI.tsx', () => ({
    __esModule: true,
    default: {
        open: jest.fn(),
        close: jest.fn(),
        Viewport: () => <div data-testid="avatar-popup-viewport" />
    }
}))

const mockedAvatarPopup = AvatarPopup as jest.Mocked<typeof AvatarPopup>

const mockedUseAuth = useAuth as jest.Mock
const mockedFetchUserProfile = jest.mocked(fetchUserProfile)
const mockedCapacitorHttp = CapacitorHttp as jest.Mocked<typeof CapacitorHttp>

const createMockUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    id: 'user-1',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    bio: 'Test bio',
    location: 'Test Location',
    longitude: -79.3832,
    latitude: 43.6532,
    instagram: 'testinsta',
    x: 'testx',
    facebook: 'testfb',
    discord: 'testdiscord',
    whatsapp: '1234567890',
    profile_pic: 1,
    visibility: VisibilityValues.Public,
    rating: 4.5,
    rating_count: 10,
    wishlist: [],
    tradeList: [],
    showcaseList: [],
    ...overrides
})

const mockSignOut = jest.fn()

describe('PersonalProfileScreen (Edit Profile)', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockRouterPush.mockClear()
    })

    it('renders loading spinner when session is not available', () => {
        mockedUseAuth.mockReturnValue({
            session: null,
            loading: false,
            signOut: mockSignOut
        })

        renderWithTheme(<PersonalProfileScreen />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders loading spinner while auth is loading', () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: true,
            signOut: mockSignOut
        })

        renderWithTheme(<PersonalProfileScreen />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders loading spinner while user data is loading', () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockImplementation(() => new Promise(() => {}))

        renderWithTheme(<PersonalProfileScreen />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders form with user data when profile is loaded', async () => {
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('First Name')).toBeInTheDocument()
        })

        expect(screen.getByText('Last Name')).toBeInTheDocument()
        expect(screen.getByText('Username')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Bio')).toBeInTheDocument()
        expect(screen.getByText('Location')).toBeInTheDocument()
        expect(screen.getByText('Instagram')).toBeInTheDocument()
        expect(screen.getByText('Twitter/X')).toBeInTheDocument()
        expect(screen.getByText('Facebook')).toBeInTheDocument()
        expect(screen.getByText('WhatsApp')).toBeInTheDocument()
        expect(screen.getByText('Discord')).toBeInTheDocument()
        expect(screen.getByText('Public Visibility')).toBeInTheDocument()
    })

    it('renders sign out button', async () => {
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Sign out')).toBeInTheDocument()
        })
    })

    it('calls signOut when sign out button is clicked', async () => {
        const user = userEvent.setup()
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Sign out')).toBeInTheDocument()
        })

        const signOutButton = screen.getByText('Sign out')
        await user.click(signOutButton)

        expect(mockSignOut).toHaveBeenCalled()
    })

    it('renders delete account component', async () => {
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByTestId('delete-account')).toBeInTheDocument()
        })
    })

    it('renders save button', async () => {
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Save')).toBeInTheDocument()
        })
    })

    it('navigates to wishlist edit when wishlist button is clicked', async () => {
        const user = userEvent.setup()
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Wish List')).toBeInTheDocument()
        })

        const editButtons = screen.getAllByText('Edit')
        // The second "Edit" button is for wishlist
        await user.click(editButtons[0])

        expect(mockRouterPush).toHaveBeenCalledWith(
            '/personal-profile/edit-profile/wishlist'
        )
    })

    it('saves profile successfully and navigates back', async () => {
        const user = userEvent.setup()
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)
        mockedCapacitorHttp.patch.mockResolvedValue({
            status: 200,
            data: { success: true },
            headers: {},
            url: ''
        })

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Save')).toBeInTheDocument()
        })

        const saveButton = screen.getByText('Save')
        await user.click(saveButton)

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/personal-profile')
        })
    })

    it('shows error when username is already taken', async () => {
        const user = userEvent.setup()
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)
        mockedCapacitorHttp.patch.mockResolvedValue({
            status: 400,
            data: { error: { code: 'P2002' } },
            headers: {},
            url: ''
        })

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Save')).toBeInTheDocument()
        })

        const saveButton = screen.getByText('Save')
        await user.click(saveButton)

        await waitFor(() => {
            expect(
                screen.getByText(
                    'An account with this username already exists. Please pick a different username.'
                )
            ).toBeInTheDocument()
        })
    })

    it('renders bio character counter', async () => {
        const mockUser = createMockUser({ bio: 'Hello' })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('5 / 110')).toBeInTheDocument()
        })
    })

    it('renders visibility options', async () => {
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Public')).toBeInTheDocument()
        })
    })

    it('renders avatar popup viewport', async () => {
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(
                screen.getByTestId('avatar-popup-viewport')
            ).toBeInTheDocument()
        })
    })

    it('renders account deletion section', async () => {
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Account Deletion')).toBeInTheDocument()
        })
    })

    it('opens avatar picker popup when avatar button is clicked', async () => {
        const user = userEvent.setup()
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('First Name')).toBeInTheDocument()
        })

        // Find the avatar button (it's a button containing the avatar image)
        const avatarButtons = document.querySelectorAll('button')
        const avatarButton = Array.from(avatarButtons).find((btn) =>
            btn.querySelector('img')
        )
        expect(avatarButton).toBeInTheDocument()

        await user.click(avatarButton!)

        expect(mockedAvatarPopup.open).toHaveBeenCalledWith(
            'avatar',
            expect.objectContaining({
                title: 'Pick an Avatar'
            })
        )
    })

    it('shows location validation error when location is entered without selecting from suggestions', async () => {
        const user = userEvent.setup()
        const mockUser = createMockUser({
            location: '',
            latitude: null,
            longitude: null
        })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)
        mockedCapacitorHttp.post.mockResolvedValue({
            status: 200,
            data: { predictions: [] },
            headers: {},
            url: ''
        })

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Location')).toBeInTheDocument()
        })

        // Type in location field without selecting
        const locationInput = screen.getByPlaceholderText('ex. Toronto, ON')
        await user.type(locationInput, 'New York')

        // Click save button
        const saveButton = screen.getByText('Save')
        await user.click(saveButton)

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Please select a valid location from the suggestions.'
                )
            ).toBeInTheDocument()
        })
    })

    it('handles API error during save', async () => {
        const user = userEvent.setup()
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)
        mockedCapacitorHttp.patch.mockResolvedValue({
            status: 500,
            data: { error: 'Internal server error' },
            headers: {},
            url: ''
        })

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Save')).toBeInTheDocument()
        })

        const saveButton = screen.getByText('Save')
        await user.click(saveButton)

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Internal server error')
        })

        consoleSpy.mockRestore()
    })

    it('handles save failure with exception', async () => {
        const user = userEvent.setup()
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)
        mockedCapacitorHttp.patch.mockRejectedValue(new Error('Network error'))

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Save')).toBeInTheDocument()
        })

        const saveButton = screen.getByText('Save')
        await user.click(saveButton)

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Save failed',
                expect.any(Error)
            )
        })

        consoleSpy.mockRestore()
    })

    it('fetches location predictions when typing in location field', async () => {
        jest.useFakeTimers()
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime
        })
        const mockUser = createMockUser({
            location: '',
            latitude: null,
            longitude: null
        })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)
        mockedCapacitorHttp.post.mockResolvedValue({
            status: 200,
            data: {
                predictions: [
                    {
                        formatted: 'Toronto, ON, Canada',
                        lat: 43.65,
                        lon: -79.38
                    }
                ]
            },
            headers: {},
            url: ''
        })

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Location')).toBeInTheDocument()
        })

        const locationInput = screen.getByPlaceholderText('ex. Toronto, ON')
        await user.type(locationInput, 'Toronto')

        // Fast-forward timers to trigger debounced API call
        await act(async () => {
            jest.advanceTimersByTime(400)
        })

        await waitFor(() => {
            expect(mockedCapacitorHttp.post).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining(
                        '/api/get-location-predictions'
                    ),
                    data: { query: 'Toronto' }
                })
            )
        })

        jest.useRealTimers()
    })

    it('displays location suggestions and allows selection', async () => {
        jest.useFakeTimers()
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime
        })
        const mockUser = createMockUser({
            location: '',
            latitude: null,
            longitude: null
        })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)
        mockedCapacitorHttp.post.mockResolvedValue({
            status: 200,
            data: {
                predictions: [
                    {
                        formatted: 'Toronto, ON, Canada',
                        lat: 43.65,
                        lon: -79.38
                    }
                ]
            },
            headers: {},
            url: ''
        })

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Location')).toBeInTheDocument()
        })

        const locationInput = screen.getByPlaceholderText('ex. Toronto, ON')
        await user.type(locationInput, 'Toronto')

        await act(async () => {
            jest.advanceTimersByTime(400)
        })

        await waitFor(() => {
            expect(screen.getByText('Toronto, ON, Canada')).toBeInTheDocument()
        })

        // Click on the suggestion
        const suggestion = screen.getByText('Toronto, ON, Canada')
        await user.click(suggestion)

        // Verify the input was updated
        expect(locationInput).toHaveValue('Toronto, ON, Canada')

        jest.useRealTimers()
    })

    it('clears location coordinates when input is cleared', async () => {
        jest.useFakeTimers()
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime
        })
        const mockUser = createMockUser({
            location: 'Toronto, ON',
            latitude: 43.65,
            longitude: -79.38
        })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)
        mockedCapacitorHttp.patch.mockResolvedValue({
            status: 200,
            data: { success: true },
            headers: {},
            url: ''
        })

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Location')).toBeInTheDocument()
        })

        const locationInput = screen.getByPlaceholderText('ex. Toronto, ON')

        // Clear the input
        await user.clear(locationInput)

        // Save and expect location validation error (since coordinates are cleared)
        const saveButton = screen.getByText('Save')
        await user.click(saveButton)

        // Should not show error since location is now empty
        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/personal-profile')
        })

        jest.useRealTimers()
    })

    it('handles location API error', async () => {
        jest.useFakeTimers()
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime
        })
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const mockUser = createMockUser({
            location: '',
            latitude: null,
            longitude: null
        })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)
        mockedCapacitorHttp.post.mockResolvedValue({
            status: 500,
            data: { error: 'API error' },
            headers: {},
            url: ''
        })

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Location')).toBeInTheDocument()
        })

        const locationInput = screen.getByPlaceholderText('ex. Toronto, ON')
        await user.type(locationInput, 'Toronto')

        await act(async () => {
            jest.advanceTimersByTime(400)
        })

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('API error:', 'API error')
        })

        consoleSpy.mockRestore()
        jest.useRealTimers()
    })

    it('handles profile fetch error', async () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockRejectedValue(new Error('Fetch failed'))

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error loading profile',
                expect.any(Error)
            )
        })

        consoleSpy.mockRestore()
    })

    it('does not fetch profile when session user id is missing', () => {
        mockedUseAuth.mockReturnValue({
            session: { user: {}, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })

        renderWithTheme(<PersonalProfileScreen />)

        expect(mockedFetchUserProfile).not.toHaveBeenCalled()
    })

    it('populates form with user data including location coordinates', async () => {
        const mockUser = createMockUser({
            location: 'Toronto, ON',
            latitude: 43.65,
            longitude: -79.38
        })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            const locationInput = screen.getByPlaceholderText('ex. Toronto, ON')
            expect(locationInput).toHaveValue('Toronto, ON')
        })
    })

    it('shows username required error when username is empty', async () => {
        const user = userEvent.setup()
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: mockSignOut
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByText('Username')).toBeInTheDocument()
        })

        const usernameInput = screen.getByPlaceholderText('Enter your username')
        await user.clear(usernameInput)

        const saveButton = screen.getByText('Save')
        await user.click(saveButton)

        await waitFor(() => {
            expect(screen.getByText('Username is required')).toBeInTheDocument()
        })
    })
})
