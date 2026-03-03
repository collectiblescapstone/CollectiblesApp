'use client'

import { useLocalStorage } from '@/hooks/useLocalStorage'
import { createContext, useContext, useState, ReactNode } from 'react'

type ProfileContextType = {
    profileSelected: string
    setProfileSelected: (profileSelected: string) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const ProfileSelectionProvider = ({
    children
}: {
    children: ReactNode
}) => {
    // Use local storage to persist the selected profile across sessions
    const [profileSelected, setProfileSelected] = useLocalStorage(
        'profileSelected',
        ''
    )

    return (
        <ProfileContext.Provider
            value={{ profileSelected, setProfileSelected }}
        >
            {children}
        </ProfileContext.Provider>
    )
}

export const useProfileSelected = () => {
    const context = useContext(ProfileContext)
    if (!context) {
        throw new Error(
            'useProfileSelected must be used within a ProfileSelectionProvider'
        )
    }
    return context
}
