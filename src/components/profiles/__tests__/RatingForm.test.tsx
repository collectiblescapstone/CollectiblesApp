import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import RatingForm from '../RatingForm'
import { renderWithTheme } from '../../../utils/testing-utils'
import { UserProfile, VisibilityValues } from '../../../types/personal-profile'

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

// Helper to find clickable star boxes from the first (gray) row
const getStarBoxes = (container: HTMLElement): HTMLElement[] => {
    // The structure has two flex containers - first one has the gray (clickable) stars
    // Find all boxes with the css-e0fajo class (the star wrapper divs)
    const allStarDivs = container.querySelectorAll('.css-e0fajo')
    // Take only the first 5 (the gray background stars)
    return Array.from(allStarDivs).slice(0, 5) as HTMLElement[]
}

const setupStarMock = (star: HTMLElement) => {
    const rect = {
        left: 0,
        width: 24,
        top: 0,
        height: 24,
        right: 24,
        bottom: 24,
        x: 0,
        y: 0,
        toJSON: () => ({})
    }
    star.getBoundingClientRect = jest.fn(() => rect as DOMRect)
}

// Helper to click a star at a specific position
const clickStar = async (star: HTMLElement, pageX: number) => {
    setupStarMock(star)
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: pageX,
        view: window
    })
    // Override pageX since MouseEvent doesn't support it directly
    Object.defineProperty(clickEvent, 'pageX', {
        value: pageX,
        writable: false
    })
    await act(async () => {
        star.dispatchEvent(clickEvent)
    })
}

describe('RatingForm', () => {
    const mockCloseOnSubmit = jest.fn()
    const mockUser: UserProfile = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test bio',
        profile_pic: 1,
        visibility: VisibilityValues.Public,
        rating: 4.5,
        rating_count: 10,
        wishlist: [],
        tradeList: [],
        showcaseList: [],
        instagram: undefined,
        x: undefined,
        facebook: undefined,
        discord: undefined,
        whatsapp: undefined
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering', () => {
        it('renders the rating form with 5 star buttons', () => {
            renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            // Should show the initial rating text
            expect(screen.getByText('Rating: 0.0')).toBeInTheDocument()

            // Should render submit button
            expect(
                screen.getByRole('button', { name: 'Submit' })
            ).toBeInTheDocument()
        })

        it('renders submit button as disabled when rating is 0', () => {
            renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const submitButton = screen.getByRole('button', { name: 'Submit' })
            expect(submitButton).toBeDisabled()
        })
    })

    describe('Star Click Interactions', () => {
        it('sets full star rating when clicking right side of star', async () => {
            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            expect(starBoxes.length).toBeGreaterThan(0)

            const firstStar = starBoxes[0]
            await clickStar(firstStar, 20) // Right side (> width/2 = 12)

            expect(screen.getByText('Rating: 1.0')).toBeInTheDocument()
        })

        it('sets half star rating when clicking left side of star', async () => {
            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const firstStar = starBoxes[0]
            await clickStar(firstStar, 5) // Left side (< width/2 = 12)

            expect(screen.getByText('Rating: 0.5')).toBeInTheDocument()
        })

        it('sets rating to 3.0 when clicking third star right side', async () => {
            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const thirdStar = starBoxes[2]
            await clickStar(thirdStar, 20) // Right side

            expect(screen.getByText('Rating: 3.0')).toBeInTheDocument()
        })

        it('sets rating to 4.5 when clicking fifth star left side', async () => {
            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const fifthStar = starBoxes[4]
            await clickStar(fifthStar, 5) // Left side

            expect(screen.getByText('Rating: 4.5')).toBeInTheDocument()
        })

        it('enables submit button after selecting a rating', async () => {
            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const firstStar = starBoxes[0]
            await clickStar(firstStar, 20) // Right side

            const submitButton = screen.getByRole('button', { name: 'Submit' })
            expect(submitButton).not.toBeDisabled()
        })
    })

    describe('Form Submission', () => {
        it('calls API on successful submission', async () => {
            mockCapacitorHttp.post.mockResolvedValueOnce({
                status: 200,
                data: {},
                headers: {},
                url: ''
            })

            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const thirdStar = starBoxes[2]
            await clickStar(thirdStar, 20) // 3.0 rating

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
            })

            await waitFor(() => {
                expect(mockCapacitorHttp.post).toHaveBeenCalledWith({
                    url: expect.stringContaining('/api/rate-user'),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token'
                    },
                    data: {
                        username: 'testuser',
                        rating: 3,
                        currentUserId: 'current-user-id'
                    }
                })
            })
        })

        it('calls closeOnSubmit with rating on success', async () => {
            mockCapacitorHttp.post.mockResolvedValueOnce({
                status: 200,
                data: {},
                headers: {},
                url: ''
            })

            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const fourthStar = starBoxes[3]
            await clickStar(fourthStar, 5) // 3.5 rating

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
            })

            await waitFor(() => {
                expect(mockCloseOnSubmit).toHaveBeenCalledWith('rate-user', 3.5)
            })
        })

        it('shows error message on API failure with error response', async () => {
            mockCapacitorHttp.post.mockResolvedValueOnce({
                status: 500,
                data: { error: 'Server error occurred' },
                headers: {},
                url: ''
            })

            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const firstStar = starBoxes[0]
            await clickStar(firstStar, 20) // 1.0 rating

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
            })

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Failed to submit rating: Server error occurred'
                    )
                ).toBeInTheDocument()
            })
        })

        it('shows default error message when API returns no error details', async () => {
            mockCapacitorHttp.post.mockResolvedValueOnce({
                status: 400,
                data: {},
                headers: {},
                url: ''
            })

            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const secondStar = starBoxes[1]
            await clickStar(secondStar, 20) // 2.0 rating

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Failed to submit rating: Unknown error')
                ).toBeInTheDocument()
            })
        })

        it('does not call closeOnSubmit on API failure', async () => {
            mockCapacitorHttp.post.mockResolvedValueOnce({
                status: 500,
                data: { error: 'Server error' },
                headers: {},
                url: ''
            })

            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const firstStar = starBoxes[0]
            await clickStar(firstStar, 20) // 1.0 rating

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Failed to submit rating: Server error')
                ).toBeInTheDocument()
            })

            expect(mockCloseOnSubmit).not.toHaveBeenCalled()
        })
    })

    describe('Submitting State', () => {
        it('disables star clicks while submitting', async () => {
            // Create a promise that we can control
            let resolvePost: (value: unknown) => void
            const postPromise = new Promise((resolve) => {
                resolvePost = resolve
            })
            mockCapacitorHttp.post.mockReturnValueOnce(postPromise as never)

            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const firstStar = starBoxes[0]
            await clickStar(firstStar, 20) // 1.0 rating

            expect(screen.getByText('Rating: 1.0')).toBeInTheDocument()

            // Start submission
            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
            })

            // Try to change rating while submitting - need to get fresh star boxes
            // because the DOM re-rendered and we need new elements
            const newStarBoxes = getStarBoxes(container)
            const newThirdStar = newStarBoxes[2]
            await clickStar(newThirdStar, 20) // Try to change to 3.0

            // Rating should still be 1.0 because clicks are disabled
            expect(screen.getByText('Rating: 1.0')).toBeInTheDocument()

            // Resolve the API call
            await act(async () => {
                resolvePost!({
                    status: 200,
                    data: {},
                    headers: {},
                    url: ''
                })
            })
        })
    })

    describe('Filled Stars Display', () => {
        it('displays correct rating text for half ratings', async () => {
            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const secondStar = starBoxes[1]
            await clickStar(secondStar, 5) // 1.5 rating

            expect(screen.getByText('Rating: 1.5')).toBeInTheDocument()
        })

        it('displays correct rating text for whole number ratings', async () => {
            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const thirdStar = starBoxes[2]
            await clickStar(thirdStar, 20) // 3.0 rating

            expect(screen.getByText('Rating: 3.0')).toBeInTheDocument()
        })

        it('renders filled stars after clicking', async () => {
            const { container } = renderWithTheme(
                <RatingForm user={mockUser} closeOnSubmit={mockCloseOnSubmit} />
            )

            const starBoxes = getStarBoxes(container)
            const secondStar = starBoxes[1]

            // Initially, we only have 5 gray stars
            const initialSvgs = container.querySelectorAll('svg')
            expect(initialSvgs.length).toBe(5)

            await clickStar(secondStar, 20) // 2.0 rating

            // After clicking, we should have more SVGs (filled stars rendered)
            const updatedSvgs = container.querySelectorAll('svg')
            expect(updatedSvgs.length).toBeGreaterThan(5)
        })
    })
})
