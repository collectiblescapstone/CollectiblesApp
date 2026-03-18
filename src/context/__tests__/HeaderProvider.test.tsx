import { act, renderHook } from '@testing-library/react'
import { HeaderProvider, useHeader } from '../HeaderProvider'
import { ReactNode } from 'react'

describe('HeaderProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
        <HeaderProvider>{children}</HeaderProvider>
    )

    it('provides default profileId', () => {
        const { result } = renderHook(() => useHeader(), { wrapper })
        expect(result.current.profileId).toBe('Kollec')
    })

    it('updates profileId correctly', () => {
        const { result } = renderHook(() => useHeader(), { wrapper })
        act(() => {
            result.current.setProfileID('NewProfile')
        })
        expect(result.current.profileId).toBe('NewProfile')
    })

    it('throws error when used outside of provider', () => {
        expect(() => renderHook(() => useHeader())).toThrow(
            'useHeader must be used within a HeaderProvider'
        )
    })
})
