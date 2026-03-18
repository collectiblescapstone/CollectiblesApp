import { screen, waitFor, fireEvent, act } from '@testing-library/react'
import { renderWithTheme } from '../../../utils/testing-utils'
import TradeCardPopup from '../PopupTrade'
import * as ProfileSelectionProvider from '../../../context/ProfileSelectionProvider'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush
    })
}))

// Mock ProfileSelectionProvider
const mockSetProfileSelected = jest.fn()
jest.mock('../../../context/ProfileSelectionProvider', () => ({
    useProfileSelected: jest.fn(() => ({
        profileSelected: '',
        setProfileSelected: mockSetProfileSelected
    }))
}))

const mockUseProfileSelected =
    ProfileSelectionProvider.useProfileSelected as jest.MockedFunction<
        typeof ProfileSelectionProvider.useProfileSelected
    >

// Mock Clipboard from Capacitor
const mockClipboardWrite = jest.fn()
jest.mock('@capacitor/clipboard', () => ({
    Clipboard: {
        write: (data: { string: string }) => mockClipboardWrite(data)
    }
}))

// Mock TradingCards component
jest.mock('../TradingCards', () => {
    return function MockTradingCards({
        cards
    }: {
        cards?: { name: string; image: string }[]
    }) {
        return (
            <div data-testid="trading-cards">
                {cards?.map((card, index) => (
                    <div key={index} data-testid={`card-${index}`}>
                        {card.name}
                    </div>
                ))}
            </div>
        )
    }
})

// Mock react-icons
jest.mock('react-icons/lu', () => ({
    LuArrowUpDown: () => <span data-testid="arrow-icon">ArrowUpDown</span>
}))

jest.mock('react-icons/fa', () => ({
    FaInstagram: () => <span data-testid="instagram-icon">Instagram</span>,
    FaFacebook: () => <span data-testid="facebook-icon">Facebook</span>,
    FaDiscord: () => <span data-testid="discord-icon">Discord</span>,
    FaWhatsapp: () => <span data-testid="whatsapp-icon">WhatsApp</span>
}))

jest.mock('react-icons/ri', () => ({
    RiTwitterXLine: () => <span data-testid="twitter-icon">Twitter</span>
}))

describe('TradeCardPopup', () => {
    const defaultProps = {
        username: 'testuser',
        onNavigateToProfile: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        mockClipboardWrite.mockResolvedValue(undefined)
        mockUseProfileSelected.mockReturnValue({
            profileSelected: '',
            setProfileSelected: mockSetProfileSelected
        })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('Basic Rendering', () => {
        it('renders username correctly', () => {
            renderWithTheme(<TradeCardPopup {...defaultProps} />)

            expect(screen.getByText('testuser')).toBeInTheDocument()
        })

        it('renders "Your hand" text', () => {
            renderWithTheme(<TradeCardPopup {...defaultProps} />)

            expect(screen.getByText('Your hand')).toBeInTheDocument()
        })

        it('renders the arrow icon', () => {
            renderWithTheme(<TradeCardPopup {...defaultProps} />)

            expect(screen.getByTestId('arrow-icon')).toBeInTheDocument()
        })

        it('renders avatar with provided URL', () => {
            renderWithTheme(
                <TradeCardPopup
                    {...defaultProps}
                    avatarUrl="https://example.com/avatar.png"
                />
            )

            const avatar = document.querySelector('img')
            expect(avatar).toHaveAttribute(
                'src',
                'https://example.com/avatar.png'
            )
        })

        it('renders TradingCards components for both wishlists', () => {
            const user1Wishlist = [
                { name: 'Pikachu', image_url: 'pikachu.png' }
            ]
            const user2Wishlist = [
                { name: 'Charizard', image_url: 'charizard.png' }
            ]

            renderWithTheme(
                <TradeCardPopup
                    {...defaultProps}
                    user1Wishlist={user1Wishlist}
                    user2Wishlist={user2Wishlist}
                />
            )

            const tradingCards = screen.getAllByTestId('trading-cards')
            expect(tradingCards).toHaveLength(2)
        })
    })

    describe('Profile Navigation', () => {
        it('navigates to user profile when button is clicked', async () => {
            const onNavigateToProfile = jest.fn()
            renderWithTheme(
                <TradeCardPopup
                    {...defaultProps}
                    onNavigateToProfile={onNavigateToProfile}
                />
            )

            const profileButton = screen.getByRole('button', {
                name: /testuser/i
            })
            fireEvent.click(profileButton)

            expect(onNavigateToProfile).toHaveBeenCalled()
            expect(mockSetProfileSelected).toHaveBeenCalledWith('testuser')
            expect(mockPush).toHaveBeenCalledWith('/user-profile')
        })
    })

    describe('Contact Icons Rendering', () => {
        it('renders Instagram icon when contact is provided', () => {
            const contacts = [{ method: 'instagram', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            expect(screen.getByLabelText('instagram')).toBeInTheDocument()
            expect(screen.getByTestId('instagram-icon')).toBeInTheDocument()
        })

        it('renders Twitter/X icon when contact is provided', () => {
            const contacts = [{ method: 'x', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            expect(screen.getByLabelText('x')).toBeInTheDocument()
            expect(screen.getByTestId('twitter-icon')).toBeInTheDocument()
        })

        it('renders Twitter icon when twitter method is used', () => {
            const contacts = [{ method: 'twitter', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            expect(screen.getByLabelText('x')).toBeInTheDocument()
        })

        it('renders Facebook icon when contact is provided', () => {
            const contacts = [{ method: 'facebook', value: 'testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            expect(screen.getByLabelText('facebook')).toBeInTheDocument()
            expect(screen.getByTestId('facebook-icon')).toBeInTheDocument()
        })

        it('renders WhatsApp icon when contact is provided', () => {
            const contacts = [{ method: 'whatsapp', value: '+1234567890' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            expect(screen.getByLabelText('whatsapp')).toBeInTheDocument()
            expect(screen.getByTestId('whatsapp-icon')).toBeInTheDocument()
        })

        it('renders Discord icon when contact is provided', () => {
            const contacts = [{ method: 'discord', value: 'testuser#1234' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            expect(screen.getByLabelText('discord')).toBeInTheDocument()
            expect(screen.getByTestId('discord-icon')).toBeInTheDocument()
        })

        it('renders multiple contact icons', () => {
            const contacts = [
                { method: 'instagram', value: '@insta' },
                { method: 'x', value: '@twitter' },
                { method: 'discord', value: 'user#1234' }
            ]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            expect(screen.getByLabelText('instagram')).toBeInTheDocument()
            expect(screen.getByLabelText('x')).toBeInTheDocument()
            expect(screen.getByLabelText('discord')).toBeInTheDocument()
        })

        it('does not render contact icons when no contacts provided', () => {
            renderWithTheme(<TradeCardPopup {...defaultProps} />)

            expect(screen.queryByLabelText('instagram')).not.toBeInTheDocument()
            expect(screen.queryByLabelText('x')).not.toBeInTheDocument()
            expect(screen.queryByLabelText('facebook')).not.toBeInTheDocument()
            expect(screen.queryByLabelText('whatsapp')).not.toBeInTheDocument()
            expect(screen.queryByLabelText('discord')).not.toBeInTheDocument()
        })

        it('handles contact method with spaces', () => {
            const contacts = [{ method: 'Insta gram', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            expect(screen.getByLabelText('instagram')).toBeInTheDocument()
        })

        it('handles contact method with different casing', () => {
            const contacts = [{ method: 'INSTAGRAM', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            expect(screen.getByLabelText('instagram')).toBeInTheDocument()
        })
    })

    describe('Clipboard Copy - Instagram', () => {
        it('copies Instagram URL when handle is provided without @', async () => {
            const contacts = [{ method: 'instagram', value: 'testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const instagramButton = screen.getByLabelText('instagram')
            await act(async () => {
                fireEvent.click(instagramButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://instagram.com/testuser'
            })
        })

        it('copies Instagram URL when handle has @ prefix', async () => {
            const contacts = [{ method: 'instagram', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const instagramButton = screen.getByLabelText('instagram')
            await act(async () => {
                fireEvent.click(instagramButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://instagram.com/testuser'
            })
        })

        it('copies Instagram URL as-is when full URL is provided', async () => {
            const contacts = [
                {
                    method: 'instagram',
                    value: 'https://instagram.com/custompath'
                }
            ]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const instagramButton = screen.getByLabelText('instagram')
            await act(async () => {
                fireEvent.click(instagramButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://instagram.com/custompath'
            })
        })

        it('shows "Copied!" text after copying Instagram', async () => {
            const contacts = [{ method: 'instagram', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const instagramButton = screen.getByLabelText('instagram')
            await act(async () => {
                fireEvent.click(instagramButton)
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()
        })

        it('hides "Copied!" text after timeout', async () => {
            const contacts = [{ method: 'instagram', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const instagramButton = screen.getByLabelText('instagram')
            await act(async () => {
                fireEvent.click(instagramButton)
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()

            act(() => {
                jest.advanceTimersByTime(1500)
            })

            await waitFor(() => {
                expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
            })
        })
    })

    describe('Clipboard Copy - Twitter/X', () => {
        it('copies Twitter URL when handle is provided', async () => {
            const contacts = [{ method: 'x', value: 'testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const twitterButton = screen.getByLabelText('x')
            await act(async () => {
                fireEvent.click(twitterButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://x.com/testuser'
            })
        })

        it('copies Twitter URL when handle has @ prefix', async () => {
            const contacts = [{ method: 'twitter', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const twitterButton = screen.getByLabelText('x')
            await act(async () => {
                fireEvent.click(twitterButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://x.com/testuser'
            })
        })

        it('copies Twitter URL as-is when full URL is provided', async () => {
            const contacts = [{ method: 'x', value: 'https://x.com/custom' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const twitterButton = screen.getByLabelText('x')
            await act(async () => {
                fireEvent.click(twitterButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://x.com/custom'
            })
        })

        it('shows "Copied!" text after copying Twitter', async () => {
            const contacts = [{ method: 'x', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const twitterButton = screen.getByLabelText('x')
            await act(async () => {
                fireEvent.click(twitterButton)
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()
        })
    })

    describe('Clipboard Copy - Facebook', () => {
        it('copies Facebook URL when handle is provided', async () => {
            const contacts = [{ method: 'facebook', value: 'testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const facebookButton = screen.getByLabelText('facebook')
            await act(async () => {
                fireEvent.click(facebookButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://facebook.com/testuser'
            })
        })

        it('copies Facebook URL when handle has @ prefix', async () => {
            const contacts = [{ method: 'facebook', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const facebookButton = screen.getByLabelText('facebook')
            await act(async () => {
                fireEvent.click(facebookButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://facebook.com/testuser'
            })
        })

        it('copies Facebook URL as-is when full URL is provided', async () => {
            const contacts = [
                { method: 'facebook', value: 'https://facebook.com/page' }
            ]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const facebookButton = screen.getByLabelText('facebook')
            await act(async () => {
                fireEvent.click(facebookButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://facebook.com/page'
            })
        })

        it('shows "Copied!" text after copying Facebook', async () => {
            const contacts = [{ method: 'facebook', value: 'testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const facebookButton = screen.getByLabelText('facebook')
            await act(async () => {
                fireEvent.click(facebookButton)
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()
        })
    })

    describe('Clipboard Copy - WhatsApp', () => {
        it('copies WhatsApp URL with phone number', async () => {
            const contacts = [{ method: 'whatsapp', value: '+1234567890' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const whatsappButton = screen.getByLabelText('whatsapp')
            await act(async () => {
                fireEvent.click(whatsappButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://wa.me/1234567890'
            })
        })

        it('copies WhatsApp URL stripping non-digits', async () => {
            const contacts = [{ method: 'whatsapp', value: '+1 (234) 567-890' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const whatsappButton = screen.getByLabelText('whatsapp')
            await act(async () => {
                fireEvent.click(whatsappButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://wa.me/1234567890'
            })
        })

        it('copies raw value when no digits found', async () => {
            const contacts = [{ method: 'whatsapp', value: 'nodigits' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const whatsappButton = screen.getByLabelText('whatsapp')
            await act(async () => {
                fireEvent.click(whatsappButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'nodigits'
            })
        })

        it('shows "Copied!" text after copying WhatsApp', async () => {
            const contacts = [{ method: 'whatsapp', value: '+1234567890' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const whatsappButton = screen.getByLabelText('whatsapp')
            await act(async () => {
                fireEvent.click(whatsappButton)
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()
        })
    })

    describe('Clipboard Copy - Discord', () => {
        it('copies Discord handle as-is', async () => {
            const contacts = [{ method: 'discord', value: 'testuser#1234' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const discordButton = screen.getByLabelText('discord')
            await act(async () => {
                fireEvent.click(discordButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'testuser#1234'
            })
        })

        it('shows "Copied!" text after copying Discord', async () => {
            const contacts = [{ method: 'discord', value: 'testuser#1234' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const discordButton = screen.getByLabelText('discord')
            await act(async () => {
                fireEvent.click(discordButton)
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()
        })
    })

    describe('Clipboard Error Handling', () => {
        it('handles clipboard write failure gracefully', async () => {
            const consoleError = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})
            mockClipboardWrite.mockRejectedValueOnce(new Error('Copy failed'))

            const contacts = [{ method: 'instagram', value: '@testuser' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const instagramButton = screen.getByLabelText('instagram')
            await act(async () => {
                fireEvent.click(instagramButton)
            })

            expect(consoleError).toHaveBeenCalledWith(
                'Copy to clipboard failed',
                expect.any(Error)
            )
            consoleError.mockRestore()
        })

        it('does not copy when contact value is empty', async () => {
            const contacts = [{ method: 'instagram', value: '' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            // Instagram button should still render
            const instagramButton = screen.getByLabelText('instagram')
            await act(async () => {
                fireEvent.click(instagramButton)
            })

            // copyToClipboard should return early because value is empty after trim
            expect(mockClipboardWrite).not.toHaveBeenCalled()
        })
    })

    describe('Timeout Handling', () => {
        it('clears previous timeout when copying again quickly', async () => {
            const contacts = [
                { method: 'instagram', value: '@insta' },
                { method: 'discord', value: 'discord#123' }
            ]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            // Click Instagram
            const instagramButton = screen.getByLabelText('instagram')
            await act(async () => {
                fireEvent.click(instagramButton)
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()

            // Advance time partially
            act(() => {
                jest.advanceTimersByTime(500)
            })

            // Click Discord before Instagram timeout expires
            const discordButton = screen.getByLabelText('discord')
            await act(async () => {
                fireEvent.click(discordButton)
            })

            // Should still show "Copied!" for Discord
            expect(screen.getByText('Copied!')).toBeInTheDocument()

            // Advance past original timeout - should still show because Discord reset it
            act(() => {
                jest.advanceTimersByTime(1000)
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()

            // Advance to after Discord timeout
            act(() => {
                jest.advanceTimersByTime(500)
            })

            await waitFor(() => {
                expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
            })
        })

        it('cleans up timeout on unmount', async () => {
            const contacts = [{ method: 'instagram', value: '@testuser' }]
            const { unmount } = renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const instagramButton = screen.getByLabelText('instagram')
            await act(async () => {
                fireEvent.click(instagramButton)
            })

            // Unmount before timeout completes
            unmount()

            // Advance timers - should not cause any errors
            act(() => {
                jest.advanceTimersByTime(2000)
            })

            // No assertions needed - just verifying no errors occur
        })
    })

    describe('Edge Cases', () => {
        it('handles undefined contacts array', () => {
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={undefined} />
            )

            expect(screen.queryByLabelText('instagram')).not.toBeInTheDocument()
        })

        it('handles empty contacts array', () => {
            renderWithTheme(<TradeCardPopup {...defaultProps} contacts={[]} />)

            expect(screen.queryByLabelText('instagram')).not.toBeInTheDocument()
        })

        it('handles contact value with leading/trailing whitespace', async () => {
            const contacts = [{ method: 'instagram', value: '  @testuser  ' }]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            const instagramButton = screen.getByLabelText('instagram')
            await act(async () => {
                fireEvent.click(instagramButton)
            })

            expect(mockClipboardWrite).toHaveBeenCalledWith({
                string: 'https://instagram.com/testuser'
            })
        })

        it('handles undefined wishlists', () => {
            renderWithTheme(
                <TradeCardPopup
                    {...defaultProps}
                    user1Wishlist={undefined}
                    user2Wishlist={undefined}
                />
            )

            const tradingCards = screen.getAllByTestId('trading-cards')
            expect(tradingCards).toHaveLength(2)
        })

        it('handles empty wishlists', () => {
            renderWithTheme(
                <TradeCardPopup
                    {...defaultProps}
                    user1Wishlist={[]}
                    user2Wishlist={[]}
                />
            )

            const tradingCards = screen.getAllByTestId('trading-cards')
            expect(tradingCards).toHaveLength(2)
        })

        it('handles contact with undefined method', () => {
            // This tests the normalize function with undefined input
            const contacts = [
                { method: undefined as unknown as string, value: '@testuser' }
            ]
            renderWithTheme(
                <TradeCardPopup {...defaultProps} contacts={contacts} />
            )

            // No icons should render for undefined method
            expect(screen.queryByLabelText('instagram')).not.toBeInTheDocument()
        })
    })
})
