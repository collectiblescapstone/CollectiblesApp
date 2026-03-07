'use client'

import { FiltersProvider } from '@/hooks/useFilters'
import WishlistCardsContent from './wishlistCardsContent'

const AddWishScreen: React.FC = () => {
    return (
        <FiltersProvider>
            <WishlistCardsContent />
        </FiltersProvider>
    )
}

export default AddWishScreen
