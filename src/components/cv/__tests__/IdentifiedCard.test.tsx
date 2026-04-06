import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { renderWithTheme } from '@/utils/testing-utils'
import { IdentifiedCard } from '../IdentifiedCard'
import { CapacitorHttp } from '@capacitor/core'

jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: any }) => {
        const value =
            typeof href === 'string'
                ? href
                : `${href.pathname}?cardId=${href.query?.cardId ?? ''}`
        return <a href={value}>{children}</a>
    }
})

describe('IdentifiedCard', () => {
    const alertMock = jest.fn()
    const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)

    const data = {
        hash: 'hash',
        hashBits: 'bits',
        card: {
            id: 'sv1-1',
            name: 'Bulbasaur',
            image: 'https://img/card',
            set: {
                id: 'sv1',
                name: 'Scarlet & Violet',
                cardCount: { official: 1, total: 1 }
            }
        }
    } as any

    const session = {
        user: { id: 'user-1' },
        access_token: 'token-1'
    } as any

    beforeAll(() => {
        Object.defineProperty(global, 'alert', {
            writable: true,
            value: alertMock
        })
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterAll(() => {
        consoleErrorSpy.mockRestore()
    })

    it('renders card details and user-card link', () => {
        renderWithTheme(
            <IdentifiedCard
                data={data}
                imageURL="https://img/low.jpg"
                session={session}
            />
        )

        expect(screen.getByText('Bulbasaur (1)')).toBeInTheDocument()
        expect(screen.getByText('Scarlet & Violet')).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: 'identified card' })
        ).toHaveAttribute('src', 'https://img/low.jpg')
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            '/user-cards?cardId=sv1-1'
        )
    })

    it('disables instant add button when no session exists', () => {
        renderWithTheme(
            <IdentifiedCard
                data={data}
                imageURL="https://img/low.jpg"
                session={null}
            />
        )

        expect(
            screen.getByRole('button', { name: /instant add/i })
        ).toBeDisabled()
    })

    it.skip('submits instant add payload and shows success alert', async () => {
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 200,
            data: {}
        })
        const onInstantAdd = jest.fn()

        renderWithTheme(
            <IdentifiedCard
                data={data}
                imageURL="https://img/low.jpg"
                session={session}
                onInstantAdd={onInstantAdd}
            />
        )

        fireEvent.click(screen.getByRole('button', { name: /instant add/i }))

        await waitFor(() => {
            expect(onInstantAdd).toHaveBeenCalledTimes(1)
            expect(CapacitorHttp.post).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        Authorization: 'Bearer token-1'
                    })
                })
            )
            expect(alertMock).toHaveBeenCalledWith(
                'Card saved to your collection'
            )
        })
    })

    it('shows API error alert when save fails', async () => {
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 500,
            data: { error: 'Nope' }
        })

        renderWithTheme(
            <IdentifiedCard
                data={data}
                imageURL="https://img/low.jpg"
                session={session}
            />
        )

        fireEvent.click(screen.getByRole('button', { name: /instant add/i }))

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith('Nope')
        })
    })

    it.skip('shows fallback alert on thrown error', async () => {
        ;(CapacitorHttp.post as jest.Mock).mockRejectedValue(new Error('boom'))

        renderWithTheme(
            <IdentifiedCard
                data={data}
                imageURL="https://img/low.jpg"
                session={session}
            />
        )

        fireEvent.click(screen.getByRole('button', { name: /instant add/i }))

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(
                'Unexpected error saving card'
            )
        })
    })

    it('calls onInstantAdd and exits early when session user id is missing', async () => {
        const onInstantAdd = jest.fn()

        renderWithTheme(
            <IdentifiedCard
                data={data}
                imageURL="https://img/low.jpg"
                session={{ access_token: 'token' } as any}
                onInstantAdd={onInstantAdd}
            />
        )

        fireEvent.click(screen.getByRole('button', { name: /instant add/i }))

        await waitFor(() => {
            expect(onInstantAdd).toHaveBeenCalledTimes(1)
            expect(CapacitorHttp.post).not.toHaveBeenCalled()
        })
    })
})
