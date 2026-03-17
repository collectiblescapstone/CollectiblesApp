import { renderWithTheme } from '@/utils/testing-utils'
import { screen } from '@testing-library/react'
import StarRating from '../StarRating'

jest.mock('react-icons/lu', () => ({
    LuStar: (props: any) => (
        <svg data-testid="mocked-star" style={{ color: props.color }} />
    )
}))

describe('StarRating', () => {
    test.each([
        { rating: 1.0, expectedColor: '#580202' },
        { rating: 2.0, expectedColor: '#EF4444' },
        { rating: 3.0, expectedColor: '#FB923C' },
        { rating: 4.0, expectedColor: '#F9CF38' },
        { rating: 5.0, expectedColor: '#32D74B' }
    ])(
        'renders correct component & colours for rating $rating',
        ({ rating, expectedColor }) => {
            renderWithTheme(<StarRating rating={rating} ratingCount={10} />)
            const starIcon = screen.getByTestId('mocked-star')
            expect(starIcon).toHaveStyle(`color: ${expectedColor}`)
            expect(screen.getByText(rating.toFixed(1))).toBeInTheDocument()
            expect(screen.getByText('(10)')).toBeInTheDocument()
        }
    )

    it('renders grey star and no rating when ratingCount is 0', () => {
        renderWithTheme(<StarRating rating={4.5} ratingCount={0} />)
        const starIcon = screen.getByTestId('mocked-star')
        expect(starIcon).toHaveStyle('color: #888888')
        expect(screen.queryByText('4.5')).not.toBeInTheDocument()
        expect(screen.getByText('(0)')).toBeInTheDocument()
    })
})
