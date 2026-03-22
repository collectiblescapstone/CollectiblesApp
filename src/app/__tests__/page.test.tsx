import '@testing-library/jest-dom'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Page from '../page'

jest.mock('@chakra-ui/react', () => {
    return {
        __esModule: true,
        Flex: (props: any) => <div>{props.children}</div>,
        Button: (props: any) => (
            <button onClick={props.onClick}>{props.children}</button>
        ),
        Text: (props: any) => <span>{props.children}</span>,
        HStack: (props: any) => <div>{props.children}</div>,
        VStack: (props: any) => <div>{props.children}</div>
    }
})

jest.mock('next/link', () => {
    return ({ href, children, ...props }: any) => {
        const resolvedHref =
            typeof href === 'string' ? href : href?.pathname || ''
        return (
            <a href={resolvedHref} {...props}>
                {children}
            </a>
        )
    }
})

jest.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: jest.fn(() => false)
    }
}))

jest.mock('../../context/AuthProvider.tsx', () => ({
    __esModule: true,
    useAuth: jest.fn(() => ({
        session: null
    }))
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn()
    })
}))

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
                /Kollec is a final year computer science capstone project/i
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

        expect(screen.getByRole('button', { name: /FAQ/i })).toBeInTheDocument()

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

        const start = new Date(2026, 3, 7, 9, 59, 50)

        ;(jest as any).setSystemTime(start)

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

        const afterTarget = new Date(2026, 3, 7, 10, 0, 1)

        ;(jest as any).setSystemTime(afterTarget)

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
