'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

interface HeaderContextType {
    profileId: string
    setProfileID: (newProfileID: string) => void
}

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
    const [profileId, setProfileID] = useState('Collectibles App')

    return (
        <HeaderContext.Provider value={{ profileId, setProfileID }}>
            {children}
        </HeaderContext.Provider>
    )
}

export const useHeader = () => {
    const context = useContext(HeaderContext)
    return context
}
