import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import AccountOptions from '../AccountOptions'
import { renderWithTheme } from '../../../utils/testing-utils'
import { UserProfile, VisibilityValues } from '../../../types/personal-profile'
import PopupUI from '../../ui/PopupUI'

// Mock PopupUI
jest.mock('../../ui/PopupUI', () => {
    const MockViewport = () => <div data-testid="popup-viewport" />
    return {
        __esModule: true,
        default: {
            open: jest.fn(),
            close: jest.fn(),
            Viewport: MockViewport
        }
    }
})

// Mock child components
jest.mock('../BlockForm', () => {
    return function MockBlockForm({
        onCancel,
        userId
    }: {
        onCancel: () => void
        userId: string
    }) {
        return (
            <div data-testid="block-form">
                <span data-testid="block-form-user-id">{userId}</span>
                <button data-testid="block-form-cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        )
    }
})

jest.mock('../RatingForm', () => {
    return function MockRatingForm({
        closeOnSubmit,
        user
    }: {
        closeOnSubmit: (id: string, value?: number) => Promise<void>
        user: UserProfile
    }) {
        return (
            <div data-testid="rating-form">
                <span data-testid="rating-form-username">{user.username}</span>
                <button
                    data-testid="rating-form-close"
                    onClick={() => closeOnSubmit('rate-user')}
                >
                    Close
                </button>
            </div>
        )
    }
})

jest.mock('../ReportForm', () => {
    return function MockReportForm({
        closeOnSubmit,
        userId
    }: {
        closeOnSubmit: () => void
        userId: string
    }) {
        return (
            <div data-testid="report-form">
                <span data-testid="report-form-user-id">{userId}</span>
                <button data-testid="report-form-close" onClick={closeOnSubmit}>
                    Close
                </button>
            </div>
        )
    }
})

// Create mock user factory
const createMockUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    id: 'user-123',
    username: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    bio: 'Test bio',
    location: 'Test City',
    longitude: -73.935242,
    latitude: 40.73061,
    instagram: 'testinsta',
    x: 'testx',
    facebook: 'testfb',
    discord: 'testdiscord',
    whatsapp: '1234567890',
    profile_pic: 1,
    visibility: VisibilityValues.Public,
    rating: 4.5,
    rating_count: 10,
    wishlist: [],
    tradeList: [],
    showcaseList: [],
    ...overrides
})

const mockPopupUIOpen = PopupUI.open as jest.MockedFunction<typeof PopupUI.open>
const mockPopupUIClose = PopupUI.close as jest.MockedFunction<
    typeof PopupUI.close
>

describe('AccountOptions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Initial Render', () => {
        it('renders menu trigger button', () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')
            expect(menuButton).toBeInTheDocument()
        })

        it('renders PopupUI.Viewport component', () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            expect(screen.getByTestId('popup-viewport')).toBeInTheDocument()
        })

        it('renders menu button with vertical dots icon', () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')
            // The button should contain the FiMoreVertical icon (SVG)
            const svg = menuButton.querySelector('svg')
            expect(svg).toBeInTheDocument()
        })
    })

    describe('Menu Interaction', () => {
        it('opens menu when trigger button is clicked', async () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            // Menu items should be visible
            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
                expect(screen.getByText('Rate')).toBeInTheDocument()
                expect(screen.getByText('Report')).toBeInTheDocument()
            })
        })

        it('displays all three menu items with icons', async () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                // Check for menu items
                const blockItem = screen.getByText('Block')
                const rateItem = screen.getByText('Rate')
                const reportItem = screen.getByText('Report')

                expect(blockItem).toBeInTheDocument()
                expect(rateItem).toBeInTheDocument()
                expect(reportItem).toBeInTheDocument()
            })
        })
    })

    describe('Block User Action', () => {
        it('opens block popup when Block menu item is clicked', async () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
            })

            const blockMenuItem = screen
                .getByText('Block')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(blockMenuItem!)
            })

            await waitFor(() => {
                expect(mockPopupUIOpen).toHaveBeenCalledWith(
                    'block-user',
                    expect.objectContaining({
                        title: 'Block John Doe?',
                        onClickClose: expect.any(Function)
                    })
                )
            })
        })

        it('passes correct userId to BlockForm', async () => {
            const mockUser = createMockUser({ id: 'custom-user-id' })
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
            })

            const blockMenuItem = screen
                .getByText('Block')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(blockMenuItem!)
            })

            // Verify the content prop contains BlockForm with correct userId
            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'block-user',
                expect.objectContaining({
                    content: expect.anything()
                })
            )

            // Get the content from the call and verify BlockForm props
            const callArgs = mockPopupUIOpen.mock.calls[0]
            const contentProp = callArgs[1].content
            expect(contentProp).toBeTruthy()
        })

        it('closes block popup when onCancel is called in BlockForm', async () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
            })

            const blockMenuItem = screen
                .getByText('Block')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(blockMenuItem!)
            })

            // Get the onCancel callback from the BlockForm content
            const callArgs = mockPopupUIOpen.mock.calls[0]
            const contentElement = callArgs[1].content as React.ReactElement<{
                onCancel?: () => void
            }>

            // Simulate calling onCancel
            if (contentElement?.props?.onCancel) {
                contentElement.props.onCancel()
            }

            expect(mockPopupUIClose).toHaveBeenCalledWith('block-user')
        })

        it('closes block popup when onClickClose is called', async () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
            })

            const blockMenuItem = screen
                .getByText('Block')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(blockMenuItem!)
            })

            // Get the onClickClose callback
            const callArgs = mockPopupUIOpen.mock.calls[0]
            const onClickClose = callArgs[1].onClickClose

            // Call the onClickClose
            onClickClose()

            expect(mockPopupUIClose).toHaveBeenCalledWith('block-user')
        })
    })

    describe('Rate User Action', () => {
        it('opens rate popup when Rate menu item is clicked', async () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Rate')).toBeInTheDocument()
            })

            const rateMenuItem = screen
                .getByText('Rate')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(rateMenuItem!)
            })

            await waitFor(() => {
                expect(mockPopupUIOpen).toHaveBeenCalledWith(
                    'rate-user',
                    expect.objectContaining({
                        title: 'Rate John Doe?',
                        onClickClose: expect.any(Function)
                    })
                )
            })
        })

        it('passes user object to RatingForm', async () => {
            const mockUser = createMockUser({ username: 'specialuser' })
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Rate')).toBeInTheDocument()
            })

            const rateMenuItem = screen
                .getByText('Rate')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(rateMenuItem!)
            })

            // Verify RatingForm receives the user prop
            const callArgs = mockPopupUIOpen.mock.calls[0]
            const contentElement = callArgs[1].content as React.ReactElement<{
                user?: UserProfile
            }>
            expect(contentElement?.props?.user).toEqual(mockUser)
        })

        it('passes closeOnSubmit callback to RatingForm', async () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Rate')).toBeInTheDocument()
            })

            const rateMenuItem = screen
                .getByText('Rate')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(rateMenuItem!)
            })

            // Get the closeOnSubmit callback
            const callArgs = mockPopupUIOpen.mock.calls[0]
            const contentElement = callArgs[1].content as React.ReactElement<{
                closeOnSubmit?: (id: string, value?: number) => Promise<void>
            }>

            // closeOnSubmit is PopupUI.close
            expect(contentElement?.props?.closeOnSubmit).toBe(PopupUI.close)
        })

        it('closes rate popup when onClickClose is called', async () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Rate')).toBeInTheDocument()
            })

            const rateMenuItem = screen
                .getByText('Rate')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(rateMenuItem!)
            })

            // Get the onClickClose callback
            const callArgs = mockPopupUIOpen.mock.calls[0]
            const onClickClose = callArgs[1].onClickClose

            // Call the onClickClose
            onClickClose()

            expect(mockPopupUIClose).toHaveBeenCalledWith('rate-user')
        })
    })

    describe('Report User Action', () => {
        it('opens report popup when Report menu item is clicked', async () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Report')).toBeInTheDocument()
            })

            const reportMenuItem = screen
                .getByText('Report')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(reportMenuItem!)
            })

            await waitFor(() => {
                expect(mockPopupUIOpen).toHaveBeenCalledWith(
                    'report-user',
                    expect.objectContaining({
                        title: 'Report John Doe?',
                        onClickClose: expect.any(Function)
                    })
                )
            })
        })

        it('passes correct userId to ReportForm', async () => {
            const mockUser = createMockUser({ id: 'report-user-id' })
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Report')).toBeInTheDocument()
            })

            const reportMenuItem = screen
                .getByText('Report')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(reportMenuItem!)
            })

            const callArgs = mockPopupUIOpen.mock.calls[0]
            const contentElement = callArgs[1].content as React.ReactElement<{
                userId?: string
            }>
            expect(contentElement?.props?.userId).toBe('report-user-id')
        })

        it('closes report popup when closeOnSubmit is called in ReportForm', async () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Report')).toBeInTheDocument()
            })

            const reportMenuItem = screen
                .getByText('Report')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(reportMenuItem!)
            })

            // Get the closeOnSubmit callback
            const callArgs = mockPopupUIOpen.mock.calls[0]
            const contentElement = callArgs[1].content as React.ReactElement<{
                closeOnSubmit?: () => void
            }>

            // Simulate calling closeOnSubmit
            if (contentElement?.props?.closeOnSubmit) {
                contentElement.props.closeOnSubmit()
            }

            expect(mockPopupUIClose).toHaveBeenCalledWith('report-user')
        })

        it('closes report popup when onClickClose is called', async () => {
            const mockUser = createMockUser()
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Report')).toBeInTheDocument()
            })

            const reportMenuItem = screen
                .getByText('Report')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(reportMenuItem!)
            })

            // Get the onClickClose callback
            const callArgs = mockPopupUIOpen.mock.calls[0]
            const onClickClose = callArgs[1].onClickClose

            // Call the onClickClose
            onClickClose()

            expect(mockPopupUIClose).toHaveBeenCalledWith('report-user')
        })
    })

    describe('User Full Name Formatting', () => {
        it('uses full name when both firstName and lastName are provided', async () => {
            const mockUser = createMockUser({
                firstName: 'Jane',
                lastName: 'Smith'
            })
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
            })

            const blockMenuItem = screen
                .getByText('Block')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(blockMenuItem!)
            })

            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'block-user',
                expect.objectContaining({
                    title: 'Block Jane Smith?'
                })
            )
        })

        it('uses only firstName when lastName is null', async () => {
            const mockUser = createMockUser({
                firstName: 'Jane',
                lastName: null
            })
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
            })

            const blockMenuItem = screen
                .getByText('Block')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(blockMenuItem!)
            })

            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'block-user',
                expect.objectContaining({
                    title: 'Block Jane?'
                })
            )
        })

        it('uses only lastName when firstName is null', async () => {
            const mockUser = createMockUser({
                firstName: null,
                lastName: 'Smith'
            })
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
            })

            const blockMenuItem = screen
                .getByText('Block')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(blockMenuItem!)
            })

            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'block-user',
                expect.objectContaining({
                    title: 'Block Smith?'
                })
            )
        })

        it('uses only firstName when lastName is undefined', async () => {
            const mockUser = createMockUser({
                firstName: 'Jane',
                lastName: undefined
            })
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
            })

            const blockMenuItem = screen
                .getByText('Block')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(blockMenuItem!)
            })

            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'block-user',
                expect.objectContaining({
                    title: 'Block Jane?'
                })
            )
        })

        it('uses username when both firstName and lastName are null', async () => {
            const mockUser = createMockUser({
                username: 'cooluser123',
                firstName: null,
                lastName: null
            })
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
            })

            const blockMenuItem = screen
                .getByText('Block')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(blockMenuItem!)
            })

            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'block-user',
                expect.objectContaining({
                    title: 'Block cooluser123?'
                })
            )
        })

        it('uses username when both firstName and lastName are undefined', async () => {
            const mockUser = createMockUser({
                username: 'myusername',
                firstName: undefined,
                lastName: undefined
            })
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Rate')).toBeInTheDocument()
            })

            const rateMenuItem = screen
                .getByText('Rate')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(rateMenuItem!)
            })

            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'rate-user',
                expect.objectContaining({
                    title: 'Rate myusername?'
                })
            )
        })

        it('uses username when firstName is empty string and lastName is null', async () => {
            const mockUser = createMockUser({
                username: 'fallbackuser',
                firstName: '',
                lastName: null
            })
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Report')).toBeInTheDocument()
            })

            const reportMenuItem = screen
                .getByText('Report')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(reportMenuItem!)
            })

            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'report-user',
                expect.objectContaining({
                    title: 'Report fallbackuser?'
                })
            )
        })

        it('trims leading and trailing whitespace from combined full name', async () => {
            const mockUser = createMockUser({
                firstName: '  Alice  ',
                lastName: '  Wonder  '
            })
            renderWithTheme(<AccountOptions user={mockUser} />)

            const menuButton = screen.getByRole('button')

            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
            })

            const blockMenuItem = screen
                .getByText('Block')
                .closest('[data-part="item"]')

            await act(async () => {
                fireEvent.click(blockMenuItem!)
            })

            // The component uses .trim() on the combined name which removes leading/trailing whitespace
            // '  Alice  ' + ' ' + '  Wonder  ' = '  Alice     Wonder  ' -> trim -> 'Alice     Wonder'
            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'block-user',
                expect.objectContaining({
                    title: 'Block Alice     Wonder?'
                })
            )
        })
    })

    describe('Multiple Actions', () => {
        it('can open different popups in sequence', async () => {
            const mockUser = createMockUser()
            const { unmount } = renderWithTheme(
                <AccountOptions user={mockUser} />
            )

            const menuButton = screen.getByRole('button')

            // Open Block popup
            await act(async () => {
                fireEvent.click(menuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Block')).toBeInTheDocument()
            })

            const blockMenuItem = screen
                .getByText('Block')
                .closest('[data-part="item"]')
            await act(async () => {
                fireEvent.click(blockMenuItem!)
            })

            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'block-user',
                expect.anything()
            )

            // Unmount and remount to test fresh interaction
            unmount()
            jest.clearAllMocks()

            renderWithTheme(<AccountOptions user={mockUser} />)

            const newMenuButton = screen.getByRole('button')

            // Open Rate popup
            await act(async () => {
                fireEvent.click(newMenuButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Rate')).toBeInTheDocument()
            })

            const rateMenuItem = screen
                .getByText('Rate')
                .closest('[data-part="item"]')
            await act(async () => {
                fireEvent.click(rateMenuItem!)
            })

            expect(mockPopupUIOpen).toHaveBeenCalledWith(
                'rate-user',
                expect.anything()
            )
        })
    })
})
