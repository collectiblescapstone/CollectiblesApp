import React from 'react'
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Showcase from '../Showcase'
import { renderWithTheme } from '../../../utils/testing-utils'
import { PokemonCardImage } from '../../../types/personal-profile'

// Mock the Divider component
jest.mock('../Divider', () => {
    return function MockDivider() {
        return <div data-testid="divider" />
    }
})

describe('Showcase', () => {
    describe('Empty State', () => {
        it('renders empty state message when showcaseList is empty', () => {
            renderWithTheme(<Showcase showcaseList={[]} />)

            expect(
                screen.getByText('User has not added any cards...yet')
            ).toBeInTheDocument()
        })

        it('renders Showcase title in empty state', () => {
            renderWithTheme(<Showcase showcaseList={[]} />)

            expect(screen.getByText('Showcase')).toBeInTheDocument()
        })

        it('renders Divider in empty state', () => {
            renderWithTheme(<Showcase showcaseList={[]} />)

            expect(screen.getByTestId('divider')).toBeInTheDocument()
        })
    })

    describe('With Cards', () => {
        const mockCards: PokemonCardImage[] = [
            { name: 'Pikachu', image: 'pikachu.png' },
            { name: 'Charizard', image: 'charizard.png' },
            { name: 'Blastoise', image: 'blastoise.png' }
        ]

        it('renders Showcase title when cards are present', () => {
            renderWithTheme(<Showcase showcaseList={mockCards} />)

            expect(screen.getByText('Showcase')).toBeInTheDocument()
        })

        it('renders Divider when cards are present', () => {
            renderWithTheme(<Showcase showcaseList={mockCards} />)

            expect(screen.getByTestId('divider')).toBeInTheDocument()
        })

        it('renders card images with correct alt text', () => {
            renderWithTheme(<Showcase showcaseList={mockCards} />)

            expect(screen.getByAltText('Pikachu')).toBeInTheDocument()
            expect(screen.getByAltText('Charizard')).toBeInTheDocument()
            expect(screen.getByAltText('Blastoise')).toBeInTheDocument()
        })

        it('renders card images with correct src', () => {
            renderWithTheme(<Showcase showcaseList={mockCards} />)

            const pikachuImg = screen.getByAltText('Pikachu')
            const charizardImg = screen.getByAltText('Charizard')

            expect(pikachuImg).toHaveAttribute('src', 'pikachu.png')
            expect(charizardImg).toHaveAttribute('src', 'charizard.png')
        })

        it('does not render empty state message when cards exist', () => {
            renderWithTheme(<Showcase showcaseList={mockCards} />)

            expect(
                screen.queryByText('User has not added any cards...yet')
            ).not.toBeInTheDocument()
        })
    })

    describe('Card Limit', () => {
        it('displays only first 3 cards when more than 3 are provided', () => {
            const manyCards: PokemonCardImage[] = [
                { name: 'Card1', image: 'card1.png' },
                { name: 'Card2', image: 'card2.png' },
                { name: 'Card3', image: 'card3.png' },
                { name: 'Card4', image: 'card4.png' },
                { name: 'Card5', image: 'card5.png' }
            ]

            renderWithTheme(<Showcase showcaseList={manyCards} />)

            // First 3 should be rendered
            expect(screen.getByAltText('Card1')).toBeInTheDocument()
            expect(screen.getByAltText('Card2')).toBeInTheDocument()
            expect(screen.getByAltText('Card3')).toBeInTheDocument()

            // 4th and 5th should not be rendered
            expect(screen.queryByAltText('Card4')).not.toBeInTheDocument()
            expect(screen.queryByAltText('Card5')).not.toBeInTheDocument()
        })

        it('displays all cards when fewer than 3 are provided', () => {
            const fewCards: PokemonCardImage[] = [
                { name: 'CardA', image: 'cardA.png' },
                { name: 'CardB', image: 'cardB.png' }
            ]

            renderWithTheme(<Showcase showcaseList={fewCards} />)

            expect(screen.getByAltText('CardA')).toBeInTheDocument()
            expect(screen.getByAltText('CardB')).toBeInTheDocument()
        })

        it('displays exactly 3 cards when exactly 3 are provided', () => {
            const threeCards: PokemonCardImage[] = [
                { name: 'One', image: 'one.png' },
                { name: 'Two', image: 'two.png' },
                { name: 'Three', image: 'three.png' }
            ]

            renderWithTheme(<Showcase showcaseList={threeCards} />)

            expect(screen.getByAltText('One')).toBeInTheDocument()
            expect(screen.getByAltText('Two')).toBeInTheDocument()
            expect(screen.getByAltText('Three')).toBeInTheDocument()
        })
    })

    describe('Single Card', () => {
        it('renders single card correctly', () => {
            const singleCard: PokemonCardImage[] = [
                { name: 'Mewtwo', image: 'mewtwo.png' }
            ]

            renderWithTheme(<Showcase showcaseList={singleCard} />)

            expect(screen.getByAltText('Mewtwo')).toBeInTheDocument()
            expect(screen.getByAltText('Mewtwo')).toHaveAttribute(
                'src',
                'mewtwo.png'
            )
        })
    })
})
