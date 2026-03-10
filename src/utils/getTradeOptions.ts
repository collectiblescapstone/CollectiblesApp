import { CapacitorHttp } from '@capacitor/core'
import { baseUrl } from '@/utils/constants'
import { ViableOption } from '@/types/tradepost'

export const fetchTradeOptions = async (
    userID: string
): Promise<{ viableOptions: ViableOption[] }> => {
    const response = await CapacitorHttp.post({
        url: `${baseUrl}/api/get-viable-options`,
        data: { userID },
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to fetch viable options')
    }

    return response.data
}
