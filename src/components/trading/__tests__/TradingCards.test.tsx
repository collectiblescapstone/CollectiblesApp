import { renderWithTheme } from '@/utils/testing-utils'
import { screen } from '@testing-library/react'
import TradingCards from '../TradingCards'

describe('TradingCards', () => {
    it('uses default empty cards when cards prop is omitted', () => {
        renderWithTheme(<TradingCards />)

        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('renders correctly with no cards', () => {
        renderWithTheme(<TradingCards cards={[]} />)

        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it.each([1, 2, 3, 4, 5])(
        'renders %i cards with full-width image style',
        (count) => {
            const cards = Array.from({ length: count }, (_, index) => ({
                name: `Card ${index + 1}`,
                image: `card${index + 1}.png`
            }))

            renderWithTheme(<TradingCards cards={cards} />)

            const images = screen.getAllByRole('img')
            expect(images).toHaveLength(count)

            images.forEach((image) => {
                expect(image).toHaveStyle('width: 100%')
                expect(image).toHaveStyle('max-width: 100%')
            })
        }
    )

    it('renders correctly with multiple cards', () => {
        const mockCards = [
            { name: 'Card 1', image: 'card1.png' },
            { name: 'Card 2', image: 'card2.png' },
            { name: 'Card 3', image: 'card3.png' }
        ]

        renderWithTheme(<TradingCards cards={mockCards} />)

        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(3)
        expect(images[0]).toHaveAttribute('src', 'card1.png')
        expect(images[0]).toHaveAttribute('alt', 'Card 1')
        expect(images[1]).toHaveAttribute('src', 'card2.png')
        expect(images[1]).toHaveAttribute('alt', 'Card 2')
        expect(images[2]).toHaveAttribute('src', 'card3.png')
        expect(images[2]).toHaveAttribute('alt', 'Card 3')
    })
})
