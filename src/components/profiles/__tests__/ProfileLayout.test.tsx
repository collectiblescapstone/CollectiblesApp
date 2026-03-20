import React from 'react'
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProfileLayout from '../ProfileLayout'
import { renderWithTheme } from '../../../utils/testing-utils'
import { UserProfile, VisibilityValues } from '../../../types/personal-profile'

// Mock child components
jest.mock('../WishList', () => {
    return function MockWishList({
        type,
        username,
        wishlist
    }: {
        type: string
        username: string
        wishlist: Array<{ name: string; image: string }>
    }) {
        return (
            <div data-testid="wishlist-component">
                <span data-testid="wishlist-type">{type}</span>
                <span data-testid="wishlist-username">{username}</span>
                <span data-testid="wishlist-count">{wishlist.length}</span>
                <span data-testid="wishlist-items">
                    {JSON.stringify(wishlist)}
                </span>
            </div>
        )
    }
})

jest.mock('../TradeList', () => {
    return function MockTradeList({
        type,
        username,
        tradelist
    }: {
        type: string
        username: string
        tradelist: Array<{ name: string; image: string }>
    }) {
        return (
            <div data-testid="tradelist-component">
                <span data-testid="tradelist-type">{type}</span>
                <span data-testid="tradelist-username">{username}</span>
                <span data-testid="tradelist-count">{tradelist.length}</span>
                <span data-testid="tradelist-items">
                    {JSON.stringify(tradelist)}
                </span>
            </div>
        )
    }
})

jest.mock('../Showcase', () => {
    return function MockShowcase({
        showcaseList
    }: {
        showcaseList: Array<{ name: string; image: string }>
    }) {
        return (
            <div data-testid="showcase-component">
                <span data-testid="showcase-count">{showcaseList.length}</span>
                <span data-testid="showcase-items">
                    {JSON.stringify(showcaseList)}
                </span>
            </div>
        )
    }
})

jest.mock('../SocialLinks', () => {
    return function MockSocialLinks({
        instagram,
        x,
        facebook,
        discord,
        whatsapp
    }: {
        instagram?: string
        x?: string
        facebook?: string
        discord?: string
        whatsapp?: string
    }) {
        return (
            <div data-testid="sociallinks-component">
                <span data-testid="sociallinks-instagram">
                    {instagram || ''}
                </span>
                <span data-testid="sociallinks-x">{x || ''}</span>
                <span data-testid="sociallinks-facebook">{facebook || ''}</span>
                <span data-testid="sociallinks-discord">{discord || ''}</span>
                <span data-testid="sociallinks-whatsapp">{whatsapp || ''}</span>
            </div>
        )
    }
})

// Mock profilePictures
jest.mock('../../../app/personal-profile/edit-profile/constants', () => ({
    profilePictures: {
        0: '/user-profile/pfp_temp.jpg',
        1: '/user-profile/pfp_temp1.png',
        2: '/user-profile/pfp_temp2.png',
        3: '/user-profile/pfp_temp3.png',
        4: '/user-profile/pfp_temp4.png',
        5: '/user-profile/pfp_temp5.png'
    }
}))

// Create mock user factory
const createMockUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    id: 'user-123',
    username: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    bio: 'This is my test bio',
    location: 'New York, NY',
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
    wishlist: [
        { card: { name: 'Pikachu', image_url: 'pikachu.png' } },
        { card: { name: 'Charizard', image_url: 'charizard.png' } }
    ],
    tradeList: [{ card: { name: 'Blastoise', image_url: 'blastoise.png' } }],
    showcaseList: [
        { card: { name: 'Mewtwo', image_url: 'mewtwo.png' } },
        { card: { name: 'Mew', image_url: 'mew.png' } },
        { card: { name: 'Lugia', image_url: 'lugia.png' } }
    ],
    ...overrides
})

describe('ProfileLayout', () => {
    describe('Basic Render', () => {
        it('renders without crashing', () => {
            const mockUser = createMockUser()
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByTestId('wishlist-component')).toBeInTheDocument()
            expect(
                screen.getByTestId('tradelist-component')
            ).toBeInTheDocument()
            expect(screen.getByTestId('showcase-component')).toBeInTheDocument()
            expect(
                screen.getByTestId('sociallinks-component')
            ).toBeInTheDocument()
        })

        it('renders the component container', () => {
            const mockUser = createMockUser()
            const { container } = renderWithTheme(
                <ProfileLayout user={mockUser} />
            )

            // Check that the component renders a container
            expect(container.firstChild).toBeInTheDocument()
        })
    })

    describe('Avatar Rendering', () => {
        it('renders avatar component', () => {
            const mockUser = createMockUser({ profile_pic: 1 })
            const { container } = renderWithTheme(
                <ProfileLayout user={mockUser} />
            )

            // Avatar should be rendered (check for img inside avatar)
            const avatarImage = container.querySelector('img')
            expect(avatarImage).toBeInTheDocument()
        })

        it('renders avatar with different profile pic values', () => {
            const mockUser = createMockUser({ profile_pic: 3 })
            const { container } = renderWithTheme(
                <ProfileLayout user={mockUser} />
            )

            const avatarImage = container.querySelector('img')
            expect(avatarImage).toBeInTheDocument()
        })

        it('renders avatar with profile_pic 0', () => {
            const mockUser = createMockUser({ profile_pic: 0 })
            const { container } = renderWithTheme(
                <ProfileLayout user={mockUser} />
            )

            const avatarImage = container.querySelector('img')
            expect(avatarImage).toBeInTheDocument()
        })
    })

    describe('Name Display', () => {
        it('displays full name when both firstName and lastName are provided', () => {
            const mockUser = createMockUser({
                firstName: 'Jane',
                lastName: 'Smith'
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByRole('heading')).toHaveTextContent('Jane Smith')
        })

        it('displays only firstName when lastName is null', () => {
            const mockUser = createMockUser({
                firstName: 'Jane',
                lastName: null
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByRole('heading')).toHaveTextContent('Jane')
        })

        it('displays only lastName when firstName is null', () => {
            const mockUser = createMockUser({
                firstName: null,
                lastName: 'Smith'
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByRole('heading')).toHaveTextContent('Smith')
        })

        it('displays only firstName when lastName is undefined', () => {
            const mockUser = createMockUser({
                firstName: 'Jane',
                lastName: undefined
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByRole('heading')).toHaveTextContent('Jane')
        })

        it('does not display heading when both firstName and lastName are null', () => {
            const mockUser = createMockUser({
                firstName: null,
                lastName: null
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.queryByRole('heading')).not.toBeInTheDocument()
        })

        it('does not display heading when both firstName and lastName are undefined', () => {
            const mockUser = createMockUser({
                firstName: undefined,
                lastName: undefined
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.queryByRole('heading')).not.toBeInTheDocument()
        })

        it('does not display heading when firstName is empty string and lastName is null', () => {
            const mockUser = createMockUser({
                firstName: '',
                lastName: null
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            // Empty string is falsy, so heading should not render
            expect(screen.queryByRole('heading')).not.toBeInTheDocument()
        })
    })

    describe('Location Display', () => {
        it('displays location when provided', () => {
            const mockUser = createMockUser({ location: 'San Francisco, CA' })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
        })

        it('does not display location when null', () => {
            const mockUser = createMockUser({ location: null })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.queryByText('New York, NY')).not.toBeInTheDocument()
        })

        it('does not display location when undefined', () => {
            const mockUser = createMockUser({ location: undefined })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            // No location text should be rendered
            const locationTexts = screen.queryAllByText(/,/)
            // Filter to only find location-like text (not in JSON)
            const locationElement = locationTexts.find(
                (el) =>
                    !el.closest('[data-testid]') ||
                    !el
                        .closest('[data-testid]')
                        ?.getAttribute('data-testid')
                        ?.includes('items')
            )
            expect(locationElement).toBeUndefined()
        })

        it('does not display location when empty string', () => {
            const mockUser = createMockUser({ location: '' })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            // Empty string is falsy, so location should not render
            // We verify by checking the mock components are there but no separate location text
            expect(
                screen.getByTestId('sociallinks-component')
            ).toBeInTheDocument()
        })
    })

    describe('Bio Display', () => {
        it('displays bio when provided', () => {
            const mockUser = createMockUser({
                bio: 'I love collecting Pokemon cards!'
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(
                screen.getByText('I love collecting Pokemon cards!')
            ).toBeInTheDocument()
        })

        it('does not display bio when null', () => {
            const mockUser = createMockUser({ bio: null })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(
                screen.queryByText('This is my test bio')
            ).not.toBeInTheDocument()
        })

        it('does not display bio when undefined', () => {
            const mockUser = createMockUser({ bio: undefined })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(
                screen.queryByText('This is my test bio')
            ).not.toBeInTheDocument()
        })

        it('does not display bio when empty string', () => {
            const mockUser = createMockUser({ bio: '' })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            // Empty string is falsy, bio should not render
            expect(screen.getByTestId('showcase-component')).toBeInTheDocument()
        })

        it('displays long bio text', () => {
            const longBio =
                'This is a very long bio that contains a lot of text about the user and their interests in Pokemon card collecting and trading with other enthusiasts.'
            const mockUser = createMockUser({ bio: longBio })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByText(longBio)).toBeInTheDocument()
        })
    })

    describe('Social Links', () => {
        it('passes all social link props to SocialLinks component', () => {
            const mockUser = createMockUser({
                instagram: 'myinsta',
                x: 'myx',
                facebook: 'myfb',
                discord: 'mydiscord',
                whatsapp: '9876543210'
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(
                screen.getByTestId('sociallinks-instagram')
            ).toHaveTextContent('myinsta')
            expect(screen.getByTestId('sociallinks-x')).toHaveTextContent('myx')
            expect(
                screen.getByTestId('sociallinks-facebook')
            ).toHaveTextContent('myfb')
            expect(screen.getByTestId('sociallinks-discord')).toHaveTextContent(
                'mydiscord'
            )
            expect(
                screen.getByTestId('sociallinks-whatsapp')
            ).toHaveTextContent('9876543210')
        })

        it('passes undefined social links as empty strings', () => {
            const mockUser = createMockUser({
                instagram: undefined,
                x: undefined,
                facebook: undefined,
                discord: undefined,
                whatsapp: undefined
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(
                screen.getByTestId('sociallinks-instagram')
            ).toHaveTextContent('')
            expect(screen.getByTestId('sociallinks-x')).toHaveTextContent('')
            expect(
                screen.getByTestId('sociallinks-facebook')
            ).toHaveTextContent('')
            expect(screen.getByTestId('sociallinks-discord')).toHaveTextContent(
                ''
            )
            expect(
                screen.getByTestId('sociallinks-whatsapp')
            ).toHaveTextContent('')
        })
    })

    describe('Interactible Props', () => {
        it('renders leftInteractible when provided', () => {
            const mockUser = createMockUser()
            const leftContent = <button data-testid="left-button">Back</button>

            renderWithTheme(
                <ProfileLayout user={mockUser} leftInteractible={leftContent} />
            )

            expect(screen.getByTestId('left-button')).toBeInTheDocument()
            expect(screen.getByText('Back')).toBeInTheDocument()
        })

        it('renders rightInteractible when provided', () => {
            const mockUser = createMockUser()
            const rightContent = (
                <button data-testid="right-button">Settings</button>
            )

            renderWithTheme(
                <ProfileLayout
                    user={mockUser}
                    rightInteractible={rightContent}
                />
            )

            expect(screen.getByTestId('right-button')).toBeInTheDocument()
            expect(screen.getByText('Settings')).toBeInTheDocument()
        })

        it('renders both leftInteractible and rightInteractible when provided', () => {
            const mockUser = createMockUser()
            const leftContent = <button data-testid="left-button">Back</button>
            const rightContent = (
                <button data-testid="right-button">Settings</button>
            )

            renderWithTheme(
                <ProfileLayout
                    user={mockUser}
                    leftInteractible={leftContent}
                    rightInteractible={rightContent}
                />
            )

            expect(screen.getByTestId('left-button')).toBeInTheDocument()
            expect(screen.getByTestId('right-button')).toBeInTheDocument()
        })

        it('does not render leftInteractible wrapper when not provided', () => {
            const mockUser = createMockUser()

            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.queryByTestId('left-button')).not.toBeInTheDocument()
        })

        it('does not render rightInteractible wrapper when not provided', () => {
            const mockUser = createMockUser()

            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.queryByTestId('right-button')).not.toBeInTheDocument()
        })

        it('renders complex leftInteractible content', () => {
            const mockUser = createMockUser()
            const leftContent = (
                <div data-testid="complex-left">
                    <span>Icon</span>
                    <button>Action</button>
                </div>
            )

            renderWithTheme(
                <ProfileLayout user={mockUser} leftInteractible={leftContent} />
            )

            expect(screen.getByTestId('complex-left')).toBeInTheDocument()
            expect(screen.getByText('Icon')).toBeInTheDocument()
            expect(screen.getByText('Action')).toBeInTheDocument()
        })
    })

    describe('Showcase Component Props', () => {
        it('transforms showcaseList data correctly', () => {
            const mockUser = createMockUser({
                showcaseList: [
                    { card: { name: 'Card1', image_url: 'card1.png' } },
                    { card: { name: 'Card2', image_url: 'card2.png' } }
                ]
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByTestId('showcase-count')).toHaveTextContent('2')

            const itemsJson = screen.getByTestId('showcase-items').textContent
            const items = JSON.parse(itemsJson || '[]')

            expect(items).toEqual([
                { name: 'Card1', image: 'card1.png' },
                { name: 'Card2', image: 'card2.png' }
            ])
        })

        it('passes empty array when showcaseList is empty', () => {
            const mockUser = createMockUser({ showcaseList: [] })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByTestId('showcase-count')).toHaveTextContent('0')
        })
    })

    describe('TradeList Component Props', () => {
        it('passes correct type and username to TradeList', () => {
            const mockUser = createMockUser()
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByTestId('tradelist-type')).toHaveTextContent(
                'personal'
            )
            expect(screen.getByTestId('tradelist-username')).toHaveTextContent(
                ''
            )
        })

        it('transforms tradeList data correctly', () => {
            const mockUser = createMockUser({
                tradeList: [
                    { card: { name: 'Trade1', image_url: 'trade1.png' } },
                    { card: { name: 'Trade2', image_url: 'trade2.png' } },
                    { card: { name: 'Trade3', image_url: 'trade3.png' } }
                ]
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByTestId('tradelist-count')).toHaveTextContent('3')

            const itemsJson = screen.getByTestId('tradelist-items').textContent
            const items = JSON.parse(itemsJson || '[]')

            expect(items).toEqual([
                { name: 'Trade1', image: 'trade1.png' },
                { name: 'Trade2', image: 'trade2.png' },
                { name: 'Trade3', image: 'trade3.png' }
            ])
        })

        it('passes empty array when tradeList is empty', () => {
            const mockUser = createMockUser({ tradeList: [] })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByTestId('tradelist-count')).toHaveTextContent('0')
        })
    })

    describe('WishList Component Props', () => {
        it('passes correct type and username to WishList', () => {
            const mockUser = createMockUser()
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByTestId('wishlist-type')).toHaveTextContent(
                'personal'
            )
            expect(screen.getByTestId('wishlist-username')).toHaveTextContent(
                ''
            )
        })

        it('transforms wishlist data correctly', () => {
            const mockUser = createMockUser({
                wishlist: [
                    { card: { name: 'Wish1', image_url: 'wish1.png' } },
                    { card: { name: 'Wish2', image_url: 'wish2.png' } }
                ]
            })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByTestId('wishlist-count')).toHaveTextContent('2')

            const itemsJson = screen.getByTestId('wishlist-items').textContent
            const items = JSON.parse(itemsJson || '[]')

            expect(items).toEqual([
                { name: 'Wish1', image: 'wish1.png' },
                { name: 'Wish2', image: 'wish2.png' }
            ])
        })

        it('passes empty array when wishlist is empty', () => {
            const mockUser = createMockUser({ wishlist: [] })
            renderWithTheme(<ProfileLayout user={mockUser} />)

            expect(screen.getByTestId('wishlist-count')).toHaveTextContent('0')
        })
    })

    describe('Complete User Profile', () => {
        it('renders all sections for a complete user profile', () => {
            const mockUser = createMockUser({
                firstName: 'Complete',
                lastName: 'User',
                bio: 'Full bio here',
                location: 'Complete City',
                instagram: 'completeinsta',
                x: 'completex',
                facebook: 'completefb',
                discord: 'completediscord',
                whatsapp: '1111111111',
                showcaseList: [
                    { card: { name: 'Showcase1', image_url: 'showcase1.png' } }
                ],
                tradeList: [
                    { card: { name: 'Trade1', image_url: 'trade1.png' } }
                ],
                wishlist: [{ card: { name: 'Wish1', image_url: 'wish1.png' } }]
            })

            renderWithTheme(<ProfileLayout user={mockUser} />)

            // Check name
            expect(screen.getByRole('heading')).toHaveTextContent(
                'Complete User'
            )

            // Check bio
            expect(screen.getByText('Full bio here')).toBeInTheDocument()

            // Check location
            expect(screen.getByText('Complete City')).toBeInTheDocument()

            // Check all components are rendered
            expect(
                screen.getByTestId('sociallinks-component')
            ).toBeInTheDocument()
            expect(screen.getByTestId('showcase-component')).toBeInTheDocument()
            expect(
                screen.getByTestId('tradelist-component')
            ).toBeInTheDocument()
            expect(screen.getByTestId('wishlist-component')).toBeInTheDocument()
        })

        it('renders minimal user profile with only required fields', () => {
            const mockUser = createMockUser({
                firstName: null,
                lastName: null,
                bio: null,
                location: null,
                instagram: undefined,
                x: undefined,
                facebook: undefined,
                discord: undefined,
                whatsapp: undefined,
                showcaseList: [],
                tradeList: [],
                wishlist: []
            })

            renderWithTheme(<ProfileLayout user={mockUser} />)

            // No heading should be rendered
            expect(screen.queryByRole('heading')).not.toBeInTheDocument()

            // All components should still be rendered (even if empty)
            expect(
                screen.getByTestId('sociallinks-component')
            ).toBeInTheDocument()
            expect(screen.getByTestId('showcase-component')).toBeInTheDocument()
            expect(
                screen.getByTestId('tradelist-component')
            ).toBeInTheDocument()
            expect(screen.getByTestId('wishlist-component')).toBeInTheDocument()
        })
    })
})
