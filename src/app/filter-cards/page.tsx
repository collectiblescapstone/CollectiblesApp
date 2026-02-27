'use client'

import FilterCardsContent from './filterCardsContent'

// Hooks
import { FiltersProvider } from '@/hooks/useFilters'

const FilterCardsPage: React.FC = () => {
    return (
        <FiltersProvider>
            <FilterCardsContent />
        </FiltersProvider>
    )
}

export default FilterCardsPage
