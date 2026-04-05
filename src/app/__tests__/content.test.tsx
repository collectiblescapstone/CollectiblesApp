import '@testing-library/jest-dom'
import { screen, act } from '@testing-library/react'
import { Session, User } from '@supabase/supabase-js'

import Content, { CHAKRA_UI_LG_BREAKPOINT } from '../content'
import { useAuth } from '@/context/AuthProvider'
import { renderWithTheme } from '@/utils/testing-utils'

jest.mock('../../context/AuthProvider.tsx', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/home')
}))

jest.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: jest.fn(() => false),
        getPlatform: jest.fn(() => 'web')
    }
}))

jest.mock('@ionic/pwa-elements/loader', () => ({
    defineCustomElements: jest.fn()
}))

jest.mock('@boengli/capacitor-fullscreen', () => ({
    Fullscreen: {
        activateImmersiveMode: jest.fn()
    }
}))

jest.mock('../../components/navbar/Header.tsx', () => ({
    __esModule: true,
    default: () => <div data-testid="header">Header</div>
}))

jest.mock('../../components/navbar/Footer.tsx', () => ({
    __esModule: true,
    default: () => <div data-testid="footer">Footer</div>
}))

jest.mock('../../components/navbar/Sidebar.tsx', () => ({
    __esModule: true,
    default: () => <div data-testid="sidebar">Sidebar</div>
}))

const mockedUseAuth = jest.mocked(useAuth)

import { usePathname } from 'next/navigation'
import { Capacitor } from '@capacitor/core'

const mockedUsePathname = jest.mocked(usePathname)
const mockedCapacitor = jest.mocked(Capacitor)

import { Fullscreen } from '@boengli/capacitor-fullscreen'
const mockedFullscreen = jest.mocked(Fullscreen)

const createMockSession = (): Session => ({
    user: {
        id: 'user-1',
        email: 'test@example.com'
    } as User,
    access_token: 'token-123',
    refresh_token: 'refresh-123',
    expires_in: 3600,
    token_type: 'bearer',
    expires_at: Date.now() + 3600
})

const baseAuthContext = {
    session: createMockSession(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    signIn: jest.fn(),
    loading: false,
    signInWithGoogle: jest.fn(),
    deleteAccount: jest.fn()
}

describe('Content', () => {
    const originalInnerWidth = window.innerWidth

    beforeEach(() => {
        jest.clearAllMocks()
        mockedUsePathname.mockReturnValue('/home')
        mockedCapacitor.isNativePlatform.mockReturnValue(false)
        mockedCapacitor.getPlatform.mockReturnValue('web')
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 500 // Mobile view by default
        })
    })

    afterEach(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalInnerWidth
        })
    })

    it('exports CHAKRA_UI_LG_BREAKPOINT constant', () => {
        expect(CHAKRA_UI_LG_BREAKPOINT).toBe(992)
    })

    it('renders children directly when no session', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            session: null
        })

        renderWithTheme(
            <Content>
                <div data-testid="child-content">Child Content</div>
            </Content>
        )

        expect(screen.getByTestId('child-content')).toBeInTheDocument()
        expect(screen.queryByTestId('header')).not.toBeInTheDocument()
        expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
    })

    it('renders children directly on reset-password page even with session', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        mockedUsePathname.mockReturnValue('/reset-password')

        renderWithTheme(
            <Content>
                <div data-testid="child-content">Reset Password Content</div>
            </Content>
        )

        expect(screen.getByTestId('child-content')).toBeInTheDocument()
        expect(screen.queryByTestId('header')).not.toBeInTheDocument()
        expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
    })

    it('activates immersive mode only for authenticated android renders', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        mockedCapacitor.isNativePlatform.mockReturnValue(true)
        mockedCapacitor.getPlatform.mockReturnValue('android')

        renderWithTheme(
            <Content>
                <div data-testid="child-content">Android Content</div>
            </Content>
        )

        expect(mockedFullscreen.activateImmersiveMode).toHaveBeenCalledTimes(1)
    })

    it('does not activate immersive mode on reset-password', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        mockedUsePathname.mockReturnValue('/reset-password')
        mockedCapacitor.isNativePlatform.mockReturnValue(true)
        mockedCapacitor.getPlatform.mockReturnValue('android')

        renderWithTheme(
            <Content>
                <div data-testid="child-content">Reset Password Content</div>
            </Content>
        )

        expect(mockedFullscreen.activateImmersiveMode).not.toHaveBeenCalled()
    })

    it('renders mobile layout with Header and Footer when authenticated on mobile', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 500
        })

        renderWithTheme(
            <Content>
                <div data-testid="child-content">Mobile Content</div>
            </Content>
        )

        expect(screen.getByTestId('header')).toBeInTheDocument()
        expect(screen.getByTestId('footer')).toBeInTheDocument()
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
    })

    it('renders desktop layout with Sidebar when authenticated on desktop', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: CHAKRA_UI_LG_BREAKPOINT + 100
        })

        renderWithTheme(
            <Content>
                <div data-testid="child-content">Desktop Content</div>
            </Content>
        )

        expect(screen.getByTestId('sidebar')).toBeInTheDocument()
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
        expect(screen.queryByTestId('header')).not.toBeInTheDocument()
        expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
    })

    it('renders mobile layout when on native platform', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        mockedCapacitor.isNativePlatform.mockReturnValue(true)
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: CHAKRA_UI_LG_BREAKPOINT + 100 // Wide screen but native
        })

        renderWithTheme(
            <Content>
                <div data-testid="child-content">Native Content</div>
            </Content>
        )

        expect(screen.getByTestId('header')).toBeInTheDocument()
        expect(screen.getByTestId('footer')).toBeInTheDocument()
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
    })

    it('handles window resize from mobile to desktop', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 500
        })

        renderWithTheme(
            <Content>
                <div data-testid="child-content">Resizable Content</div>
            </Content>
        )

        // Initially mobile
        expect(screen.getByTestId('header')).toBeInTheDocument()
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()

        // Resize to desktop
        act(() => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: CHAKRA_UI_LG_BREAKPOINT + 100
            })
            window.dispatchEvent(new Event('resize'))
        })

        expect(screen.getByTestId('sidebar')).toBeInTheDocument()
        expect(screen.queryByTestId('header')).not.toBeInTheDocument()
    })

    it('handles window resize from desktop to mobile', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: CHAKRA_UI_LG_BREAKPOINT + 100
        })

        renderWithTheme(
            <Content>
                <div data-testid="child-content">Resizable Content</div>
            </Content>
        )

        // Initially desktop
        expect(screen.getByTestId('sidebar')).toBeInTheDocument()
        expect(screen.queryByTestId('header')).not.toBeInTheDocument()

        // Resize to mobile
        act(() => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 500
            })
            window.dispatchEvent(new Event('resize'))
        })

        expect(screen.getByTestId('header')).toBeInTheDocument()
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
    })

    it('cleans up resize listener on unmount', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

        const { unmount } = renderWithTheme(
            <Content>
                <div>Content</div>
            </Content>
        )

        unmount()

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'resize',
            expect.any(Function)
        )

        removeEventListenerSpy.mockRestore()
    })

    it('renders at breakpoint boundary as mobile', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: CHAKRA_UI_LG_BREAKPOINT // Exactly at breakpoint
        })

        renderWithTheme(
            <Content>
                <div data-testid="child-content">Boundary Content</div>
            </Content>
        )

        // At exactly the breakpoint, should be mobile (<=)
        expect(screen.getByTestId('header')).toBeInTheDocument()
        expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('renders just above breakpoint as desktop', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: CHAKRA_UI_LG_BREAKPOINT + 1 // Just above breakpoint
        })

        renderWithTheme(
            <Content>
                <div data-testid="child-content">Desktop Content</div>
            </Content>
        )

        expect(screen.getByTestId('sidebar')).toBeInTheDocument()
        expect(screen.queryByTestId('header')).not.toBeInTheDocument()
    })
})
