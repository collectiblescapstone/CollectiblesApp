export type TradeCardProps = {
    username: string
    avatarUrl?: string
    rating: number
    cards?: { id: string; name: string; image_url: string }[]
    distance?: number | null
}

export type ViableOption = {
    user: {
        id: string
        username: string
        profile_pic: number
        distance: number | null
    }
    cards: { id: string; name: string; image_url: string }[]
}
