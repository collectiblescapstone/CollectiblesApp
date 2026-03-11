export type UserData = {
    username: string
    firstName: string
    cardsInCollection: number
    cardsForTrade: number
    cardsLoggedthisMonth: number
    popularCards: {
        name: string
        imageUrl: string
        count: number
    }[]
    recentCards: {
        name: string
        imageUrl: string
    }[]
}

export type PopCards = {
    name: string
    imageUrl: string
    count: number
}
