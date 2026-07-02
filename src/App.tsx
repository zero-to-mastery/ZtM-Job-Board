import React, { useState, lazy, Suspense } from 'react'
import Search from './components/Search'
import { createFilter } from 'react-search-input'
import { shuffle } from './util/shuffle'
import './styles/SearchBarMobileView.scss'
import BatchCards from './components/BatchCards'
import Navbar from './components/Navbar'
import persons from './assets/persons.json'
import { pageNames } from './util/pageNames'
import useForceUpdate from './util/useForceUpdate'

// Lazy load the Map component to optimize initial bundle size and split the chunk
const SimpleMap = lazy(() => import('./components/Map'))

// Cast JSON import to 'any' type to accommodate varied profile data structures
const people: any = persons

// Inline styling fallback configurations for mobile view search header
const style: React.CSSProperties = {
    background: '#fff',
    padding: '1rem',
    width: '100%',
    margin: '0 0 2rem 0',
    zIndex: 1,
    borderRadius: '5px',
}

const responsiveSearch = {
    width: '100%',
    marginBottom: '0.5rem',
    padding: '0.5rem',
}

// Allowed object keys passed down to react-search-input for parsing developer data
const KEYS_TO_FILTERS = [
    'name',
    'jobTitle',
    'location.city',
    'location.state',
    'location.country',
]

function App() {
    // Component State declarations
    const [searchfield, setSearchfield] = useState('')
    const [map, setMap] = useState(false)
    const [mapOrHomeTitle, setMapOrHomeTitle] = useState(pageNames.map) // Defaults to map page string

    // Trigger state workarounds for array mutations via a custom React hook
    const forceUpdate = useForceUpdate()

    /**
     * Filters developer profile objects based on search query matching against target keys
     * @param {string} searchFilter - Current search field string query
     */
    const filteredPersons = (searchFilter: any) =>
        people.filter(createFilter(searchFilter, KEYS_TO_FILTERS))

    // Note: The shuffle function is not a pure function; it mutates the original array
    // in place to prevent memory overhead and array cloning over heavy objects.
    shuffle(people)

    /**
     * Toggles layout visibility between the main list view and the geographic map view,
     * resetting active search fields on change.
     */
    function goBack() {
        setMap(!map)
        setMapOrHomeTitle(map ? pageNames.map : pageNames.home)
        setSearchfield('')
    }

    /**
     * Handles user trigger click events to re-shuffle arrays in place, forcing a re-render.
     */
    function shufflePeopleOnClick() {
        shuffle(people)
        forceUpdate()
    }

    return (
        <div className="flex flex-column min-vh-100 tc">
            {/* Header Configuration containing Application Navigation Actions */}
            <header className="custom--unselectable top-0 w-100 white custom--bg-additional3 custom--shadow-4 z-9999">
                <Navbar
                    onLogoClick={goBack}
                    onSearchChange={(e: any) => setSearchfield(e.target.value)}
                    onMapClick={goBack}
                    mapOrHomeTitle={mapOrHomeTitle}
                    shufflePeopleOnClick={shufflePeopleOnClick}
                />
            </header>

            {/* Main Application Container - Dynamically switches between Grid Cards and Lazy Map */}
            <main className="flex-auto">
                {map ? (
                    <Suspense
                        fallback={
                            <div className="pv5 text-center">
                                <p className="f4 fw6">Loading Map...</p>
                                <p className="f6 gray">
                                    Try refreshing if it doesn't load or check
                                    your internet connection and try again later.
                                </p>
                            </div>
                        }
                    >
                        <SimpleMap />
                    </Suspense>
                ) : (
                    <div id="sketch-particles">
                        {/* Mobile view search field visibility toggle block */}
                        <div
                            className="visible-on-mobileview-only"
                            style={style}
                        >
                            <Search
                                onSearchChange={(e: any) =>
                                    setSearchfield(e.target.value)
                                }
                                responsiveSearch={responsiveSearch}
                            />
                        </div>

                        {/* Paginated grid renderer for matching member datasets */}
                        <BatchCards
                            persons={filteredPersons(searchfield)}
                            numberPerBatch={16}
                        />
                    </div>
                )}
            </main>

            {/* Persistent Footer Component with Repository link mappings */}
            <footer className="custom--unselectable w-100 h3 flex items-center justify-center white custom--bg-additional3 z-2">
                <div className="flex items-center">
                    Copyright © {new Date().getFullYear()} by Zero to Mastery.
                    All Rights Reserved. &nbsp;&nbsp;
                    <a
                        href="https://github.com/zero-to-mastery/ZtM-Job-Board"
                        title="Repository"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'white' }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="white"
                        >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                    </a>
                </div>
            </footer>

            {/* Back to Top Smooth Scroll Action Button */}
            <div className="custom--top-button">
                <div
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="bi bi-arrow-up"
                        viewBox="0 0 16 16"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"
                        />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default App
