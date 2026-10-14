import React, { useState, useEffect } from 'react'
import Search from './Search'
import '../styles/SearchBarDesktopView.scss'
import { pageNames } from '../util/pageNames'
import { shuffle } from '../util/shuffle'
import { Pointer } from './Pointer'
import ztmLogo from '../assets/ztm-logo.svg?raw'

const Navbar = ({
    onSearchChange,
    onMapClick,
    onLogoClick,
    mapOrHomeTitle,
    shufflePeopleOnClick,
}: any) => {
    const [isDarkMode, setIsDarkMode] = useState(false)

    // Check if dark mode is already set in localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme === 'dark') {
            setIsDarkMode(true)
            document.body.classList.add('dark-mode')
        }
    }, [])

    // Toggle dark mode
    const handleDarkModeToggle = () => {
        const newMode = !isDarkMode
        setIsDarkMode(newMode)
        if (newMode) {
            document.body.classList.add('dark-mode')
            localStorage.setItem('theme', 'dark')
        } else {
            document.body.classList.remove('dark-mode')
            localStorage.setItem('theme', 'light')
        }
    }

    return (
        <div className="header-items flex flex-wrap justify-between">
            <h1 id="title" className="relative ma0 mr4 pa0 fl-l">
                <button
                    type="button"
                    onClick={onLogoClick}
                    aria-label="Zero To Mastery Job Board, home"
                    className="title-home pointer"
                >
                    {/* Inlined so the "ZTM" letters (fill="currentColor") follow the header text color */}
                    <span
                        aria-hidden="true"
                        className="title-logo"
                        dangerouslySetInnerHTML={{ __html: ztmLogo }}
                    />
                    <span className="fw3">Job</span>
                    <span className="fw7 custom--text-primary">Board</span>
                </button>
            </h1>
            <div className="flex items-center">
                <Pointer
                    onClick={onMapClick}
                    Text={mapOrHomeTitle}
                    TooltipText={
                        mapOrHomeTitle === 'Home'
                            ? 'Go to Home Page'
                            : 'See the Map'
                    }
                />
                {mapOrHomeTitle !== 'Home' && (
                    <Pointer
                        onClick={shufflePeopleOnClick}
                        Text="Shuffle"
                        TooltipText="Click to shuffle the Cards"
                    />
                )}
                {mapOrHomeTitle === pageNames.map && (
                    <div
                        style={{ margin: 0, padding: 0 }}
                        className="visible-on-desktopview-only"
                    >
                        <Search onSearchChange={onSearchChange} />
                    </div>
                )}
                {/* Dark mode toggle button */}
                <Pointer
                    onClick={handleDarkModeToggle}
                    Text={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    TooltipText={`Click to enable ${isDarkMode ? 'light' : 'dark'} mode`}
                />
            </div>
        </div>
    )
}

export default Navbar
