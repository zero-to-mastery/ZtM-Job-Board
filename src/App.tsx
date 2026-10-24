import React, { useState, useMemo, lazy, Suspense } from 'react'
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
import {
    emptyCriteria,
    filterProfiles,
    ProfileCriteria,
} from './util/filterProfiles'
import { normalizeSkills } from './util/skills'
import './styles/DeveloperDiscovery.scss'
import CountUp from 'react-countup'
import { countriesWithNumOfDevsObj } from './util/UsersDataCleanup'
const SimpleMap = lazy(() => import('./components/Map'))

const profiles: Person[] = persons
const totalCountries = Object.keys(countriesWithNumOfDevsObj).length
const countries = Array.from(
    new Set(
        profiles
            .map((person) => person.location.country)
            .filter((country): country is string => Boolean(country))
    )
).sort()

const jobTitles = Array.from(
    new Set(
        profiles
            .map((person) => person.jobTitle)
            .filter((title): title is string => Boolean(title))
    )
).sort()
const skills = normalizeSkills(
    profiles.flatMap((person) => person.skills || [])
).sort((a, b) => a.localeCompare(b))

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
function toggleSelection(current: string[], value: string) {
    return current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
}

function App() {
    const [criteria, setCriteria] = useState<ProfileCriteria>(emptyCriteria)
    const [filterResetKey, setFilterResetKey] = useState(0)
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

    function onSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        const search = event.target.value
        setCriteria((current) => ({ ...current, search }))
    }

    function clearFilters() {
        setCriteria(emptyCriteria)
        setFilterResetKey((current) => current + 1)
    }

    function goBack() {
        setMap(!map)
        setMapOrHomeTitle(map ? pageNames.map : pageNames.home)
        setCriteria((current) => ({ ...current, search: '' }))
    }

    function shufflePeopleOnClick() {
        const shuffledPeople = [...people]
        shuffle(shuffledPeople)
        setPeople(shuffledPeople)
    }

    return (
        <div className="flex flex-column min-vh-100 tc">
            <header className="custom--unselectable top-0 w-100 white custom--bg-additional3 custom--shadow-4 z-9999">
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
                    <div id="sketch-particles">
                        <div
                            className="visible-on-mobileview-only"
                            style={style}
                        >
                            <Search
                                onSearchChange={onSearchChange}
                                value={criteria.search}
                                responsiveSearch={responsiveSearch}
                            />
                        </div>
                        <ProfileFilters
                            resetKey={filterResetKey}
                            countries={countries}
                            selectedCountries={criteria.countries}
                            onCountryChange={(country) =>
                                setCriteria((current) => ({
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
                                setCriteria((current) => ({
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
                                setCriteria((current) => ({
                                    ...current,
                                    skills: toggleSelection(
                                        current.skills,
                                        skill
                                    ),
                                }))
                            }
                            sortOption={criteria.sort}
                            onSortChange={(sort) =>
                                setCriteria((current) => ({ ...current, sort }))
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
                        <BatchCards
                            key={JSON.stringify(criteria)}
                            persons={filteredPersons}
                            selectedSkills={criteria.skills}
                            numberPerBatch={16}
                            onClear={clearFilters}
                        />
                    </div>
                )}
            </main>
            <footer className="custom--unselectable w-100 h3 flex items-center justify-center white custom--bg-additional3 z-2">
                <div className="flex items-center">
                    Copyright © {new Date().getFullYear()} by Zero to Mastery.
                    All Rights Reserved. &nbsp;&nbsp;
                    <a
                        href="https://github.com/zero-to-mastery/ZtM-Job-Board"
                        title="Repository"
                        aria-label="Visit ZtM Job Board repository on GitHub"
                        target="_blank"
                        style={{ color: 'white' }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="white"
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
