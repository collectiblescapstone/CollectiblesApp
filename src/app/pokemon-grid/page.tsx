'use client'

import React from 'react'

// Child Components
import PokemonGridDisplay from '@/components/pokemon-grid-display/PokemonGridDisplay'

// Hooks
import { FiltersProvider } from '@/hooks/useFilters'

const PokemonGridPage = () => {
    return (
        <FiltersProvider>
            <PokemonGridDisplay originalPage="pokemon-grid" />
        </FiltersProvider>
    )
}

export default PokemonGridPage
