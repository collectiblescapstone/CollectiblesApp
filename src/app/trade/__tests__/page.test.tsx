import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import TradePage from '../page'
import { renderWithTheme } from '../../../utils/testing-utils'
import { useAuth } from '../../../context/AuthProvider'
import { fetchTradeOptions } from '../../../utils/getTradeOptions'
import TradePopup from '../../../components/ui/PopupUI'

let mockPathname = '/trade'

jest.mock('next/navigation', () => ({
    usePathname: () => mockPathname
}))

jest.mock('../../../context/AuthProvider', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

jest.mock('../../../utils/getTradeOptions', () => ({
    fetchTradeOptions: jest.fn()
}))

jest.mock('../../../components/trading/UserSearch', () => ({
    __esModule: true,
    default: () => <div data-testid="user-search">UserSearch</div>
}))

jest.mock('../../../components/trading/ViableOptions', () => ({
    __esModule: true,
    default: ({
        username,
        distance
    }: {
        username: string
        distance: number
    }) => (
        <div data-testid="viable-option">
            {username} - {distance}
        </div>
    )
}))

jest.mock('../../../components/trading/PopupTrade', () => ({
    __esModule: true,
    default: () => <div data-testid="popup-trade-content">PopupTrade</div>
}))

jest.mock('../../../components/ui/PopupUI.tsx', () => ({
    __esModule: true,
    default: {
        open: jest.fn(),
        close: jest.fn(),
        Viewport: () => <div data-testid="trade-popup-viewport" />
    }
}))

const mockedUseAuth = jest.mocked(useAuth)
const mockedFetchTradeOptions = jest.mocked(fetchTradeOptions)
const mockedTradePopup = TradePopup as jest.Mocked<typeof TradePopup>

const baseAuthState = {
    loading: false,
    session: {
        access_token: 'token-123',
        user: { id: 'user-1' }
    }
}

describe('trade page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPathname = '/trade'
        mockedUseAuth.mockReturnValue(
            baseAuthState as ReturnType<typeof useAuth>
        )
    })

    it('shows spinner while session is missing', () => {
        mockedUseAuth.mockReturnValue({
            loading: false,
            session: null
        } as ReturnType<typeof useAuth>)

        renderWithTheme(<TradePage />)
        expect(document.querySelector('.chakra-spinner')).toBeInTheDocument()
    })

    it('shows error when user id is unavailable', async () => {
        mockedUseAuth.mockReturnValue({
            loading: false,
            session: { user: { id: undefined } }
        } as unknown as ReturnType<typeof useAuth>)

        renderWithTheme(<TradePage />)

        await waitFor(() => {
            expect(screen.getByText('No user ID found')).toBeInTheDocument()
        })
    })

    it('shows fetch error when trade options request fails', async () => {
        mockedFetchTradeOptions.mockRejectedValue(new Error('boom'))

        renderWithTheme(<TradePage />)

        await waitFor(() => {
            expect(
                screen.getByText('Failed to fetch viable options')
            ).toBeInTheDocument()
        })
    })

    it('renders no-trade-state when there are no viable options', async () => {
        mockedFetchTradeOptions.mockResolvedValue({
            viableOptions: []
        } as never)

        renderWithTheme(<TradePage />)

        await waitFor(() => {
            expect(
                screen.getByText("That's a special hand you have there!")
            ).toBeInTheDocument()
        })
        expect(screen.getByTestId('user-search')).toBeInTheDocument()
    })

    it('renders viable options and opens popup on option click', async () => {
        mockedFetchTradeOptions.mockResolvedValue({
            viableOptions: [
                {
                    user: {
                        id: 'u2',
                        username: 'Misty',
                        profile_pic: 1,
                        distance: 25,
                        instagram: 'misty_ig',
                        facebook: '',
                        x: '',
                        discord: '',
                        whatsapp: ''
                    },
                    cardsUser1WantsFromUser2: [
                        { name: 'Card A', image_url: 'a.png' }
                    ],
                    cardsUser2WantsFromUser1: [
                        { name: 'Card B', image_url: 'b.png' }
                    ]
                },
                {
                    user: {
                        id: 'u2',
                        username: 'Misty',
                        profile_pic: 1,
                        distance: 25,
                        instagram: 'misty_ig',
                        facebook: '',
                        x: '',
                        discord: '',
                        whatsapp: ''
                    },
                    cardsUser1WantsFromUser2: [
                        { name: 'Card C', image_url: 'c.png' }
                    ],
                    cardsUser2WantsFromUser1: [
                        { name: 'Card D', image_url: 'd.png' }
                    ]
                }
            ]
        } as never)

        renderWithTheme(<TradePage />)

        await waitFor(() => {
            expect(screen.getByText('Range: 100 km')).toBeInTheDocument()
        })

        expect(screen.getAllByTestId('viable-option')).toHaveLength(1)

        fireEvent.click(screen.getByTestId('viable-option'))

        expect(mockedTradePopup.open).toHaveBeenCalledWith(
            'trade',
            expect.objectContaining({
                title: 'Trade with Misty',
                onClickClose: expect.any(Function)
            })
        )
    })

    it('closes popup when pathname changes away from /trade', async () => {
        mockedFetchTradeOptions.mockResolvedValue({
            viableOptions: []
        } as never)

        const { rerender } = renderWithTheme(<TradePage />)

        await waitFor(() => {
            expect(
                screen.getByText("That's a special hand you have there!")
            ).toBeInTheDocument()
        })

        mockPathname = '/home'
        rerender(<TradePage />)

        await waitFor(() => {
            expect(mockedTradePopup.close).toHaveBeenCalledWith('trade')
        })
    })

    it('ignores overlay-not-found error when closing popup', async () => {
        mockedFetchTradeOptions.mockResolvedValue({
            viableOptions: []
        } as never)
        mockedTradePopup.close.mockImplementation(() => {
            throw new Error('Overlay with id trade not found')
        })

        const { rerender } = renderWithTheme(<TradePage />)

        await waitFor(() => {
            expect(screen.getByTestId('user-search')).toBeInTheDocument()
        })

        mockPathname = '/profile'

        expect(() => rerender(<TradePage />)).not.toThrow()
    })

    it('shows distance filtered empty state for far users', async () => {
        mockedFetchTradeOptions.mockResolvedValue({
            viableOptions: [
                {
                    user: {
                        id: 'u3',
                        username: 'Brock',
                        profile_pic: 1,
                        distance: 300,
                        instagram: '',
                        facebook: '',
                        x: '',
                        discord: '',
                        whatsapp: ''
                    },
                    cardsUser1WantsFromUser2: [],
                    cardsUser2WantsFromUser1: []
                }
            ]
        } as never)

        renderWithTheme(<TradePage />)

        await waitFor(() => {
            expect(
                screen.getByText('Everyone is in a galaxy far, far away!')
            ).toBeInTheDocument()
        })
    })
})
