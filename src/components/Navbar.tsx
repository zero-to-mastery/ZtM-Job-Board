import React from 'react'
import Search from './Search'
import '../styles/SearchBarDesktopView.scss'
import { pageNames } from '../util/pageNames'
import { Pointer } from './Pointer'
import ztmLogo from '../assets/ztm-logo.svg?raw'
import useTheme from '../util/useTheme'

interface NavbarProps {
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    searchValue: string
    onMapClick: () => void
    onTitleClick: () => void
    mapOrHomeTitle: string
    shufflePeopleOnClick: () => void
}

const Navbar = ({
    onSearchChange,
    searchValue,
    onMapClick,
    onTitleClick,
    mapOrHomeTitle,
    shufflePeopleOnClick,
}: NavbarProps) => {
    const { theme, toggleTheme } = useTheme()
    const isDarkMode = theme === 'dark'

    return (
        <div className="header-items flex flex-wrap justify-between">
            <h1 id="title" className="relative ma0 mr4 pa0 fl-l">
                <a
                    href="https://zerotomastery.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Zero To Mastery (opens in a new tab)"
                    className="title-logo"
                >
                    {/* Inlined so the "ZTM" letters (fill="currentColor") follow the header text color */}
                    <span
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: ztmLogo }}
                    />
                </a>
                <button
                    type="button"
                    onClick={onTitleClick}
                    aria-label="Job Board, home"
                    className="title-home pointer"
                >
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
                        <Search
                            onSearchChange={onSearchChange}
                            value={searchValue}
                        />
                    </div>
                )}
                {/* Dark mode toggle button */}
                <Pointer
                    onClick={toggleTheme}
                    Text={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    TooltipText={`Click to enable ${isDarkMode ? 'light' : 'dark'} mode`}
                />
            </div>
        </div>
    )
}

export default Navbar
