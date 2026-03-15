// Mock dependencies before imports
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn()
}))

jest.mock('../../../utils/getTradeOptions', () => ({
    fetchTradeOptions: jest.fn()
}))

jest.mock('../../../context/AuthProvider', () => ({
    useAuth: jest.fn()
}))

jest.mock('../../../components/ui/PopupUI', () => ({
    __esModule: true,
    default: {
        open: jest.fn(),
        close: jest.fn(),
        Viewport: () => null
    }
}))

jest.mock('../../../components/trading/PopupTrade', () => ({
    __esModule: true,
    default: () => <div>Trade Card Popup</div>
}))

jest.mock('../../../components/trading/ViableOptions', () => ({
    __esModule: true,
    default: ({
        username,
        distance
    }: {
        username: string
        distance?: number | null
    }) => (
        <div data-testid="viable-option">
            <span>{username}</span>
            {distance != null && <span>{distance}km</span>}
        </div>
    )
}))

jest.mock('../../../components/profiles/Divider', () => ({
    __esModule: true,
    default: () => <div data-testid="divider" />
}))

import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderWithTheme } from '../../../utils/testing-utils'
import TradeSuggestions from '../TradeSuggestions'
import { ViableOption } from '../../../types/tradepost'

// Import the mocked modules to get typed access
import * as NextNavigation from 'next/navigation'
import * as TradeOptionsModule from '../../../utils/getTradeOptions'
import * as AuthProviderModule from '../../../context/AuthProvider'
import TradePopup from '../../../components/ui/PopupUI'

// Cast to access the mock functions
const mockPush = jest.fn()
const mockUseRouter = NextNavigation.useRouter as jest.MockedFunction<
    typeof NextNavigation.useRouter
>
const mockUsePathname = NextNavigation.usePathname as jest.MockedFunction<
    typeof NextNavigation.usePathname
>
const mockFetchTradeOptions =
    TradeOptionsModule.fetchTradeOptions as jest.MockedFunction<
        typeof TradeOptionsModule.fetchTradeOptions
    >
const mockUseAuth = AuthProviderModule.useAuth as jest.MockedFunction<
    typeof AuthProviderModule.useAuth
>
const mockTradePopupOpen = TradePopup.open as jest.MockedFunction<
    typeof TradePopup.open
>

describe('TradeSuggestions', () => {
    type AuthState = ReturnType<typeof AuthProviderModule.useAuth>

    const mockSession = {
        user: { id: 'user123' },
        access_token: 'mock-token'
    } as unknown as AuthState['session']

    const mockViableOptions: ViableOption[] = [
        {
            user: {
                id: 'user1',
                username: 'TraderOne',
                profile_pic: 1,
                distance: 5.5,
                facebook: 'trader1fb',
                instagram: null,
                x: 'trader1x',
                discord: null,
                whatsapp: null,
                rating: 4.5,
                rating_count: 10
            },
            cardsUser1WantsFromUser2: [
                {
                    id: 'card1',
                    name: 'Pikachu',
                    image_url: 'http://example.com/pikachu.png'
                }
            ],
            cardsUser2WantsFromUser1: [
                {
                    id: 'card2',
                    name: 'Charizard',
                    image_url: 'http://example.com/charizard.png'
                }
            ]
        },
        {
            user: {
                id: 'user2',
                username: 'TraderTwo',
                profile_pic: 2,
                distance: 10.2,
                facebook: null,
                instagram: 'trader2ig',
                x: null,
                discord: 'trader2#1234',
                whatsapp: '+1234567890',
                rating: 3.8,
                rating_count: 5
            },
            cardsUser1WantsFromUser2: [
                {
                    id: 'card3',
                    name: 'Bulbasaur',
                    image_url: 'http://example.com/bulbasaur.png'
                }
            ],
            cardsUser2WantsFromUser1: [
                {
                    id: 'card4',
                    name: 'Squirtle',
                    image_url: 'http://example.com/squirtle.png'
                }
            ]
        }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockPush.mockClear()
        mockUsePathname.mockReturnValue('/home')
        mockUseRouter.mockReturnValue({
            push: mockPush,
            replace: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
            prefetch: jest.fn()
        })
        mockUseAuth.mockReturnValue({
            session: mockSession,
            loading: false
        } as unknown as AuthState)
        mockFetchTradeOptions.mockResolvedValue({
            viableOptions: mockViableOptions
        })
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    describe('Loading States', () => {
        it('displays spinner when auth is loading', () => {
            mockUseAuth.mockReturnValue({
                session: null,
                loading: true
            } as unknown as AuthState)

            renderWithTheme(<TradeSuggestions />)

            // Chakra UI Spinner doesn't have progressbar role, look for the spinner class
            const spinner = document.querySelector('.chakra-spinner')
            expect(spinner).toBeInTheDocument()
        })

        it('displays spinner when fetching trade options', () => {
            mockFetchTradeOptions.mockImplementation(
                () =>
                    new Promise(() => {
                        /* Never resolves */
                    })
            )

            renderWithTheme(<TradeSuggestions />)

            // Chakra UI Spinner doesn't have progressbar role, look for the spinner class
            const spinner = document.querySelector('.chakra-spinner')
            expect(spinner).toBeInTheDocument()
        })
    })

    describe('Error Handling', () => {
        it('displays error message when fetch fails', async () => {
            mockFetchTradeOptions.mockRejectedValue(new Error('Network error'))

            renderWithTheme(<TradeSuggestions />)

            await waitFor(() => {
                expect(
                    screen.getByText('Failed to fetch viable options')
                ).toBeInTheDocument()
            })
        })
    })

    describe('No Session', () => {
        it('does not fetch trade options when user is not logged in', async () => {
            mockUseAuth.mockReturnValue({
                session: null,
                loading: false
            } as unknown as AuthState)

            renderWithTheme(<TradeSuggestions />)

            await waitFor(() => {
                expect(mockFetchTradeOptions).not.toHaveBeenCalled()
            })
        })
    })

    describe('Trade Suggestions Display', () => {
        it('renders the component with title and divider', async () => {
            renderWithTheme(<TradeSuggestions />)

            await waitFor(() => {
                expect(
                    screen.getByText('TradePost Suggestion')
                ).toBeInTheDocument()
                expect(screen.getByTestId('divider')).toBeInTheDocument()
            })
        })

        it('displays the closest user when viable options exist', async () => {
            renderWithTheme(<TradeSuggestions />)

            await waitFor(() => {
                // Should display TraderOne since they have distance 5.5km (closer than TraderTwo's 10.2km)
                expect(screen.getByText('TraderOne')).toBeInTheDocument()
                expect(screen.getByText('5.5km')).toBeInTheDocument()
            })
        })

        it('displays message when no viable options exist', async () => {
            mockFetchTradeOptions.mockResolvedValue({
                viableOptions: []
            })

            renderWithTheme(<TradeSuggestions />)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /Let's add some more cards to that TradeList and WishList/i
                    )
                ).toBeInTheDocument()
            })
        })
    })

    describe('User Interactions', () => {
        it('opens trade popup when clicking on a user', async () => {
            renderWithTheme(<TradeSuggestions />)

            await waitFor(() => {
                expect(screen.getByText('TraderOne')).toBeInTheDocument()
            })

            const viableOption = screen.getByTestId('viable-option')
            fireEvent.click(viableOption)

            expect(mockTradePopupOpen).toHaveBeenCalledWith(
                'trade',
                expect.objectContaining({
                    title: 'Trade with TraderOne'
                })
            )
        })

        it('navigates to /trade when clicking Go to TradePost button', async () => {
            renderWithTheme(<TradeSuggestions />)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /see more trade suggestions/i
                    })
                ).toBeInTheDocument()
            })

            const button = screen.getByRole('button', {
                name: /see more trade suggestions/i
            })
            fireEvent.click(button)

            expect(mockPush).toHaveBeenCalledWith('/trade')
        })
    })

    describe('Fetching Trade Options', () => {
        it('fetches trade options on mount with correct userID', async () => {
            renderWithTheme(<TradeSuggestions />)

            await waitFor(() => {
                expect(mockFetchTradeOptions).toHaveBeenCalledWith('user123')
            })
        })
    })
})
