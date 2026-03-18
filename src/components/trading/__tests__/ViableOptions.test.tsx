import { renderWithTheme } from '@/utils/testing-utils'
import { screen } from '@testing-library/react'
import ViableOptions from '../ViableOptions'

jest.mock('../TradingCards', () => {
    return jest.fn(() => <div>Mocked TradingCards</div>)
})

jest.mock('../../profiles/StarRating', () => {
    return jest.fn(() => <div>Mocked StarRating</div>)
})

describe('ViableOptions', () => {
    it('renders the card correctly', () => {
        const mockProps = {
            username: 'testuser',
            avatarUrl: 'avatar.png',
            rating: 4.5,
            user1Wishlist: [
                { name: 'Card 1', image_url: 'card1.png' },
                { name: 'Card 2', image_url: 'card2.png' }
            ],
            distance: 10.5,
            ratingCount: 100
        }

        renderWithTheme(<ViableOptions {...mockProps} />)

        expect(screen.getByText('2 cards')).toBeInTheDocument()
        expect(screen.getByText('10.5 km away')).toBeInTheDocument()
        expect(screen.getByText('Mocked TradingCards')).toBeInTheDocument()
        expect(screen.getByText('testuser')).toBeInTheDocument()
        expect(screen.getByText('Mocked StarRating')).toBeInTheDocument()
    })

    it('handles missing distance gracefully', () => {
        const mockProps = {
            username: 'testuser',
            avatarUrl: 'avatar.png',
            rating: 4.5,
            user1Wishlist: [{ name: 'Card 1', image_url: 'card1.png' }],
            distance: null,
            ratingCount: 100
        }

        renderWithTheme(<ViableOptions {...mockProps} />)

        expect(screen.getByText('Distance unknown')).toBeInTheDocument()
    })

    it('handles empty wishlist gracefully', () => {
        const mockProps = {
            username: 'testuser',
            avatarUrl: 'avatar.png',
            rating: 4.5,
            user1Wishlist: undefined,
            distance: 5.0,
            ratingCount: 100
        }

        renderWithTheme(<ViableOptions {...mockProps} />)

        expect(screen.getByText('0 cards')).toBeInTheDocument()
        expect(screen.getByText('5.0 km away')).toBeInTheDocument()
    })

    it('should render "card" when there is only one card', () => {
        const mockProps = {
            username: 'testuser',
            avatarUrl: 'avatar.png',
            rating: 4.5,
            user1Wishlist: [{ name: 'Card 1', image_url: 'card1.png' }],
            distance: 10.5,
            ratingCount: 100
        }

        renderWithTheme(<ViableOptions {...mockProps} />)

        expect(screen.getByText('1 card')).toBeInTheDocument()
    })
})
