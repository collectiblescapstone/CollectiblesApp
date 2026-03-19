import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import TitleLogo from '../TitleLogo'

jest.mock('@chakra-ui/react', () => {
    return {
        __esModule: true,
        Box: (props: any) => <div>{props.children}</div>,
        VStack: (props: any) => <div>{props.children}</div>,
        Heading: (props: any) => <h1>{props.children}</h1>
    }
})

jest.mock('@/components/logo/Logo', () => ({
    Logo: (props: any) => <svg data-testid="logo" {...props} />
}))

describe('TitleLogo', () => {
    it('renders the logo', () => {
        render(<TitleLogo />)

        expect(screen.getByTestId('logo')).toBeInTheDocument()
    })

    it('renders the Kollec heading', () => {
        render(<TitleLogo />)

        expect(
            screen.getByRole('heading', { name: /Kollec/i })
        ).toBeInTheDocument()
    })

    it('renders both logo and heading together', () => {
        render(<TitleLogo />)

        const logo = screen.getByTestId('logo')
        const heading = screen.getByRole('heading', {
            name: /Kollec/i
        })

        expect(logo).toBeInTheDocument()
        expect(heading).toBeInTheDocument()
    })
})
