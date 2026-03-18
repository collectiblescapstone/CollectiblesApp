import '@testing-library/jest-dom'
import { screen, waitFor, fireEvent } from '@testing-library/react'

import EditCardPage from '../page'
import { renderWithTheme } from '../../../utils/testing-utils'
import { useAuth } from '../../../context/AuthProvider'
import { usePokemonCards } from '../../../context/PokemonCardsProvider'
import { CapacitorHttp } from '@capacitor/core'
import PopupUI from '../../../components/ui/PopupUI'
import { refreshPokemonCards } from '../../../utils/userPokemonCard'

jest.mock('../../../context/AuthProvider.tsx', () => ({
    useAuth: jest.fn()
}))

jest.mock('../../../context/PokemonCardsProvider.tsx', () => ({
    usePokemonCards: jest.fn()
}))

const mockReplace = jest.fn()
const mockBack = jest.fn()
let mockCardId: string | null = 'card-123'
let mockEntryId: string | null = null

jest.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: (key: string) => {
            if (key === 'cardId') return mockCardId
            if (key === 'entryId') return mockEntryId
            return null
        }
    }),
    useRouter: () => ({
        replace: mockReplace,
        back: mockBack
    })
}))

jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

jest.mock('../../../components/ui/PopupUI.tsx', () => ({
    __esModule: true,
    default: {
        open: jest.fn(),
        close: jest.fn(),
        Viewport: () => <div data-testid="popup-viewport" />
    }
}))

jest.mock(
    '../../../components/pokemon-cards/pokemon-card-header/PokemonCardHeader',
    () => ({
        __esModule: true,
        default: ({ cardId }: { cardId: string }) => (
            <div data-testid="pokemon-card-header">{cardId}</div>
        )
    })
)

jest.mock('../../../utils/userPokemonCard', () => ({
    refreshPokemonCards: jest.fn()
}))

const mockedUseAuth = jest.mocked(useAuth)
const mockedUsePokemonCards = jest.mocked(usePokemonCards)
const mockedPost = CapacitorHttp.post as jest.MockedFunction<
    typeof CapacitorHttp.post
>
const mockedPopup = PopupUI as jest.Mocked<typeof PopupUI>
const mockedRefreshPokemonCards = jest.mocked(refreshPokemonCards)

const baseCard = {
    id: 'card-123',
    cardId: 'card-123',
    name: 'Pikachu',
    setId: 'sv01',
    variants: undefined
}

describe('edit-card page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockCardId = 'card-123'
        mockEntryId = null
        Object.defineProperty(document, 'referrer', {
            configurable: true,
            value: ''
        })

        mockedUseAuth.mockReturnValue({
            loading: false,
            session: {
                access_token: 'token-123',
                user: { id: 'user-1' }
            }
        } as ReturnType<typeof useAuth>)

        mockedUsePokemonCards.mockReturnValue({
            pokemonCards: {
                'card-123': baseCard
            }
        } as unknown as ReturnType<typeof usePokemonCards>)
    })

    it('shows spinner when auth is loading', () => {
        mockedUseAuth.mockReturnValue({
            loading: true,
            session: null
        } as ReturnType<typeof useAuth>)

        renderWithTheme(<EditCardPage />)

        expect(document.querySelector('.chakra-spinner')).toBeInTheDocument()
    })

    it('submits a new card and opens success popup', async () => {
        mockedPost.mockImplementation(async (options) => {
            if (options.url?.includes('/api/collection/showcase')) {
                return {
                    status: 200,
                    data: { showcaseCount: 0, data: [] }
                } as never
            }

            if (options.url?.includes('/api/collection/save')) {
                return {
                    status: 200,
                    data: { ok: true }
                } as never
            }

            throw new Error(`Unexpected URL: ${options.url}`)
        })

        renderWithTheme(<EditCardPage />)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save/i })
            ).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(mockedPost).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining('/api/collection/save')
                })
            )
        })

        expect(mockedRefreshPokemonCards).toHaveBeenCalledWith('user-1')
        expect(mockedPopup.open).toHaveBeenCalledWith(
            'save-confirmation',
            expect.objectContaining({ title: 'Card Saved!' })
        )

        const popupConfig = mockedPopup.open.mock.calls[0][1] as {
            onClickClose: () => void
        }
        popupConfig.onClickClose()

        expect(mockedPopup.close).toHaveBeenCalledWith('save-confirmation')
        expect(mockReplace).toHaveBeenCalledWith('/user-cards?cardId=card-123')
    })

    it('prevents submitting when showcase limit is reached', async () => {
        mockedPost.mockResolvedValue({
            status: 200,
            data: { showcaseCount: 3, data: [] }
        } as never)

        renderWithTheme(<EditCardPage />)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /showcase/i })
            ).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('button', { name: /showcase/i }))
        fireEvent.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(
                screen.getByText(
                    'You can only have 3 cards showcased at a time.'
                )
            ).toBeInTheDocument()
        })

        expect(mockedPost).toHaveBeenCalledTimes(1)
        expect(mockedPopup.open).not.toHaveBeenCalled()
    })

    it('loads existing entry and submits edit flow', async () => {
        mockEntryId = 'entry-999'
        Object.defineProperty(document, 'referrer', {
            configurable: true,
            value: 'http://localhost/user-cards'
        })

        mockedPost.mockImplementation(async (options) => {
            if (options.url?.includes('/api/collection/showcase')) {
                return {
                    status: 200,
                    data: { showcaseCount: 1, data: [{ id: 'entry-111' }] }
                } as never
            }

            if (options.url?.includes('/api/collection/read')) {
                return {
                    status: 200,
                    data: {
                        data: {
                            showcase: true,
                            forTrade: true,
                            grade: 'PSA',
                            gradeLevel: 'psa-10',
                            condition: 'near-mint',
                            variant: 'normal',
                            tags: ['pc']
                        }
                    }
                } as never
            }

            if (options.url?.includes('/api/collection/edit')) {
                return {
                    status: 200,
                    data: { ok: true }
                } as never
            }

            throw new Error(`Unexpected URL: ${options.url}`)
        })

        renderWithTheme(<EditCardPage />)

        await waitFor(() => {
            expect(mockedPost).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining('/api/collection/read')
                })
            )
        })

        fireEvent.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(mockedPost).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining('/api/collection/edit')
                })
            )
        })

        const popupConfig = mockedPopup.open.mock.calls[0][1] as {
            onClickClose: () => void
        }
        popupConfig.onClickClose()

        expect(mockBack).toHaveBeenCalled()
    })

    it('shows alert when save request fails', async () => {
        const alertSpy = jest
            .spyOn(window, 'alert')
            .mockImplementation(() => {})

        mockedPost.mockImplementation(async (options) => {
            if (options.url?.includes('/api/collection/showcase')) {
                return {
                    status: 200,
                    data: { showcaseCount: 0, data: [] }
                } as never
            }

            if (options.url?.includes('/api/collection/save')) {
                return {
                    status: 500,
                    data: { error: 'Failed to save card' }
                } as never
            }

            throw new Error(`Unexpected URL: ${options.url}`)
        })

        renderWithTheme(<EditCardPage />)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save/i })
            ).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to save card')
        })

        expect(mockedPopup.open).not.toHaveBeenCalled()
        alertSpy.mockRestore()
    })
})
