import { screen, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../../../../utils/testing-utils'
import PokemonCardHeader from '../PokemonCardHeader'

// Mock PokemonCardsProvider
const mockPokemonCards: Record<string, any> = {
    'sv01-001': {
        name: 'Pikachu',
        image_url: 'https://example.com/pikachu.png',
        setId: 'sv01',
        category: 'Pokemon',
        rarity: 'Rare',
        illustrator: 'Test Artist'
    },
    'sv01-002': {
        name: 'Charizard',
        image_url: 'undefined/low.png',
        setId: 'sv02',
        category: 'Trainer',
        rarity: 'Common',
        illustrator: 'Another Artist'
    },
    'sv01-003': {
        name: 'Mewtwo',
        image_url: '',
        setId: 'sv03',
        category: 'Pokemon',
        rarity: 'Unknown Rarity',
        illustrator: 'Mystery Artist'
    }
}

const mockPokemonSets: Record<string, any> = {
    sv01: {
        name: 'Scarlet & Violet',
        official: 150
    },
    sv02: {
        name: 'Paldea Evolved',
        official: 200
    },
    sv03: {
        name: 'Obsidian Flames',
        official: 0
    }
}

jest.mock('../../../../context/PokemonCardsProvider', () => ({
    usePokemonCards: jest.fn(() => ({
        pokemonCards: mockPokemonCards,
        pokemonSets: mockPokemonSets
    }))
}))

// Mock utility functions
jest.mock('../../../../utils/capitalize', () => ({
    capitalizeEachWord: jest.fn((str: string) => str)
}))

jest.mock('../../../../utils/cardInfo/raritytoImage', () => ({
    checkRarityExists: jest.fn((rarity: string) => rarity !== 'Unknown Rarity'),
    getRarityImage: jest.fn((rarity: string) => `/images/rarity/${rarity}.png`)
}))

// Mock react-icons
jest.mock('react-icons/fa', () => ({
    FaPaintBrush: () => <div data-testid="paint-brush-icon">PaintBrush</div>,
    FaTools: () => <div data-testid="tools-icon">Tools</div>
}))

describe('PokemonCardHeader', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Loading State', () => {
        it('eventually displays card after loading', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-001" />)

            await waitFor(() => {
                expect(screen.getByText('Pikachu')).toBeInTheDocument()
            })
        })
    })

    describe('Card Information Display', () => {
        it('renders card name', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-001" />)

            await waitFor(() => {
                expect(screen.getByText('Pikachu')).toBeInTheDocument()
            })
        })

        it('renders card image', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-001" />)

            await waitFor(() => {
                const image = screen.getByAltText('Pikachu')
                expect(image).toBeInTheDocument()
                expect(image).toHaveAttribute(
                    'src',
                    'https://example.com/pikachu.png'
                )
            })
        })

        it('renders fallback image for undefined/low.png', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-002" />)

            await waitFor(() => {
                const image = screen.getByAltText('Charizard')
                expect(image).toHaveAttribute(
                    'src',
                    '/Images/PokemonCardBack.jpg'
                )
            })
        })

        it('renders fallback image for empty string', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-003" />)

            await waitFor(() => {
                const image = screen.getByAltText('Mewtwo')
                expect(image).toHaveAttribute(
                    'src',
                    '/Images/PokemonCardBack.jpg'
                )
            })
        })

        it('displays card number with set count', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-001" />)

            await waitFor(() => {
                expect(screen.getByText('001/150')).toBeInTheDocument()
            })
        })

        it('displays card number without set count when set count is 0', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-003" />)

            await waitFor(() => {
                expect(screen.getByText('003')).toBeInTheDocument()
            })
        })

        it('displays set name', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-001" />)

            await waitFor(() => {
                expect(screen.getByText('Scarlet & Violet')).toBeInTheDocument()
            })
        })

        it('displays illustrator name', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-001" />)

            await waitFor(() => {
                expect(screen.getByText('Test Artist')).toBeInTheDocument()
            })
        })
    })

    describe('Pokemon Category', () => {
        it('displays Pokemon icon and label for Pokemon category', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-001" />)

            await waitFor(() => {
                expect(screen.getByText('Pokémon')).toBeInTheDocument()
                const pokemonIcon = screen.getByAltText('Pokémon')
                expect(pokemonIcon).toHaveAttribute(
                    'src',
                    '/Images/PokeBall.svg'
                )
            })
        })

        it('displays Trainer icon and label for Trainer category', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-002" />)

            await waitFor(() => {
                expect(screen.getByText('Trainer')).toBeInTheDocument()
                expect(screen.getByTestId('tools-icon')).toBeInTheDocument()
            })
        })
    })

    describe('Rarity Display', () => {
        it('displays rarity image and text', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-001" />)

            await waitFor(() => {
                const rarityImage = screen.getByAltText('Rare')
                expect(rarityImage).toBeInTheDocument()
                expect(rarityImage).toHaveAttribute(
                    'src',
                    '/images/rarity/Rare.png'
                )
            })
        })

        it('falls back to Common rarity when rarity does not exist', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-003" />)

            await waitFor(() => {
                const rarityImage = screen.getByAltText('Unknown Rarity')
                expect(rarityImage).toBeInTheDocument()
                expect(rarityImage).toHaveAttribute(
                    'src',
                    '/images/rarity/Common.png'
                )
            })
        })
    })

    describe('Illustrator Display', () => {
        it('displays paint brush icon with illustrator', async () => {
            renderWithTheme(<PokemonCardHeader cardId="sv01-001" />)

            await waitFor(() => {
                expect(
                    screen.getByTestId('paint-brush-icon')
                ).toBeInTheDocument()
                expect(screen.getByText('Test Artist')).toBeInTheDocument()
            })
        })
    })

    describe('Error Handling', () => {
        it('handles missing card data gracefully', async () => {
            const {
                usePokemonCards
            } = require('../../../../context/PokemonCardsProvider')
            usePokemonCards.mockReturnValue({
                pokemonCards: {},
                pokemonSets: {}
            })

            renderWithTheme(<PokemonCardHeader cardId="nonexistent" />)

            await waitFor(() => {
                const spinner = document.querySelector('.chakra-spinner')
                expect(spinner).toBeInTheDocument()
            })
        })

        it('handles missing set information', async () => {
            const {
                usePokemonCards
            } = require('../../../../context/PokemonCardsProvider')
            usePokemonCards.mockReturnValue({
                pokemonCards: {
                    'test-001': {
                        name: 'Test Card',
                        image_url: 'test.png',
                        setId: undefined,
                        category: 'Pokemon',
                        rarity: 'Common',
                        illustrator: 'Test'
                    }
                },
                pokemonSets: {}
            })

            renderWithTheme(<PokemonCardHeader cardId="test-001" />)

            await waitFor(() => {
                expect(screen.getByText('Test Card')).toBeInTheDocument()
            })
        })
    })
})
