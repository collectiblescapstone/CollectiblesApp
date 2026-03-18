import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import AddWishScreen from '../page'
import { ReactNode } from 'react'

jest.mock('../wishlistCardsContent.tsx', () => ({
    __esModule: true,
    default: () => (
        <div data-testid="wishlist-cards-content">WishlistCardsContent</div>
    )
}))

jest.mock('../../../../../../../hooks/useFilters.tsx', () => ({
    FiltersProvider: ({ children }: { children: ReactNode }) => (
        <div data-testid="filters-provider">{children}</div>
    )
}))

describe('AddWishScreen (Cards)', () => {
    it('renders WishlistCardsContent inside FiltersProvider', () => {
        render(<AddWishScreen />)

        expect(screen.getByTestId('filters-provider')).toBeInTheDocument()
        expect(screen.getByTestId('wishlist-cards-content')).toBeInTheDocument()
    })

    it('wraps content with FiltersProvider', () => {
        render(<AddWishScreen />)

        const filtersProvider = screen.getByTestId('filters-provider')
        const cardsContent = screen.getByTestId('wishlist-cards-content')

        expect(filtersProvider).toContainElement(cardsContent)
    })
})
