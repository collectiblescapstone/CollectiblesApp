'use client'

import { useState, useEffect } from 'react'

export const useLocalStorage = (
    key: string,
    defaultValue: string | number | boolean | object
) => {
    const [state, setState] = useState(() => {
        // Lazy initialization to only run once on mount
        if (typeof window === 'undefined') {
            return defaultValue
        }
        const storedValue = window.localStorage.getItem(key)
        return storedValue !== null ? JSON.parse(storedValue) : defaultValue
    })

    useEffect(() => {
        // Update localStorage whenever the state changes
        window.localStorage.setItem(key, JSON.stringify(state))
    }, [key, state])

    return [state, setState]
}
