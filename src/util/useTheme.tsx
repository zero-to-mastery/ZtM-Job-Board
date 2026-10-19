import { useEffect, useRef, useState } from 'react'
import {
    Theme,
    applyTheme,
    getInitialTheme,
    getSavedTheme,
    saveTheme,
    subscribeToSystemTheme,
} from './theme'

const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme)
    const hasManualSelection = useRef(false)

    useEffect(() => {
        applyTheme(theme, document.documentElement)
    }, [theme])

    // Follow the system theme until the user picks one manually
    useEffect(
        () =>
            subscribeToSystemTheme((systemTheme) => {
                if (!hasManualSelection.current && !getSavedTheme()) {
                    setTheme(systemTheme)
                }
            }),
        []
    )

    const toggleTheme = () => {
        const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
        hasManualSelection.current = true
        saveTheme(nextTheme)
        setTheme(nextTheme)
    }

    return { theme, toggleTheme }
}

export default useTheme
