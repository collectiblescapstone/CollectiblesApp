/** @jest-environment node */

import { jsonRequest, mockPrisma, resetApiMocks } from '@/utils/testing-utils'

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: mockPrisma
}))

import { POST } from '../route'

describe('POST /api/get-viable-options', () => {
    beforeEach(() => {
        resetApiMocks()
        mockPrisma.blockList.findMany.mockResolvedValue([])
    })

    it('returns 400 when userID is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/get-viable-options',
            'POST',
            {}
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('No userID given, fetch terminated')
    })

    it('returns 404 when user does not exist', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null)

        const request = jsonRequest(
            'http://localhost/api/get-viable-options',
            'POST',
            { userID: 'user-1' }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(404)
        expect(body.error).toBe('User not found')
    })

    it('returns viable options when there is a mutual match', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            latitude: 35,
            longitude: 139,
            wishlist: [
                { card: { id: 'c2', name: 'Card2', image_url: '2.png' } }
            ]
        })

        mockPrisma.collectionEntry.findMany
            .mockResolvedValueOnce([
                {
                    card: { id: 'c1', name: 'Card1', image_url: '1.png' }
                }
            ])
            .mockResolvedValueOnce([
                {
                    card: { id: 'c2', name: 'Card2', image_url: '2.png' },
                    user: {
                        id: 'user-2',
                        username: 'misty',
                        profile_pic: 1,
                        longitude: 139.1,
                        latitude: 35.1,
                        facebook: null,
                        instagram: null,
                        x: null,
                        discord: null,
                        whatsapp: null,
                        rating: 4,
                        rating_count: 10,
                        wishlist: [
                            {
                                card: {
                                    id: 'c1',
                                    name: 'Card1',
                                    image_url: '1.png'
                                }
                            }
                        ]
                    }
                }
            ])

        const request = jsonRequest(
            'http://localhost/api/get-viable-options',
            'POST',
            { userID: 'user-1' }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.viableOptions).toHaveLength(1)
        expect(body.viableOptions[0].user.id).toBe('user-2')
        expect(body.viableOptions[0].cardsUser1WantsFromUser2).toHaveLength(1)
        expect(body.viableOptions[0].cardsUser2WantsFromUser1).toHaveLength(1)
    })

    it('filters out options with no mutual cards', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            latitude: 35,
            longitude: 139,
            wishlist: [
                { card: { id: 'c2', name: 'Card2', image_url: '2.png' } }
            ]
        })

        mockPrisma.collectionEntry.findMany
            .mockResolvedValueOnce([
                {
                    card: { id: 'c1', name: 'Card1', image_url: '1.png' }
                }
            ])
            .mockResolvedValueOnce([
                {
                    card: { id: 'c2', name: 'Card2', image_url: '2.png' },
                    user: {
                        id: 'user-2',
                        username: 'misty',
                        profile_pic: 1,
                        longitude: 139.1,
                        latitude: 35.1,
                        facebook: null,
                        instagram: null,
                        x: null,
                        discord: null,
                        whatsapp: null,
                        rating: 4,
                        rating_count: 10,
                        wishlist: [
                            {
                                card: {
                                    id: 'unknown',
                                    name: 'No Match',
                                    image_url: 'x.png'
                                }
                            }
                        ]
                    }
                }
            ])

        const request = jsonRequest(
            'http://localhost/api/get-viable-options',
            'POST',
            { userID: 'user-1' }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.viableOptions).toHaveLength(0)
    })

    it('deduplicates cards when same user appears multiple times', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            latitude: 35,
            longitude: 139,
            wishlist: [
                { card: { id: 'c2', name: 'Card2', image_url: '2.png' } },
                { card: { id: 'c3', name: 'Card3', image_url: '3.png' } }
            ]
        })

        mockPrisma.collectionEntry.findMany
            .mockResolvedValueOnce([
                {
                    card: { id: 'c1', name: 'Card1', image_url: '1.png' }
                }
            ])
            .mockResolvedValueOnce([
                {
                    card: { id: 'c2', name: 'Card2', image_url: '2.png' },
                    user: {
                        id: 'user-2',
                        username: 'misty',
                        profile_pic: 1,
                        longitude: 139.1,
                        latitude: 35.1,
                        facebook: null,
                        instagram: null,
                        x: null,
                        discord: null,
                        whatsapp: null,
                        rating: 4,
                        rating_count: 10,
                        wishlist: [
                            {
                                card: {
                                    id: 'c1',
                                    name: 'Card1',
                                    image_url: '1.png'
                                }
                            }
                        ]
                    }
                },
                {
                    card: { id: 'c3', name: 'Card3', image_url: '3.png' },
                    user: {
                        id: 'user-2',
                        username: 'misty',
                        profile_pic: 1,
                        longitude: 139.1,
                        latitude: 35.1,
                        facebook: null,
                        instagram: null,
                        x: null,
                        discord: null,
                        whatsapp: null,
                        rating: 4,
                        rating_count: 10,
                        wishlist: [
                            {
                                card: {
                                    id: 'c1',
                                    name: 'Card1',
                                    image_url: '1.png'
                                }
                            }
                        ]
                    }
                }
            ])

        const request = jsonRequest(
            'http://localhost/api/get-viable-options',
            'POST',
            { userID: 'user-1' }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.viableOptions).toHaveLength(1)
        expect(body.viableOptions[0].cardsUser1WantsFromUser2).toHaveLength(2)
        expect(body.viableOptions[0].cardsUser2WantsFromUser1).toHaveLength(1)
    })
})
