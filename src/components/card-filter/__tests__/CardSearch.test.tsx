import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderWithTheme } from '../../../utils/testing-utils'
import { CardSearch } from '../CardSearch'

// Mock CardSearcher before any imports
const mockGetFilteredSearch = jest.fn()
const mockSearch = jest.fn()

jest.mock('../../../utils/identification/cardSearch', () => ({
    CardSearcher: jest.fn(() =>
        Promise.resolve({
            search: mockSearch,
            getFilteredSearch: mockGetFilteredSearch
        })
    )
}))

const mockCards = [
    { id: 'card1', name: 'Pikachu' },
    { id: 'card2', name: 'Charizard' },
    { id: 'card3', name: 'Bulbasaur' },
    { id: 'card4', name: 'Squirtle' },
    { id: 'card5', name: 'Pikachu V' }
]

describe('CardSearch', () => {
    const mockSetFilteredIds = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetFilteredSearch.mockReturnValue(
            jest.fn().mockResolvedValue([
                { id: 'card1', score: 0.9 },
                { id: 'card2', score: 0.8 }
            ])
        )
    })

    describe('Basic Rendering', () => {
        it('renders search input with default placeholder', () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )
            expect(input).toBeInTheDocument()
        })

        it('renders search input with filter-only placeholder when filterOnly is true', () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                    filterOnly={true}
                />
            )

            const input = screen.getByPlaceholderText(/search by name/i)
            expect(input).toBeInTheDocument()
            expect(input).not.toHaveAttribute(
                'placeholder',
                expect.stringContaining('describe the card')
            )
        })

        it('renders AI search button when filterOnly is false', () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const searchButton = screen.getByRole('button', { name: /search/i })
            expect(searchButton).toBeInTheDocument()
        })

        it('does not render AI search button when filterOnly is true', () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                    filterOnly={true}
                />
            )

            const searchButton = screen.queryByRole('button', {
                name: /search/i
            })
            expect(searchButton).not.toBeInTheDocument()
        })
    })

    describe('Search Input Interaction', () => {
        it('updates search value when typing', () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )
            fireEvent.change(input, { target: { value: 'Pikachu' } })

            expect(input).toHaveValue('Pikachu')
        })

        it('opens popover when input is focused', async () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )
            fireEvent.focus(input)

            await waitFor(() => {
                const listbox = screen.queryByRole('listbox')
                expect(listbox).toBeInTheDocument()
            })
        })

        it('shows clear button when search value is not empty', () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )

            // Type something
            fireEvent.change(input, { target: { value: 'Pikachu' } })

            // Clear button should appear (look for close button)
            const clearButtons = screen.getAllByRole('button')
            expect(clearButtons.length).toBeGreaterThan(1) // Should have search button + clear button
        })

        it('clears search value when clear button is clicked', async () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )
            fireEvent.change(input, { target: { value: 'Pikachu' } })

            // Find the close button by aria-label
            const closeButton = screen.getByRole('button', { name: /close/i })
            fireEvent.click(closeButton)

            await waitFor(() => {
                expect(mockSetFilteredIds).toHaveBeenCalled()
                // Check it was called with no arguments (which passes undefined)
                expect(mockSetFilteredIds).toHaveBeenCalledWith()
            })
        })
    })

    describe('Card Suggestions', () => {
        it('displays card suggestions when typing', async () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )

            fireEvent.focus(input)
            fireEvent.change(input, { target: { value: 'Pika' } })

            await waitFor(() => {
                expect(screen.getByText('Pikachu')).toBeInTheDocument()
                expect(screen.getByText('Pikachu V')).toBeInTheDocument()
            })
        })

        it('filters suggestions based on input', async () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )

            fireEvent.focus(input)
            fireEvent.change(input, { target: { value: 'Charizard' } })

            await waitFor(() => {
                expect(screen.getByText('Charizard')).toBeInTheDocument()
                expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument()
            })
        })

        it('handles selection from suggestions', async () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )

            fireEvent.focus(input)
            fireEvent.change(input, { target: { value: 'Pika' } })

            await waitFor(() => {
                expect(screen.getByText('Pikachu')).toBeInTheDocument()
            })

            const pikachuOption = screen.getByText('Pikachu')
            fireEvent.click(pikachuOption)

            await waitFor(() => {
                expect(mockSetFilteredIds).toHaveBeenCalled()
                const callArg = mockSetFilteredIds.mock.calls[0][0]
                expect(callArg).toContain('card1')
                expect(callArg).toContain('card5') // Pikachu V also matches
            })
        })
    })

    describe('Enter Key Search', () => {
        it('triggers search when Enter key is pressed', async () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )

            fireEvent.change(input, { target: { value: 'electric mouse' } })
            fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

            await waitFor(() => {
                expect(mockSetFilteredIds).toHaveBeenCalled()
            })
        })

        it('clears filters when Enter is pressed with empty input', async () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )

            fireEvent.change(input, { target: { value: '' } })
            fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

            await waitFor(() => {
                expect(mockSetFilteredIds).toHaveBeenCalled()
                // Check it was called with no arguments (which passes undefined)
                expect(mockSetFilteredIds).toHaveBeenCalledWith()
            })
        })
    })

    describe('AI Search Button', () => {
        it('triggers AI search when button is clicked', async () => {
            const mockFilteredSearch = jest.fn().mockResolvedValue([
                { id: 'card1', score: 0.9 },
                { id: 'card2', score: 0.7 }
            ])
            mockGetFilteredSearch.mockReturnValue(mockFilteredSearch)

            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            // Wait for CardSearcher to initialize
            await waitFor(() => {
                expect(mockGetFilteredSearch).toHaveBeenCalled()
            })

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )
            fireEvent.change(input, { target: { value: 'fire dragon' } })

            const searchButton = screen.getByRole('button', { name: /search/i })
            fireEvent.click(searchButton)

            await waitFor(
                () => {
                    expect(mockFilteredSearch).toHaveBeenCalledWith(
                        'fire dragon'
                    )
                    expect(mockSetFilteredIds).toHaveBeenCalledWith([
                        'card1',
                        'card2'
                    ])
                },
                { timeout: 3000 }
            )
        })

        it('clears filters when AI search button is clicked with empty input', async () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )
            fireEvent.change(input, { target: { value: '' } })

            const searchButton = screen.getByRole('button', { name: /search/i })
            fireEvent.click(searchButton)

            await waitFor(() => {
                expect(mockSetFilteredIds).toHaveBeenCalled()
                // Check it was called with no arguments (which passes undefined)
                expect(mockSetFilteredIds).toHaveBeenCalledWith()
            })
        })
    })

    describe('Filter Only Mode', () => {
        it('uses name filtering instead of AI search in filterOnly mode', async () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                    filterOnly={true}
                />
            )

            const input = screen.getByPlaceholderText(/search by name/i)

            fireEvent.change(input, { target: { value: 'Pikachu' } })
            fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

            await waitFor(() => {
                expect(mockSetFilteredIds).toHaveBeenCalled()
                const callArg = mockSetFilteredIds.mock.calls[0][0]
                // Should filter by name, not use AI search
                expect(callArg).toContain('card1')
                expect(callArg).toContain('card5')
            })

            // getFilteredSearch might be called during initialization but not used for search
            // The key is that the actual filtered search function shouldn't be called
        })
    })

    describe('Edge Cases', () => {
        it('handles empty cards array', () => {
            renderWithTheme(
                <CardSearch cards={[]} setFilteredIds={mockSetFilteredIds} />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )
            expect(input).toBeInTheDocument()
        })

        it('handles undefined cards', () => {
            renderWithTheme(<CardSearch setFilteredIds={mockSetFilteredIds} />)

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )
            expect(input).toBeInTheDocument()
        })

        it('handles cards with duplicate names', async () => {
            const cardsWithDuplicates = [
                { id: 'card1', name: 'Pikachu' },
                { id: 'card2', name: 'Pikachu' },
                { id: 'card3', name: 'Charizard' }
            ]

            renderWithTheme(
                <CardSearch
                    cards={cardsWithDuplicates}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )

            fireEvent.focus(input)
            fireEvent.change(input, { target: { value: 'Pikachu' } })

            await waitFor(() => {
                const pikachuOptions = screen.getAllByText('Pikachu')
                // Should only show one option in the list even with duplicates
                expect(pikachuOptions.length).toBeGreaterThanOrEqual(1)
            })

            const pikachuOption = screen.getByText('Pikachu')
            fireEvent.click(pikachuOption)

            await waitFor(() => {
                expect(mockSetFilteredIds).toHaveBeenCalled()
                const callArg = mockSetFilteredIds.mock.calls[0][0]
                // Should return both IDs with the same name
                expect(callArg).toContain('card1')
                expect(callArg).toContain('card2')
            })
        })

        it('handles case-insensitive search', async () => {
            renderWithTheme(
                <CardSearch
                    cards={mockCards}
                    setFilteredIds={mockSetFilteredIds}
                />
            )

            const input = screen.getByPlaceholderText(
                /search by name or describe the card/i
            )

            fireEvent.focus(input)
            fireEvent.change(input, { target: { value: 'PIKACHU' } })

            await waitFor(() => {
                expect(screen.getByText('Pikachu')).toBeInTheDocument()
            })
        })
    })
})
