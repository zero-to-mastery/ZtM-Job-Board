import React from 'react'
import useTheme from '../util/useTheme'
import { Pointer } from './Pointer'

// Outline icons; the global svg fill rule is turned off in .theme-toggle__icon
const MoonIcon = () => (
    <svg className="theme-toggle__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
)

const SunIcon = () => (
    <svg className="theme-toggle__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
)

// Shows the theme it switches to: a sun in dark mode, a moon in light mode
const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme()
    const next = theme === 'dark' ? 'light' : 'dark'

    return (
        <Pointer
            onClick={toggleTheme}
            label={`Switch to ${next} mode`}
            Text={next === 'light' ? <SunIcon /> : <MoonIcon />}
            TooltipText={`Click to enable ${next} mode`}
        />
    )
}

export default ThemeToggle
