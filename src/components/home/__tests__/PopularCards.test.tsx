import { renderWithTheme } from '@/utils/testing-utils'
import { screen } from '@testing-library/react'
import PopularCards from '../PopularCards'
import { count } from 'console'

describe('PopularCards', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the PopularCards component', () => {
        renderWithTheme(<PopularCards cards={[]} />)

        screen.getByText('Popular This Month')
        screen.getByText('Be the first to get a trend going!')
    })

    it('should render the PopularCards cards when provided', () => {
        const mockCards = [
            { imageUrl: 'card1', name: 'Pikachu', count: 10 },
            { imageUrl: 'card2', name: 'Charizard', count: 5 }
        ]

        renderWithTheme(<PopularCards cards={mockCards} />)

        screen.getByText('Popular This Month')
        screen.getByRole('img', { name: 'Pikachu' })
        screen.getByRole('img', { name: 'Charizard' })
    })
})
