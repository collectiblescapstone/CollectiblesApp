import { renderWithTheme } from '@/utils/testing-utils'
import { screen, fireEvent } from '@testing-library/react'
import WishList from '../WishList'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush
    })
}))

describe('WishList', () => {
    it('renders the WishList component with the correct props', () => {
        const mockProps = {
            type: 'personal' as const,
            username: 'testuser',
            wishlist: [
                { name: 'Card 1', image: 'card1.png' },
                { name: 'Card 2', image: 'card2.png' }
            ]
        }

        renderWithTheme(<WishList {...mockProps} />)

        expect(screen.getByText('Wish List')).toBeInTheDocument()

        const cardImages = screen.getAllByRole('img')
        expect(cardImages).toHaveLength(2)
        expect(cardImages[0]).toHaveAttribute('src', 'card1.png')
        expect(cardImages[1]).toHaveAttribute('src', 'card2.png')
        expect(
            screen.queryByRole('button', { name: 'View more' })
        ).not.toBeInTheDocument()
    })

    it('renders the empty state when wishlist is empty', () => {
        const mockProps = {
            type: 'personal' as const,
            username: 'testuser',
            wishlist: []
        }

        renderWithTheme(<WishList {...mockProps} />)

        expect(screen.getByText('Wish List')).toBeInTheDocument()
        expect(
            screen.getByText('User has not added any cards...yet')
        ).toBeInTheDocument()
    })

    it('renders View more button when wishlist has more than 3 items', () => {
        const mockProps = {
            type: 'personal' as const,
            username: 'testuser',
            wishlist: [
                { name: 'Card 1', image: 'card1.png' },
                { name: 'Card 2', image: 'card2.png' },
                { name: 'Card 3', image: 'card3.png' },
                { name: 'Card 4', image: 'card4.png' }
            ]
        }

        renderWithTheme(<WishList {...mockProps} />)

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
            wishlist: [
                { name: 'Card 1', image: 'card1.png' },
                { name: 'Card 2', image: 'card2.png' },
                { name: 'Card 3', image: 'card3.png' },
                { name: 'Card 4', image: 'card4.png' }
            ]
        }

        renderWithTheme(<WishList {...mockProps} />)

        const viewMoreButton = screen.getByRole('button', { name: 'View more' })
        fireEvent.click(viewMoreButton)

        expect(mockPush).toHaveBeenCalledWith('/personal-profile/wish')
    })

    it('redirects to the correct page (user-profile) when View more button is clicked', () => {
        const mockProps = {
            type: 'user' as const,
            username: 'testuser',
            wishlist: [
                { name: 'Card 1', image: 'card1.png' },
                { name: 'Card 2', image: 'card2.png' },
                { name: 'Card 3', image: 'card3.png' },
                { name: 'Card 4', image: 'card4.png' }
            ]
        }

        renderWithTheme(<WishList {...mockProps} />)

        const viewMoreButton = screen.getByRole('button', { name: 'View more' })
        fireEvent.click(viewMoreButton)

        expect(mockPush).toHaveBeenCalledWith(
            '/user-profile/wish?username=testuser'
        )
    })
})
