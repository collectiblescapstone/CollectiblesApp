export type TradeCardProps = {
    username: string
    avatarUrl?: string
    rating: number
    ratingCount: number
    user1Wishlist?: { name: string; image_url: string }[]
    user2Wishlist?: { name: string; image_url: string }[]
    contacts?: { method: string; value: string }[]
    distance?: number | null
}

export type ViableOption = {
    user: {
        id: string
        username: string
        profile_pic: number
        distance: number | null
        facebook: string | null
        instagram: string | null
        x: string | null
        discord: string | null
        whatsapp: string | null
        rating: number
        rating_count: number
    }
    cardsUser1WantsFromUser2: { id: string; name: string; image_url: string }[]
    cardsUser2WantsFromUser1: { id: string; name: string; image_url: string }[]
}
