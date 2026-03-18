import { renderWithTheme } from '@/utils/testing-utils'
import { screen, fireEvent } from '@testing-library/react'
import TradeList from '../TradeList'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush
    })
}))

describe('TradeList', () => {
    it('renders the TradeList component with the correct props', () => {
        const mockProps = {
            type: 'personal' as const,
            username: 'testuser',
            tradelist: [
                { name: 'Card 1', image: 'card1.png' },
                { name: 'Card 2', image: 'card2.png' }
            ]
        }

        renderWithTheme(<TradeList {...mockProps} />)

        expect(screen.getByText('Trade List')).toBeInTheDocument()

        const cardImages = screen.getAllByRole('img')
        expect(cardImages).toHaveLength(2)
        expect(cardImages[0]).toHaveAttribute('src', 'card1.png')
        expect(cardImages[1]).toHaveAttribute('src', 'card2.png')
        expect(
            screen.queryByRole('button', { name: 'View more' })
        ).not.toBeInTheDocument()
    })

    it('renders the empty state when tradelist is empty', () => {
        const mockProps = {
            type: 'personal' as const,
            username: 'testuser',
            tradelist: []
        }

        renderWithTheme(<TradeList {...mockProps} />)

        expect(screen.getByText('Trade List')).toBeInTheDocument()
        expect(
            screen.getByText('User has not added any cards...yet')
        ).toBeInTheDocument()
    })

    it('renders View more button when tradelist has more than 3 items', () => {
        const mockProps = {
            type: 'personal' as const,
            username: 'testuser',
            tradelist: [
                { name: 'Card 1', image: 'card1.png' },
                { name: 'Card 2', image: 'card2.png' },
                { name: 'Card 3', image: 'card3.png' },
                { name: 'Card 4', image: 'card4.png' }
            ]
        }

        renderWithTheme(<TradeList {...mockProps} />)

        const cardImages = screen.getAllByRole('img')
        expect(cardImages).toHaveLength(3) // Only 3 cards should be rendered
        expect(
            screen.getByRole('button', { name: 'View more' })
        ).toBeInTheDocument()
    })

    it('redirects to the correct page (personal-profile) when View more button is clicked', () => {
        const mockProps = {
            type: 'personal' as const,
            username: 'testuser',
            tradelist: [
                { name: 'Card 1', image: 'card1.png' },
                { name: 'Card 2', image: 'card2.png' },
                { name: 'Card 3', image: 'card3.png' },
                { name: 'Card 4', image: 'card4.png' }
            ]
        }

        renderWithTheme(<TradeList {...mockProps} />)

        const viewMoreButton = screen.getByRole('button', { name: 'View more' })
        fireEvent.click(viewMoreButton)

        expect(mockPush).toHaveBeenCalledWith('/personal-profile/trade')
    })

    it('redirects to the correct page (user-profile) when View more button is clicked', () => {
        const mockProps = {
            type: 'user' as const,
            username: 'testuser',
            tradelist: [
                { name: 'Card 1', image: 'card1.png' },
                { name: 'Card 2', image: 'card2.png' },
                { name: 'Card 3', image: 'card3.png' },
                { name: 'Card 4', image: 'card4.png' }
            ]
        }

        renderWithTheme(<TradeList {...mockProps} />)

        const viewMoreButton = screen.getByRole('button', { name: 'View more' })
        fireEvent.click(viewMoreButton)

        expect(mockPush).toHaveBeenCalledWith(
            '/user-profile/trade?username=testuser'
        )
    })
})
