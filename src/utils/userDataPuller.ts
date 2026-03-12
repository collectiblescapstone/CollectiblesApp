import { UserData } from '@/types/user-data'
import { CapacitorHttp } from '@capacitor/core'
import { baseUrl } from '@/utils/constants'

export const fetchUserData = async (
    userID: string,
    accessToken: string
): Promise<UserData> => {
    const response = await CapacitorHttp.post({
        url: `${baseUrl}/api/home-page`,
        data: { userID },
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
    })

    if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to fetch user data')
    }

    return response.data
}
