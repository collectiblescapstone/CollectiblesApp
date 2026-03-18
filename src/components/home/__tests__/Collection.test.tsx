import { renderWithTheme } from '@/utils/testing-utils'
import { screen } from '@testing-library/react'
import Collection from '../Collection'

describe('Collection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the collection component', () => {
        renderWithTheme(<Collection cards={[]} />)

        screen.getByText('Recently Added Cards')
        screen.getByText('Psst...you got cards on your phone?')
    })

    it('should render the collection cards when provided', () => {
        const mockCards = [
            { image: 'card1', name: 'Pikachu' },
            { image: 'card2', name: 'Charizard' }
        ]

        renderWithTheme(<Collection cards={mockCards} />)

        screen.getByText('Recently Added Cards')
        screen.getByRole('img', { name: 'Pikachu' })
        screen.getByRole('img', { name: 'Charizard' })
    })
})
