import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import AddWishScreen from '../page'

jest.mock(
    '../../../../../../components/pokemon-grid-display/PokemonGridDisplay.tsx',
    () => ({
        __esModule: true,
        default: ({ originalPage }: { originalPage: string }) => (
            <div data-testid="pokemon-grid-display">
                PokemonGridDisplay - {originalPage}
            </div>
        )
    })
)

describe('AddWishScreen', () => {
    it('renders PokemonGridDisplay component', () => {
        render(<AddWishScreen />)

        expect(screen.getByTestId('pokemon-grid-display')).toBeInTheDocument()
    })

    it('passes correct originalPage prop to PokemonGridDisplay', () => {
        render(<AddWishScreen />)

        expect(
            screen.getByText(
                'PokemonGridDisplay - personal-profile/edit-profile/wishlist/add/'
            )
        ).toBeInTheDocument()
    })
})
