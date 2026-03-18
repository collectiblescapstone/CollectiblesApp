import { act, renderHook } from '@testing-library/react'
import {
    ProfileSelectionProvider,
    useProfileSelected
} from '../ProfileSelectionProvider'

describe('ProfileSelectionProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ProfileSelectionProvider>{children}</ProfileSelectionProvider>
    )

    it('provides default profileSelected', () => {
        const { result } = renderHook(() => useProfileSelected(), { wrapper })
        expect(result.current.profileSelected).toBe('')
    })

    it('updates profileSelected correctly', () => {
        const { result } = renderHook(() => useProfileSelected(), { wrapper })
        act(() => {
            result.current.setProfileSelected('NewProfile')
        })
        expect(result.current.profileSelected).toBe('NewProfile')
    })

    it('throws error when used outside of provider', () => {
        expect(() => renderHook(() => useProfileSelected())).toThrow(
            'useProfileSelected must be used within a ProfileSelectionProvider'
        )
    })
})
