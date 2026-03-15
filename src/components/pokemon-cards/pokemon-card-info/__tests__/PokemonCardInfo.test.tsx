import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../../../../utils/testing-utils'
import PokemonCardInfo from '../PokemonCardInfo'
import { CapacitorHttp } from '@capacitor/core'
import * as AuthProvider from '../../../../context/AuthProvider'

// Mock CapacitorHttp
jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        delete: jest.fn()
    }
}))

const mockDelete = CapacitorHttp.delete as jest.MockedFunction<
    typeof CapacitorHttp.delete
>

// Mock AuthProvider
const mockSession = {
    user: { id: 'test-user-123' },
    access_token: 'test-token'
}

jest.mock('../../../../context/AuthProvider', () => ({
    useAuth: jest.fn(() => ({
        session: mockSession
    }))
}))

const mockUseAuth = AuthProvider.useAuth as jest.MockedFunction<
    typeof AuthProvider.useAuth
>

// Mock PopupUI
jest.mock('../../../../components/ui/PopupUI', () => ({
    __esModule: true,
    default: {
        open: jest.fn(),
        close: jest.fn(),
        Viewport: () => <div data-testid="popup-viewport" />
    }
}))

import PopupUI from '../../../../components/ui/PopupUI'
const mockPopupOpen = PopupUI.open as jest.MockedFunction<typeof PopupUI.open>
const mockPopupClose = PopupUI.close as jest.MockedFunction<
    typeof PopupUI.close
>

// Mock utilities
jest.mock('../../../../utils/userPokemonCard', () => ({
    getUserCard: jest.fn(),
    refreshPokemonCards: jest.fn()
}))

import * as userPokemonCard from '../../../../utils/userPokemonCard'
const mockGetUserCard = userPokemonCard.getUserCard as jest.MockedFunction<
    typeof userPokemonCard.getUserCard
>
const mockRefreshPokemonCards =
    userPokemonCard.refreshPokemonCards as jest.MockedFunction<
        typeof userPokemonCard.refreshPokemonCards
    >

jest.mock('../../../../utils/cardInfo/cardGrading', () => ({
    cardConditionsMap: {
        'near-mint': 'Near Mint',
        'lightly-played': 'Lightly Played',
        'moderately-played': 'Moderately Played'
    },
    parseGradeLevel: jest.fn((grade: string, level: string) => level)
}))

jest.mock('../../../../utils/capitalize', () => ({
    capitalizeEachWord: jest.fn((str: string) => str)
}))

jest.mock('../../../../utils/constants', () => ({
    baseUrl: 'http://localhost:3000'
}))

// Mock react-icons
jest.mock('react-icons/fa', () => ({
    FaEye: () => <div data-testid="eye-icon">Eye</div>,
    FaPencilAlt: () => <div data-testid="pencil-icon">Pencil</div>,
    FaRegTrashAlt: () => <div data-testid="trash-icon">Trash</div>
}))

jest.mock('react-icons/io5', () => ({
    IoSwapVertical: () => <div data-testid="swap-icon">Swap</div>
}))

jest.mock('react-icons/tb', () => ({
    TbCards: () => <div data-testid="cards-icon">Cards</div>,
    TbPlayCard: () => <div data-testid="playcard-icon">PlayCard</div>
}))

describe('PokemonCardInfo', () => {
    const mockCardInfo = {
        cardId: 'sv01-001',
        variant: 'normal',
        condition: 'near-mint',
        grade: null,
        gradeLevel: null,
        forTrade: false,
        showcase: false
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAuth.mockReturnValue({ session: mockSession } as any)
        mockGetUserCard.mockResolvedValue(mockCardInfo as any)
    })

    describe('Rendering', () => {
        it('renders the card info component', async () => {
            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(screen.getByTestId('cards-icon')).toBeInTheDocument()
            })
        })

        it('displays card variant', async () => {
            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(screen.getByText('normal')).toBeInTheDocument()
            })
        })

        it('displays card condition for ungraded cards', async () => {
            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(screen.getByText('Near Mint')).toBeInTheDocument()
            })
        })

        it('displays grade level for graded cards', async () => {
            mockGetUserCard.mockResolvedValue({
                ...mockCardInfo,
                grade: 'PSA',
                gradeLevel: '10'
            } as any)

            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(screen.getByText('PSA 10')).toBeInTheDocument()
            })
        })

        it('renders PopupUI viewport', async () => {
            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(screen.getByTestId('popup-viewport')).toBeInTheDocument()
            })
        })
    })

    describe('Icons Display', () => {
        it('shows showcase icon when card is in showcase', async () => {
            mockGetUserCard.mockResolvedValue({
                ...mockCardInfo,
                showcase: true
            } as any)

            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
            })
        })

        it('shows trade icon when card is for trade', async () => {
            mockGetUserCard.mockResolvedValue({
                ...mockCardInfo,
                forTrade: true
            } as any)

            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(screen.getByTestId('swap-icon')).toBeInTheDocument()
            })
        })

        it('shows both icons when card is in showcase and for trade', async () => {
            mockGetUserCard.mockResolvedValue({
                ...mockCardInfo,
                showcase: true,
                forTrade: true
            } as any)

            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
                expect(screen.getByTestId('swap-icon')).toBeInTheDocument()
            })
        })

        it('does not show icons when card is neither in showcase nor for trade', async () => {
            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(screen.queryByTestId('eye-icon')).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('swap-icon')
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Edit Button', () => {
        it('renders edit button when deleteCard is false', async () => {
            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(screen.getByTestId('pencil-icon')).toBeInTheDocument()
            })
        })

        it('handles edit button click', async () => {
            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()

            await waitFor(() => {
                const editButton = screen
                    .getByTestId('pencil-icon')
                    .closest('button')
                fireEvent.click(editButton!)
            })

            expect(screen.getByTestId('pencil-icon')).toBeInTheDocument()
            consoleErrorSpy.mockRestore()
        })
    })

    describe('Delete Button', () => {
        it('renders delete button when deleteCard is true', async () => {
            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={true} />
            )

            await waitFor(() => {
                expect(screen.getByTestId('trash-icon')).toBeInTheDocument()
            })
        })

        it('opens confirmation popup when delete button is clicked', async () => {
            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={true} />
            )

            await waitFor(() => {
                const deleteButton = screen
                    .getByTestId('trash-icon')
                    .closest('button')
                fireEvent.click(deleteButton!)
            })

            expect(mockPopupOpen).toHaveBeenCalledWith(
                'confirm-delete',
                expect.any(Object)
            )
        })

        it('does not render delete button when deleteCard is false', async () => {
            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(
                    screen.queryByTestId('trash-icon')
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Delete Handler', () => {
        it('deletes card and calls onDelete callback', async () => {
            const mockOnDelete = jest.fn()
            mockDelete.mockResolvedValue({} as any)

            renderWithTheme(
                <PokemonCardInfo
                    entryId="entry-123"
                    deleteCard={true}
                    onDelete={mockOnDelete}
                />
            )

            await waitFor(() => {
                const deleteButton = screen
                    .getByTestId('trash-icon')
                    .closest('button')
                fireEvent.click(deleteButton!)
            })

            // Get the popup config and extract the delete button onClick
            const popupConfig = mockPopupOpen.mock.calls[0][1]
            const deleteButtonOnClick = (popupConfig.content as any).props
                .children[1].props.children[1].props.onClick

            await deleteButtonOnClick()

            await waitFor(() => {
                expect(mockDelete).toHaveBeenCalledWith({
                    url: 'http://localhost:3000/api/collection/delete',
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token'
                    },
                    data: JSON.stringify({ entryId: 'entry-123' })
                })
                expect(mockOnDelete).toHaveBeenCalledWith('entry-123')
                expect(mockPopupClose).toHaveBeenCalledWith('confirm-delete')
            })
        })

        it('does not delete card when session is missing', async () => {
            mockUseAuth.mockReturnValue({ session: null } as any)

            const mockOnDelete = jest.fn()

            renderWithTheme(
                <PokemonCardInfo
                    entryId="entry-123"
                    deleteCard={true}
                    onDelete={mockOnDelete}
                />
            )

            await waitFor(() => {
                expect(
                    screen.queryByTestId('trash-icon')
                ).not.toBeInTheDocument()
            })
            expect(mockDelete).not.toHaveBeenCalled()
            expect(mockOnDelete).not.toHaveBeenCalled()
        })

        it('handles delete error gracefully', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()
            mockDelete.mockRejectedValue(new Error('Delete failed'))

            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={true} />
            )

            await waitFor(() => {
                const deleteButton = screen
                    .getByTestId('trash-icon')
                    .closest('button')
                fireEvent.click(deleteButton!)
            })

            const popupConfig = mockPopupOpen.mock.calls[0][1]
            const deleteButtonOnClick = (popupConfig.content as any).props
                .children[1].props.children[1].props.onClick

            await deleteButtonOnClick()

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalled()
            })

            consoleErrorSpy.mockRestore()
        })
    })

    describe('Refresh Trigger', () => {
        it('refetches card info when refreshTrigger changes', async () => {
            const { rerender } = renderWithTheme(
                <PokemonCardInfo
                    entryId="entry-123"
                    deleteCard={false}
                    refreshTrigger={0}
                />
            )

            await waitFor(() => {
                expect(mockGetUserCard).toHaveBeenCalledTimes(1)
            })

            rerender(
                <PokemonCardInfo
                    entryId="entry-123"
                    deleteCard={false}
                    refreshTrigger={1}
                />
            )

            await waitFor(() => {
                expect(mockGetUserCard).toHaveBeenCalledTimes(2)
            })
        })
    })

    describe('Error Handling', () => {
        it('handles fetch error gracefully', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()
            mockGetUserCard.mockRejectedValue(new Error('Fetch failed'))

            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalled()
            })

            consoleErrorSpy.mockRestore()
        })

        it('does not fetch when session is missing', async () => {
            mockUseAuth.mockReturnValue({ session: null } as any)

            renderWithTheme(
                <PokemonCardInfo entryId="entry-123" deleteCard={false} />
            )

            await waitFor(
                () => {
                    expect(mockGetUserCard).not.toHaveBeenCalled()
                },
                { timeout: 500 }
            )
        })
    })
})
