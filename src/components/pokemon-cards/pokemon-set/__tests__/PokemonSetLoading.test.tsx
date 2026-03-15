import { renderWithTheme } from '../../../../utils/testing-utils'
import PokemonSetLoading from '../PokemonSetLoading'

describe('PokemonSetLoading', () => {
    describe('Rendering', () => {
        it('renders the loading component', () => {
            renderWithTheme(<PokemonSetLoading />)

            const spinner = document.querySelector('.chakra-spinner')
            expect(spinner).toBeInTheDocument()
        })

        it('renders with centered text alignment', () => {
            const { container } = renderWithTheme(<PokemonSetLoading />)

            const boxElement = container.firstChild as HTMLElement
            expect(boxElement).toHaveStyle({
                textAlign: 'center'
            })
        })

        it('renders spinner with xl size', () => {
            renderWithTheme(<PokemonSetLoading />)

            const spinner = document.querySelector('.chakra-spinner')
            expect(spinner).toBeInTheDocument()
        })
    })
})
