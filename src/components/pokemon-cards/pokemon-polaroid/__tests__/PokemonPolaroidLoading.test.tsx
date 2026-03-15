import { renderWithTheme } from '../../../../utils/testing-utils'
import PokemonPolaroidLoading from '../PokemonPolaroidLoading'

describe('PokemonPolaroidLoading', () => {
    describe('Rendering', () => {
        it('renders the loading component', () => {
            renderWithTheme(<PokemonPolaroidLoading />)

            const spinner = document.querySelector('.chakra-spinner')
            expect(spinner).toBeInTheDocument()
        })

        it('renders with correct structure', () => {
            const { container } = renderWithTheme(<PokemonPolaroidLoading />)

            const boxElement = container.firstChild as HTMLElement
            expect(boxElement).toBeInTheDocument()
            expect(boxElement.tagName).toBe('BUTTON')
        })

        it('renders as a button element', () => {
            const { container } = renderWithTheme(<PokemonPolaroidLoading />)

            const buttonElement = container.querySelector('button')
            expect(buttonElement).toBeInTheDocument()
        })

        it('has hover and active states configured', () => {
            const { container } = renderWithTheme(<PokemonPolaroidLoading />)

            const boxElement = container.firstChild as HTMLElement
            expect(boxElement).toBeInTheDocument()
        })
    })
})
