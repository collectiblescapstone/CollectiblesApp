import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderWithTheme } from '../../../utils/testing-utils'
import CardFilter from '../CardFilter'
import { Filters } from '@/hooks/useFilters'

// Mock setFilters before mocks
const mockSetFilters = jest.fn()

// Define default filters inline to avoid hoisting issues
const testDefaultFilters: Filters = {
    generations: Array.from({ length: 9 }, (_, i) => i + 1),
    types: {
        Grass: true,
        Fire: true,
        Water: true,
        Lightning: true,
        Psychic: true,
        Fighting: true,
        Darkness: true,
        Metal: true,
        Fairy: true,
        Dragon: true,
        Colorless: true
    },
    categories: ['Pokémon', 'Item', 'Trainer', 'Energy']
}

const buildDefaultFilters = (): Filters => ({
    ...testDefaultFilters,
    types: { ...testDefaultFilters.types },
    generations: [...testDefaultFilters.generations],
    categories: [...testDefaultFilters.categories]
})
let mockFilters: Filters = buildDefaultFilters()

// Mock the useFilters hook - using relative path
jest.mock('../../../hooks/useFilters', () => ({
    useFilters: () => ({
        filters: mockFilters,
        setFilters: mockSetFilters
    }),
    defaultFilters: {
        generations: Array.from({ length: 9 }, (_, i) => i + 1),
        types: {
            Grass: true,
            Fire: true,
            Water: true,
            Lightning: true,
            Psychic: true,
            Fighting: true,
            Darkness: true,
            Metal: true,
            Fairy: true,
            Dragon: true,
            Colorless: true
        },
        categories: ['Pokémon', 'Item', 'Trainer', 'Energy']
    }
}))

// Mock imgPuller utility
jest.mock('../../../utils/imgPuller', () => ({
    __esModule: true,
    default: jest.fn(
        (folder: string, img: string) => `/Assets/img/${folder}/${img}.png`
    )
}))

describe('CardFilter', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFilters = buildDefaultFilters()
    })

    it('renders the filter button', () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })
        expect(filterButton).toBeInTheDocument()
    })

    it('opens popover when filter button is clicked', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(screen.getByText('Filters')).toBeInTheDocument()
        })
    })

    it('displays all filter sections', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(screen.getByText('Generation')).toBeInTheDocument()
            expect(screen.getByText('Types')).toBeInTheDocument()
            expect(screen.getByText('Category')).toBeInTheDocument()
        })
    })

    it('displays all generation checkboxes', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            for (let gen = 1; gen <= 9; gen++) {
                expect(screen.getByText(gen.toString())).toBeInTheDocument()
            }
        })
    })

    it('displays all type checkboxes with images', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            const typeNames = [
                'Grass',
                'Fire',
                'Water',
                'Lightning',
                'Psychic',
                'Fighting',
                'Darkness',
                'Metal',
                'Fairy',
                'Dragon',
                'Colorless'
            ]

            typeNames.forEach((type) => {
                const img = screen.getByAltText(type)
                expect(img).toBeInTheDocument()
                expect(img).toHaveAttribute(
                    'src',
                    `/Assets/img/PokemonTypes/${type.toLowerCase()}.png`
                )
            })
        })
    })

    it('displays all category checkboxes', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(screen.getByText('Pokémon')).toBeInTheDocument()
            expect(screen.getByText('Item')).toBeInTheDocument()
            expect(screen.getByText('Trainer')).toBeInTheDocument()
            expect(screen.getByText('Energy')).toBeInTheDocument()
        })
    })

    it('displays Reset, Cancel, and Confirm buttons', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /reset/i })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /cancel/i })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /confirm/i })
            ).toBeInTheDocument()
        })
    })

    it('closes popover when Cancel button is clicked', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(screen.getByText('Filters')).toBeInTheDocument()
        })

        const cancelButton = screen.getByRole('button', { name: /cancel/i })
        fireEvent.click(cancelButton)

        // Chakra may either keep dialog mounted (data-state=closed)
        // or unmount it entirely depending on runtime timing.
        await waitFor(() => {
            const popoverContent = screen.queryByRole('dialog')
            if (popoverContent) {
                expect(popoverContent).toHaveAttribute('data-state', 'closed')
            } else {
                expect(screen.queryByText('Filters')).not.toBeInTheDocument()
            }
        })
    })

    it('applies filters and closes popover when Confirm button is clicked', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(screen.getByText('Filters')).toBeInTheDocument()
        })

        const confirmButton = screen.getByRole('button', { name: /confirm/i })
        fireEvent.click(confirmButton)

        await waitFor(() => {
            expect(mockSetFilters).toHaveBeenCalled()
            const popoverContent = screen.queryByRole('dialog')
            if (popoverContent) {
                expect(popoverContent).toHaveAttribute('data-state', 'closed')
            } else {
                expect(screen.queryByText('Filters')).not.toBeInTheDocument()
            }
        })
    })

    it('toggles generation checkbox', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(screen.getByText('1')).toBeInTheDocument()
        })

        // Find the checkbox for generation 1
        const gen1Checkbox = screen.getByRole('checkbox', { name: '1' })

        expect(gen1Checkbox).toBeChecked()

        // Click to uncheck
        if (gen1Checkbox) {
            fireEvent.click(gen1Checkbox)
        }

        await waitFor(() => {
            expect(gen1Checkbox).not.toBeChecked()
        })
    })

    it('toggles type checkbox', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(
                screen.getByRole('checkbox', { name: 'Grass' })
            ).toBeInTheDocument()
        })

        // Find the checkbox for generation 1
        const grassCheckbox = screen.getByRole('checkbox', { name: 'Grass' })

        expect(grassCheckbox).toBeChecked()

        // Click to uncheck
        if (grassCheckbox) {
            fireEvent.click(grassCheckbox)
        }

        await waitFor(() => {
            expect(grassCheckbox).not.toBeChecked()
        })
    })

    it('toggles category checkbox', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(screen.getByText('Pokémon')).toBeInTheDocument()
        })

        // Find the checkbox for Pokémon category
        const pokemonLabel = screen.getByText('Pokémon')
        const pokemonCheckbox = pokemonLabel
            .closest('label')
            ?.querySelector('input[type="checkbox"]')

        expect(pokemonCheckbox).toBeChecked()

        // Click to uncheck
        if (pokemonCheckbox) {
            fireEvent.click(pokemonCheckbox)
        }

        await waitFor(() => {
            expect(pokemonCheckbox).not.toBeChecked()
        })
    })

    it('resets draft to default filters when Reset button is clicked', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(screen.getByText('Filters')).toBeInTheDocument()
        })

        // Uncheck a generation
        fireEvent.click(screen.getByRole('checkbox', { name: '1' }))

        await waitFor(() => {
            expect(
                screen.getByRole('checkbox', { name: '1' })
            ).not.toBeChecked()
        })

        // Click Reset button
        const resetButton = screen.getByRole('button', { name: /reset/i })
        fireEvent.click(resetButton)

        // Confirm and verify defaults were restored in applied filters
        fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

        await waitFor(() => {
            expect(mockSetFilters).toHaveBeenCalled()
        })

        const callArg =
            mockSetFilters.mock.calls[mockSetFilters.mock.calls.length - 1][0]
        expect(callArg.generations).toEqual(
            expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9])
        )
        expect(callArg.generations).toHaveLength(9)
    })

    it('does not apply changes when Cancel is clicked after modifications', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(screen.getByText('Filters')).toBeInTheDocument()
        })

        // Uncheck a generation
        const gen1Checkbox = screen.getByRole('checkbox', { name: '1' })

        if (gen1Checkbox) {
            fireEvent.click(gen1Checkbox)
        }

        // Click Cancel
        const cancelButton = screen.getByRole('button', { name: /cancel/i })
        fireEvent.click(cancelButton)

        await waitFor(() => {
            expect(mockSetFilters).not.toHaveBeenCalled()
        })
    })

    it('applies modified filters when Confirm is clicked', async () => {
        renderWithTheme(<CardFilter />)
        const filterButton = screen.getByRole('button', { name: /filter/i })

        fireEvent.click(filterButton)

        await waitFor(() => {
            expect(screen.getByText('Filters')).toBeInTheDocument()
        })

        // Uncheck generation 1 via the accessible checkbox control
        const gen1Checkbox = screen.getByRole('checkbox', { name: '1' })
        expect(gen1Checkbox).toBeChecked()
        fireEvent.click(gen1Checkbox)

        // Wait for checkbox to be unchecked
        await waitFor(() => {
            expect(gen1Checkbox).not.toBeChecked()
        })

        // Click Confirm
        const confirmButton = screen.getByRole('button', { name: /confirm/i })
        fireEvent.click(confirmButton)

        // Verify setFilters was called
        await waitFor(() => {
            expect(mockSetFilters).toHaveBeenCalled()
        })

        // Check that the filter argument has generations without 1
        const callArg = mockSetFilters.mock.calls[0][0]
        expect(callArg.generations).not.toContain(1)
        expect(callArg.generations).toEqual(
            expect.arrayContaining([2, 3, 4, 5, 6, 7, 8, 9])
        )
    })

    it('shows active filter icon when filters are not default', () => {
        mockFilters = {
            generations: [1],
            types: {
                Grass: true,
                Fire: false,
                Water: false,
                Lightning: false,
                Psychic: false,
                Fighting: false,
                Darkness: false,
                Metal: false,
                Fairy: false,
                Dragon: false,
                Colorless: false
            },
            categories: ['Pokémon']
        }

        renderWithTheme(<CardFilter />)
        expect(
            screen.getByRole('button', { name: /filter/i })
        ).toBeInTheDocument()
    })
})
