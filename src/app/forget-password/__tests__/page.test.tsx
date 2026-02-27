import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ForgetPasswordPage from '../page'
import { FlexProps } from '@chakra-ui/react'

jest.mock('../../../components/auth/ForgetPasswordForm', () => ({
    __esModule: true,
    default: () => <div data-testid="forget-password-form" />
}))

jest.mock('@chakra-ui/react', () => {
    return {
        __esModule: true,
        Flex: (props: FlexProps) => (
            <div data-testid="flex">{props.children}</div>
        )
    }
})

describe('ForgetPasswordPage', () => {
    it('renders AuthForm with type signin', () => {
        render(<ForgetPasswordPage />)
        const authForm = screen.getByTestId('forget-password-form')
        expect(authForm).toBeInTheDocument()
        expect(screen.getByTestId('flex')).toBeInTheDocument()
    })
})
