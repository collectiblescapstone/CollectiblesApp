import { CapacitorHttp } from '@capacitor/core'
import { WishlistEntry } from '@prisma/client'
import { baseUrl } from '../constants'

export const getWishlist = async (userId: string): Promise<WishlistEntry[]> => {
    const response = await CapacitorHttp.post({
        url: `${baseUrl}/api/get-wishlist`,
        data: { userId },
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (response.status < 200 || response.status >= 300) {
        throw new Error("Failed to update user's wishlist")
    }

    return response.data
}

export const updateWishlist = async (
    userId: string,
    cardId: string,
    remove?: boolean
) => {
    const response = await CapacitorHttp.post({
        url: `${baseUrl}/api/update-wishlist`,
        data: { userId, cardId, remove },
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (response.status < 200 || response.status >= 300) {
        throw new Error("Failed to update user's wishlist")
    }

    return response.data
}
