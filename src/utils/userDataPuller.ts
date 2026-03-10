import { UserData } from '../types/user-data'
import { CapacitorHttp } from '@capacitor/core'
import { baseUrl } from '../constants'

export const fetchUserData = async (userID: string): Promise<UserData> => {
    const response = await CapacitorHttp.post({
        url: `${baseUrl}/api/home-page`,
        data: { userID },
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to fetch user data')
    }

    return response.data
}
