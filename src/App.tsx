import React, { useRef, useState, useMemo, lazy, Suspense } from 'react'
import Search from './components/Search'
import { shuffle } from './util/shuffle'
import MapSkeleton from './components/MapSkeleton'
import './styles/SearchBarMobileView.scss'
import BatchCards from './components/BatchCards'
import ProfileFilters from './components/ProfileFilters'
import Navbar from './components/Navbar'
import persons from './assets/persons.json'
import { pageNames } from './util/pageNames'
import Person from './interfaces/person'
import ProfileCompare from './components/ProfileCompare'
import {
    MAX_COMPARE_PROFILES,
    toggleProfileComparison,
} from './util/profileComparison'
import {
    emptyCriteria,
    filterProfiles,
    getJobTitleOptions,
    ProfileCriteria,
} from './util/filterProfiles'
import { normalizeSkills } from './util/skills'
import './styles/DeveloperDiscovery.scss'
import CountUp from 'react-countup'
import { getCountryOptions } from './util/personCountries'
const SimpleMap = lazy(() => import('./components/Map'))

const profiles: Person[] = persons
// Countries are normalized to ISO codes during JSON aggregation
const countries = getCountryOptions(profiles)
const totalCountries = countries.length

const jobTitles = getJobTitleOptions(profiles)
const skills = normalizeSkills(
    profiles.flatMap((person) => person.skills || [])
).sort((a, b) => a.localeCompare(b))

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
function toggleSelection(current: string[], value: string) {
    return current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
}

function App() {
    const profileFiltersRef = useRef<{ clearFilters: () => void } | null>(null)
    const [criteria, setCriteria] = useState<ProfileCriteria>(emptyCriteria)
    const [batch, setBatch] = useState(1)
    const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([])
    const [isCompareOpen, setIsCompareOpen] = useState(false)
    const [comparisonLimitMessage, setComparisonLimitMessage] = useState('')
    const [people, setPeople] = useState(() => {
        const initialPeople = [...profiles]
        shuffle(initialPeople)
        return initialPeople
    })

    const [map, setMap] = useState(false)
    const [mapOrHomeTitle, setMapOrHomeTitle] = useState(pageNames.map) // pageNames.map is default

    const filteredPersons = useMemo(
        () => filterProfiles(people, criteria),
        [people, criteria]
    )
    const selectedProfiles = useMemo(
    () =>
        selectedProfileIds
            .map((id) => profiles.find((person) => person.id === id))
            .filter((person): person is Person => person !== undefined),
    [selectedProfileIds]
)

function handleCompareToggle(profileId: string) {
    if (
        !selectedProfileIds.includes(profileId) &&
        selectedProfileIds.length >= MAX_COMPARE_PROFILES
    ) {
        setComparisonLimitMessage(
            `You can compare up to ${MAX_COMPARE_PROFILES} developers at a time.`
        )
        return
    }

    setComparisonLimitMessage('')
    setSelectedProfileIds((current) =>
        toggleProfileComparison(current, profileId)
    )
}

function clearComparison() {
    setSelectedProfileIds([])
    setComparisonLimitMessage('')
    setIsCompareOpen(false)
}

    // Any change to search, filters, or sort starts pagination over
    function updateCriteria(update: React.SetStateAction<ProfileCriteria>) {
        setCriteria(update)
        setBatch(1)
    }

    function onSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        const search = event.target.value
        updateCriteria((current) => ({ ...current, search }))
    }

    function clearFilters() {
        updateCriteria(emptyCriteria)
    }

    function goBack() {
        setMap(!map)
        setMapOrHomeTitle(map ? pageNames.map : pageNames.home)
        updateCriteria((current) => ({ ...current, search: '' }))
    }

    function shufflePeopleOnClick() {
        const shuffledPeople = [...people]
        shuffle(shuffledPeople)
        setPeople(shuffledPeople)
    }

    return (
        <div className="flex flex-column min-vh-100 tc">
            <header className="app-bar custom--unselectable top-0 w-100 custom--shadow-4 z-9999">
                <Navbar
                    onLogoClick={goBack}
                    onSearchChange={onSearchChange}
                    searchValue={criteria.search}
                    onMapClick={goBack}
                    mapOrHomeTitle={mapOrHomeTitle}
                    shufflePeopleOnClick={shufflePeopleOnClick}
                />
            </header>
            <main className="flex-auto">
                {map ? (
                    <Suspense fallback={<MapSkeleton />}>
                        <SimpleMap />
                    </Suspense>
                ) : (
                    <>
                        <div
                            className="visible-on-mobileview-only surface-panel"
                            style={style}
                        >
                            <Search
                                onSearchChange={onSearchChange}
                                value={criteria.search}
                                responsiveSearch={responsiveSearch}
                            />
                        </div>
                        <ProfileFilters
                            ref={profileFiltersRef}
                            countries={countries}
                            selectedCountries={criteria.countries}
                            onCountryChange={(country) =>
                                updateCriteria((current) => ({
                                    ...current,
                                    countries: toggleSelection(
                                        current.countries,
                                        country
                                    ),
                                }))
                            }
                            jobTitles={jobTitles}
                            selectedJobTitles={criteria.jobTitles}
                            onJobTitleChange={(jobTitle) =>
                                updateCriteria((current) => ({
                                    ...current,
                                    jobTitles: toggleSelection(
                                        current.jobTitles,
                                        jobTitle
                                    ),
                                }))
                            }
                            skills={skills}
                            selectedSkills={criteria.skills}
                            onSkillChange={(skill) =>
                                updateCriteria((current) => ({
                                    ...current,
                                    skills: toggleSelection(
                                        current.skills,
                                        skill
                                    ),
                                }))
                            }
                            sortOption={criteria.sort}
                            onSortChange={(sort) =>
                                updateCriteria((current) => ({
                                    ...current,
                                    sort,
                                }))
                            }
                            onClear={clearFilters}
                        />
                        <p
                            className="developer-results__count"
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {filteredPersons.length} matching{' '}
                            {filteredPersons.length === 1
                                ? 'developer'
                                : 'developers'}
                        </p>
                        <dl className="developer-results__stats">
                            <div>
                                <dt>Total Profiles</dt>
                                <dd>
                                    <CountUp end={profiles.length} delay={1} />
                                </dd>
                            </div>
                            <div>
                                <dt>Total Countries</dt>
                                <dd>
                                    <CountUp end={totalCountries} delay={1} />
                                </dd>
                            </div>
                        </dl>
                        <div className="profile-compare-entry">
    <div>
        <strong>
            {selectedProfileIds.length} of {MAX_COMPARE_PROFILES} developers
            selected
        </strong>

        {comparisonLimitMessage && (
            <p role="status">{comparisonLimitMessage}</p>
        )}
    </div>

    <div className="profile-compare-entry__actions">
        {selectedProfileIds.length > 0 && (
            <button type="button" onClick={clearComparison}>
                Clear selection
            </button>
        )}

        <button
            type="button"
            disabled={selectedProfileIds.length < 2}
            onClick={() => setIsCompareOpen(true)}
        >
            Compare developers
        </button>
    </div>
</div>

{isCompareOpen ? (
    <ProfileCompare
        persons={selectedProfiles}
        selectedSkills={criteria.skills}
        onClear={clearComparison}
        onBack={() => setIsCompareOpen(false)}
    />
) : (
    <BatchCards
        persons={filteredPersons}
        batch={batch}
        selectedSkills={criteria.skills}
        selectedProfileIds={selectedProfileIds}
        comparisonLimitReached={
            selectedProfileIds.length >= MAX_COMPARE_PROFILES
        }
        onCompareToggle={handleCompareToggle}
        onShowMore={() => setBatch((current) => current + 1)}
        onClear={() => profileFiltersRef.current?.clearFilters()}
    />
)}
                    </>
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
