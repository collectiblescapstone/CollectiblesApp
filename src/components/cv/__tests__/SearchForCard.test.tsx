import React from 'react'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { renderWithTheme } from '@/utils/testing-utils'
import { SearchForCard } from '../SearchForCard'

const mockSearch = jest.fn()
const mockGetFilteredCards = jest.fn()
const mockCardSearcher = jest.fn(async () => ({ search: mockSearch }))

jest.mock('@/utils/identification/cardSearch', () => ({
    CardSearcher: () => mockCardSearcher()
}))

jest.mock('@/context/PokemonCardsProvider', () => ({
    usePokemonCards: () => ({
        getFilteredCards: mockGetFilteredCards
    })
}))

jest.mock('@/components/profiles/Divider', () => {
    return function MockDivider() {
        return <div data-testid="divider" />
    }
})

describe('SearchForCard', () => {
    const renderReady = async () => {
        renderWithTheme(<SearchForCard />)
        await waitFor(() => {
            expect(mockCardSearcher).toHaveBeenCalledTimes(1)
        })

        await act(async () => {
            await Promise.resolve()
        })
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders base UI', () => {
        renderWithTheme(<SearchForCard />)

        expect(screen.getByTestId('divider')).toBeInTheDocument()
        expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('does nothing when key is not Enter', async () => {
        await renderReady()

        const input = screen.getByRole('textbox')
        fireEvent.keyDown(input, { key: 'a' })

        await waitFor(() => {
            expect(mockSearch).not.toHaveBeenCalled()
            expect(mockGetFilteredCards).not.toHaveBeenCalled()
        })
    })

    it('runs search on Enter and renders rounded score and card image', async () => {
        mockSearch.mockResolvedValue([
            { id: 'sv1-1', score: 0.12345 },
            { id: 'sv1-2', score: 0.9 }
        ])
        mockGetFilteredCards.mockResolvedValue([
            { id: 'sv1-1', image_url: 'img-1' },
            { id: 'sv1-2', image_url: 'img-2' }
        ])

        await renderReady()

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'bulbasaur' } })
        fireEvent.keyDown(input, { key: 'Enter' })

        await waitFor(
            () => {
                expect(mockSearch).toHaveBeenCalledWith(
                    'bulbasaur',
                    undefined,
                    100
                )
                expect(mockGetFilteredCards).toHaveBeenCalledWith({
                    ids: ['sv1-1', 'sv1-2']
                })
            },
            { timeout: 5000 }
        )

        expect(screen.getByText('Score: 0.123')).toBeInTheDocument()
        expect(screen.getByText('Score: 0.9')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'sv1-1' })).toHaveAttribute(
            'src',
            'img-1'
        )
        expect(screen.getByRole('img', { name: 'sv1-2' })).toHaveAttribute(
            'src',
            'img-2'
        )
    })

    it('renders result row even when card details are missing', async () => {
        mockSearch.mockResolvedValue([{ id: 'sv1-404', score: 0.55 }])
        mockGetFilteredCards.mockResolvedValue([])

        await renderReady()

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'unknown card' } })
        fireEvent.keyDown(input, { key: 'Enter' })

        await waitFor(
            () => {
                expect(screen.getByText('Score: 0.55')).toBeInTheDocument()
                expect(
                    screen.getByRole('img', { name: 'sv1-404' })
                ).toBeInTheDocument()
            },
            { timeout: 5000 }
        )
    })
})
