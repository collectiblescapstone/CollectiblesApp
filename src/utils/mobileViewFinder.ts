import { Capacitor } from '@capacitor/core'
import { useState } from 'react'

export const CHAKRA_UI_LG_BREAKPOINT = 992

export const useMobileView = (): boolean => {
    const [isMobileView] = useState<boolean>(() => {
        if (typeof window === 'undefined') return true
        return (
            Capacitor.isNativePlatform() ||
            window.innerWidth <= CHAKRA_UI_LG_BREAKPOINT
        )
    })

    return isMobileView
}
