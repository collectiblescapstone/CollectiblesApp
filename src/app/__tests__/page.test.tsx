import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Page from '../page'
import {
    ButtonProps,
    FlexProps,
    HeadingProps,
    TextProps
} from '@chakra-ui/react'

jest.mock('@chakra-ui/react', () => {
    return {
        __esModule: true,

        Flex: ({ children }: FlexProps & { children?: React.ReactNode }) => (
            <div>{children}</div>
        ),
        Heading: ({
            children
        }: HeadingProps & { children?: React.ReactNode }) => (
            <h1>{children}</h1>
        ),
        Text: ({ children }: TextProps & { children?: React.ReactNode }) => (
            <p>{children}</p>
        ),
        Button: ({
            children,
            onClick
        }: ButtonProps & {
            children?: React.ReactNode
            onClick?: () => void
        }) => <button onClick={onClick}>{children}</button>,

        Tabs: {
            Root: ({ children }: { children?: React.ReactNode }) => (
                <div data-testid="tabs-root">{children}</div>
            ),
            List: ({ children }: { children?: React.ReactNode }) => (
                <div data-testid="tabs-list">{children}</div>
            ),
            Trigger: ({ children }: { children?: React.ReactNode }) => (
                <button type="button">{children}</button>
            ),
            Indicator: ({ children }: { children?: React.ReactNode }) => (
                <div data-testid="tabs-indicator">{children}</div>
            ),
            Content: ({ children }: { children?: React.ReactNode }) => (
                <div>{children}</div>
            )
        }
    }
})

jest.mock('@/components/logo/Logo', () => ({
    Logo: () => <svg data-testid="logo" />
}))

describe('Landing Page', () => {
    afterEach(() => {
        jest.useRealTimers()
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    it('renders static landing content', () => {
        render(<Page />)

        expect(
            screen.getByText(
                /Kollec is a collection management platform developed as a final year Computer Science capstone project at McMaster University/i
            )
        ).toBeInTheDocument()

        expect(screen.getByText(/2026 TSH B129/i)).toBeInTheDocument()

        expect(screen.getByTestId('logo')).toBeInTheDocument()

        expect(screen.getByText('Kollec')).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: /About/i })
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: /Features/i })
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Sign Up/i })
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: /Login/i })
        ).toBeInTheDocument()

        const signupAnchor = screen.getByLabelText('Go to Sign Up page')
        const loginAnchor = screen.getByLabelText('Go to Login page')

        expect(signupAnchor).toHaveAttribute('href', '/sign-up')
        expect(loginAnchor).toHaveAttribute('href', '/sign-in')
    })

    it('shows a countdown timer and updates as time advances', () => {
        jest.useFakeTimers()

        // Start 10 seconds before target
        const start = new Date(2026, 3, 7, 9, 59, 50)

        ;(
            jest as unknown as { setSystemTime?: (date: number | Date) => void }
        ).setSystemTime?.(start)

        act(() => {
            render(<Page />)
        })

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(screen.getByText(/0:00:00:0?9/)).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        expect(screen.getByText(/0:00:00:0?6/)).toBeInTheDocument()
    })

    it('shows launch message when target time is reached or passed', () => {
        jest.useFakeTimers()

        // Set time just after target
        const afterTarget = new Date(2026, 3, 7, 10, 0, 1)
        ;(
            jest as unknown as { setSystemTime?: (date: number | Date) => void }
        ).setSystemTime?.(afterTarget)

        act(() => {
            render(<Page />)
        })

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(
            screen.getByText(/Come see our demo at the capstone expo!/i)
        ).toBeInTheDocument()
    })

    it('handles anchor clicks by scrolling to and focusing the target element', () => {
        render(<Page />)

        const mockEl = {
            scrollIntoView: jest.fn(),
            focus: jest.fn()
        } as unknown as HTMLElement

        const spy = jest
            .spyOn(document, 'getElementById')
            .mockImplementation((id: string) => {
                return id === 'about' ? mockEl : null
            })

        fireEvent.click(screen.getByRole('button', { name: /About/i }))

        expect(spy).toHaveBeenCalledWith('about')

        expect(mockEl.scrollIntoView).toHaveBeenCalledWith({
            behavior: 'smooth',
            block: 'start'
        })

        expect(mockEl.focus).toHaveBeenCalledWith({ preventScroll: true })
    })
})
