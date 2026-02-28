import { renderWithTheme } from '@/utils/testing-utils'
import { screen } from '@testing-library/react'
import UnauthorizedPage from '../page'

const mockPush = jest.fn()

jest.mock('next/navigation', () => {
    return {
        useRouter: () => ({
            push: mockPush
        })
    }
})

describe('Unauthorized Page', () => {
    it('should render the Unauthorized page correctly', () => {
        renderWithTheme(<UnauthorizedPage />)

        expect(screen.getByText('401')).toBeInTheDocument()
        expect(screen.getByText('Unauthorized')).toBeInTheDocument()
        expect(
            screen.getByText(
                "You don't have permission to access this page. Please log in to continue."
            )
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Go to Login' })
        ).toBeInTheDocument()
    })

    it('should navigate to the login page on button click', () => {
        renderWithTheme(<UnauthorizedPage />)

        const loginButton = screen.getByRole('button', { name: 'Go to Login' })
        loginButton.click()

        expect(mockPush).toHaveBeenCalledWith('/sign-in')
    })
})
