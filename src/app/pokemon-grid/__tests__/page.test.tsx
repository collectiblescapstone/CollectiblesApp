import { renderWithTheme } from '@/utils/testing-utils'
import { screen } from '@testing-library/react'
import PokemonGrid from '../page'

jest.mock('../../../components/pokemon-grid-display/PokemonGridDisplay', () => {
    return jest.fn(() => <div>Mocked PokemonGridDisplay</div>)
})

jest.mock('../../../hooks/useFilters', () => ({
    __esModule: true,
    FiltersProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="filters-provider">{children}</div>
    )
}))

describe('PokemonGrid page', () => {
    it('renders the page correctly', () => {
        renderWithTheme(<PokemonGrid />)

        expect(screen.getByTestId('filters-provider')).toBeInTheDocument()
        expect(
            screen.getByText('Mocked PokemonGridDisplay')
        ).toBeInTheDocument()
    })
})
