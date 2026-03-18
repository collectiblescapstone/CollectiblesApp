import React from 'react'
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SocialLinks from '../SocialLinks'
import { renderWithTheme } from '../../../utils/testing-utils'

describe('SocialLinks', () => {
    describe('Empty State', () => {
        it('returns null when no social links are provided', () => {
            const { container } = renderWithTheme(<SocialLinks />)

            expect(container.firstChild).toBeNull()
        })

        it('returns null when all props are undefined', () => {
            const { container } = renderWithTheme(
                <SocialLinks
                    instagram={undefined}
                    x={undefined}
                    facebook={undefined}
                    discord={undefined}
                    whatsapp={undefined}
                />
            )

            expect(container.firstChild).toBeNull()
        })

        it('returns null when all props are empty strings', () => {
            const { container } = renderWithTheme(
                <SocialLinks
                    instagram=""
                    x=""
                    facebook=""
                    discord=""
                    whatsapp=""
                />
            )

            expect(container.firstChild).toBeNull()
        })
    })

    describe('Individual Social Links', () => {
        it('renders instagram handle when provided', () => {
            renderWithTheme(<SocialLinks instagram="myinstagram" />)

            expect(screen.getByText('myinstagram')).toBeInTheDocument()
        })

        it('renders x handle when provided', () => {
            renderWithTheme(<SocialLinks x="myxhandle" />)

            expect(screen.getByText('myxhandle')).toBeInTheDocument()
        })

        it('renders facebook handle when provided', () => {
            renderWithTheme(<SocialLinks facebook="myfacebook" />)

            expect(screen.getByText('myfacebook')).toBeInTheDocument()
        })

        it('renders discord handle when provided', () => {
            renderWithTheme(<SocialLinks discord="mydiscord" />)

            expect(screen.getByText('mydiscord')).toBeInTheDocument()
        })

        it('renders whatsapp handle when provided', () => {
            renderWithTheme(<SocialLinks whatsapp="1234567890" />)

            expect(screen.getByText('1234567890')).toBeInTheDocument()
        })
    })

    describe('Multiple Social Links', () => {
        it('renders all social links when all are provided', () => {
            renderWithTheme(
                <SocialLinks
                    instagram="insta_user"
                    x="x_user"
                    facebook="fb_user"
                    discord="discord_user"
                    whatsapp="9876543210"
                />
            )

            expect(screen.getByText('insta_user')).toBeInTheDocument()
            expect(screen.getByText('x_user')).toBeInTheDocument()
            expect(screen.getByText('fb_user')).toBeInTheDocument()
            expect(screen.getByText('discord_user')).toBeInTheDocument()
            expect(screen.getByText('9876543210')).toBeInTheDocument()
        })

        it('renders only provided social links', () => {
            renderWithTheme(
                <SocialLinks instagram="only_insta" discord="only_discord" />
            )

            expect(screen.getByText('only_insta')).toBeInTheDocument()
            expect(screen.getByText('only_discord')).toBeInTheDocument()
        })

        it('renders subset of social links correctly', () => {
            renderWithTheme(
                <SocialLinks
                    x="twitter_handle"
                    facebook="facebook_page"
                    whatsapp="5551234567"
                />
            )

            expect(screen.getByText('twitter_handle')).toBeInTheDocument()
            expect(screen.getByText('facebook_page')).toBeInTheDocument()
            expect(screen.getByText('5551234567')).toBeInTheDocument()
        })
    })

    describe('Mixed Provided and Empty', () => {
        it('renders only non-empty social links', () => {
            renderWithTheme(
                <SocialLinks
                    instagram="valid_insta"
                    x=""
                    facebook={undefined}
                    discord="valid_discord"
                    whatsapp=""
                />
            )

            expect(screen.getByText('valid_insta')).toBeInTheDocument()
            expect(screen.getByText('valid_discord')).toBeInTheDocument()
            // Only 2 social links should be rendered (instagram and discord)
            const allTexts = screen.getAllByText(/valid_/)
            expect(allTexts).toHaveLength(2)
        })
    })

    describe('Single Social Link', () => {
        it('renders container when only one social link is provided', () => {
            const { container } = renderWithTheme(
                <SocialLinks facebook="single_fb" />
            )

            expect(container.firstChild).not.toBeNull()
            expect(screen.getByText('single_fb')).toBeInTheDocument()
        })
    })
})
