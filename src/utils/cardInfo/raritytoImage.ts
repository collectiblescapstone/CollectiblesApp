const rarityImageMap: Record<string, string> = {
    common: 'Rarity_Common.png',
    uncommon: 'Rarity_Uncommon.png',
    rare: 'Rarity_Rare.png',
    'double rare': 'Rarity_Double_Rare.png',
    'ultra rare': 'Rarity_Ultra_Rare.png',
    'secret rare': 'Rarity_Secret_Rare.png',
    'ace spec rare': 'Rarity_ACE_SPEC_Rare.png',
    'black white rare': 'Rarity_Black_White_Rare.png',
    'hyper rare': 'Rarity_Hyper_Rare.png',
    'mega attack rare': 'Rarity_Mega_Attack_Rare.png',
    'mega hyper rare': 'Rarity_Mega_Hyper_Rare.png',
    'illustration rare': 'Rarity_Illustration_Rare.png',
    'shiny rare': 'Rarity_Shiny_Rare.png',
    'shiny ultra rare': 'Rarity_Shiny_Ultra_Rare.png',
    'holo rare v': 'Rarity_Ultra_Rare.png',
    'special illustration rare': 'Rarity_Special_Illustration_Rare.png'
}

/**
 * Returns the rarity image. Default image is common.
 * @param rarity
 * @returns
 */
export const getRarityImage = (rarity: string): string => {
    return (
        '/Images/CardRarity/' + rarityImageMap[rarity.toLowerCase()] ||
        '/Images/CardRarity/Rarity_Common.png'
    )
}

export const checkRarityExists = (rarity: string): boolean => {
    return rarityImageMap.hasOwnProperty(rarity.toLowerCase())
}
