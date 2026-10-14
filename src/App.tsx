import React, { useCallback, useEffect, useState, lazy, Suspense } from 'react'
import Search from './components/Search'
import MapSkeleton from './components/MapSkeleton'
import './styles/SearchBarMobileView.scss'
import BatchCards from './components/BatchCards'
import DiscoveryFilters from './components/DiscoveryFilters'
import Navbar from './components/Navbar'
import { people } from './data/people'
import { pageNames } from './util/pageNames'
import { getCountryOptions } from './util/countryFilters'
import { getRoleOptions } from './util/roleFilters'
import { SENIORITY_LEVELS } from './util/roles/roleTaxonomy.js'
import { LEVEL_NOT_STATED } from './util/filterPeople'
import { contactSignals, ContactSignal } from './util/contactLinks'
import { useDeveloperFilters } from './hooks/useDeveloperFilters'
import { useNow } from './hooks/useNow'
import { useShortlist } from './hooks/useShortlist'
import { personIdFromHash } from './util/shortlist'
import { selectedTimeZoneOffsetMinutes } from './util/timezone'
const SimpleMap = lazy(() => import('./components/Map'))

// Countries and roles are normalized during JSON aggregation
const countries = getCountryOptions(people)
const roles = getRoleOptions(people)

// Seniority stated in job titles, in SENIORITY_LEVELS order, plus "not stated"
const levels = [...SENIORITY_LEVELS, LEVEL_NOT_STATED]
    .map((value) => ({
        value,
        count: people.filter(
            (person) =>
                (person.normalized?.seniority ?? LEVEL_NOT_STATED) === value
        ).length,
    }))
    .filter(({ count }) => count > 0)

const signalLabels: { value: ContactSignal; label: string }[] = [
    { value: 'email', label: 'email' },
    { value: 'portfolio', label: 'portfolio site' },
    { value: 'linkedin', label: 'LinkedIn' },
]
const signals = signalLabels.map(({ value, label }) => ({
    value,
    label,
    count: people.filter((person) => contactSignals(person).includes(value))
        .length,
}))

const style: React.CSSProperties = {
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

function App() {
    const now = useNow()
    const developerFilters = useDeveloperFilters(people, now)
    const { filters, results } = developerFilters

    const shortlist = useShortlist()

    const [map, setMap] = useState(false)
    const [mapOrHomeTitle, setMapOrHomeTitle] = useState(pageNames.map) // pageNames.map is default
    const [focusId, setFocusId] = useState<string | null>(null)

    function showMap(show: boolean) {
        setMap(show)
        setMapOrHomeTitle(show ? pageNames.home : pageNames.map)
    }

    // Search and filters are kept when switching views so both show the same developers
    function goBack() {
        if (map) {
            // Leaving the map: drop the #person-<id> it put in the address bar
            try {
                window.history.replaceState(
                    null,
                    '',
                    window.location.pathname + window.location.search
                )
            } catch {
                // Ignore; the hash only affects the next reload
            }
        }
        showMap(!map)
    }

    // #person-<id> opens the map focused on that developer
    const { reset } = developerFilters
    useEffect(() => {
        const openFromHash = () => {
            const id = personIdFromHash(window.location.hash)
            if (!id || !people.some((person) => person.id === id)) return
            reset()
            setFocusId(id)
            showMap(true)
        }
        openFromHash()
        window.addEventListener('hashchange', openFromHash)
        return () => window.removeEventListener('hashchange', openFromHash)
    }, [reset])
    const handleFocus = useCallback(() => setFocusId(null), [])

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
        developerFilters.setSearch(event.target.value)

    const filterControls = (
        <>
            <div
                className="visible-on-mobileview-only surface-panel"
                style={style}
            >
                <Search
                    value={filters.search}
                    onSearchChange={onSearchChange}
                    responsiveSearch={responsiveSearch}
                />
            </div>

            <DiscoveryFilters
                developerFilters={developerFilters}
                countries={countries}
                roles={roles}
                levels={levels}
                signals={signals}
                total={people.length}
            />
        </>
    )

    return (
        <div className="flex flex-column min-vh-100 tc">
            <header className="app-bar custom--unselectable top-0 w-100 custom--shadow-4 z-9999">
                <Navbar
                    onLogoClick={goBack}
                    searchValue={filters.search}
                    onSearchChange={onSearchChange}
                    onMapClick={goBack}
                    mapOrHomeTitle={mapOrHomeTitle}
                    shufflePeopleOnClick={developerFilters.shuffle}
                />
            </header>
            <main className="flex-auto">
                {map ? (
                    <>
                        {filterControls}
                        <Suspense fallback={<MapSkeleton />}>
                            <SimpleMap
                                people={results}
                                allPeople={people}
                                recruiterOffset={
                                    selectedTimeZoneOffsetMinutes(
                                        filters.overlap.timeZone,
                                        now
                                    ) ?? 0
                                }
                                shortlist={shortlist}
                                focusId={focusId}
                                onFocusHandled={handleFocus}
                            />
                        </Suspense>
                    </>
                ) : (
                    <div id="sketch-particles">
                        {filterControls}
                        <BatchCards persons={results} numberPerBatch={16} />
                    </div>
                )}
            </main>
            <footer className="app-bar custom--unselectable w-100 h3 flex items-center justify-center z-2">
                <div className="flex items-center">
                    Copyright © {new Date().getFullYear()} by Zero to Mastery.
                    All Rights Reserved. &nbsp;&nbsp;
                    <a
                        href="https://github.com/zero-to-mastery/ZtM-Job-Board"
                        title="Repository"
                        aria-label="Visit ZtM Job Board repository on GitHub"
                        target="_blank"
                        style={{ color: 'inherit' }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                    </a>
                </div>
            </footer>
            <div className="custom--top-button">
                <button
                    type="button"
                    aria-label="Back to top"
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
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default App
