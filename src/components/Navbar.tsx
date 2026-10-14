import React from 'react'
import { pageNames } from '../util/pageNames'
import { Pointer } from './Pointer'
import ztmLogo from '../assets/ztm-logo.svg?raw'
import ThemeToggle from './ThemeToggle'

interface NavbarProps {
    onMapClick: () => void
    onTitleClick: () => void
    mapOrDirectoryTitle: string
    shufflePeopleOnClick: () => void
}

const Navbar = ({
    onMapClick,
    onTitleClick,
    mapOrDirectoryTitle,
    shufflePeopleOnClick,
}: NavbarProps) => {
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
                    Text={mapOrDirectoryTitle}
                    TooltipText={
                        mapOrDirectoryTitle === pageNames.directory
                            ? 'Back to the developer directory'
                            : 'See the Map'
                    }
                />
                {mapOrDirectoryTitle !== pageNames.directory && (
                    <Pointer
                        onClick={shufflePeopleOnClick}
                        Text="Shuffle"
                        TooltipText="Click to shuffle the Cards"
                    />
                )}
                <ThemeToggle />
            </div>
        </div>
    )
}

export default Navbar
