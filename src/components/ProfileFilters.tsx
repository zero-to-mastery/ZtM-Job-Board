import React, { useEffect, useRef, useState } from 'react'
import { SortOption } from '../util/filterProfiles'

interface ProfileFiltersProps {
    resetKey?: number
    countries: string[]
    selectedCountries: string[]
    onCountryChange: (country: string) => void
    jobTitles: string[]
    selectedJobTitles: string[]
    onJobTitleChange: (jobTitle: string) => void
    skills: string[]
    selectedSkills: string[]
    onSkillChange: (skill: string) => void
    sortOption: SortOption
    onSortChange: (sortOption: SortOption) => void
    onClear: () => void
}

const ProfileFilters = ({
    resetKey = 0,
    countries,
    selectedCountries,
    onCountryChange,
    jobTitles,
    selectedJobTitles,
    onJobTitleChange,
    skills,
    selectedSkills,
    onSkillChange,
    sortOption,
    onSortChange,
    onClear,
}: ProfileFiltersProps) => {
    const [openFilter, setOpenFilter] = useState('')
    const [countrySearch, setCountrySearch] = useState('')
    const [roleSearch, setRoleSearch] = useState('')
    const [skillSearch, setSkillSearch] = useState('')
    const filterContainer = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setCountrySearch('')
        setRoleSearch('')
        setSkillSearch('')
        setOpenFilter('')
    }, [resetKey])

    useEffect(() => {
        if (!openFilter) {
            return
        }
        const activeContainer = filterContainer.current?.querySelector(
            `[data-filter="${openFilter}"]`
        )
        activeContainer?.querySelector('input')?.focus()
        function closeOutside(event: PointerEvent) {
            if (
                event.target instanceof Node &&
                !activeContainer?.contains(event.target)
            ) {
                setOpenFilter('')
            }
        }
        document.addEventListener('pointerdown', closeOutside)
        return () => document.removeEventListener('pointerdown', closeOutside)
    }, [openFilter])

    const filteredCountries = countries.filter((country) =>
        country.toLowerCase().includes(countrySearch.toLowerCase())
    )

    const filteredJobTitles = jobTitles.filter((jobTitle) =>
        jobTitle.toLowerCase().includes(roleSearch.toLowerCase())
    )
    const filteredSkills = skills.filter((skill) =>
        skill.toLowerCase().includes(skillSearch.trim().toLowerCase())
    )

    return (
        <div
            ref={filterContainer}
            className="profile-filters br2 pa3 mb3 tl"
            onKeyDown={(event) => {
                if (event.key === 'Escape' && openFilter) {
                    event.stopPropagation()
                    const trigger =
                        filterContainer.current?.querySelector<HTMLButtonElement>(
                            `[data-filter="${openFilter}"] button`
                        )
                    setOpenFilter('')
                    trigger?.focus()
                }
            }}
            onBlur={(event) => {
                const activeContainer = filterContainer.current?.querySelector(
                    `[data-filter="${openFilter}"]`
                )
                if (
                    event.relatedTarget &&
                    activeContainer?.contains(event.target) &&
                    !activeContainer.contains(event.relatedTarget)
                ) {
                    setOpenFilter('')
                }
            }}
        >
            <div className="flex justify-between items-center mb3">
                <h2 className="f4 ma0">Filters & Sort</h2>

                <button
                    type="button"
                    className="profile-filters__clear"
                    onClick={() => {
                        setCountrySearch('')
                        setRoleSearch('')
                        setSkillSearch('')
                        setOpenFilter('')
                        onClear()
                    }}
                >
                    Clear filters
                </button>
            </div>

            <div
                className="flex flex-wrap items-center"
                style={{ gap: '1rem' }}
            >
                <div
                    className="relative"
                    style={{ flex: '1 1 260px', minWidth: 0 }}
                    data-filter="skills"
                >
                    {skills.length === 0 ? (
                        <div className="skills-guidance">
                            <h3 className="f5 mt0 mb2">Required skills</h3>
                            <p className="ma0">
                                No profiles have declared skills yet. Developers
                                can add a skills list to their submission to
                                appear in skills-based searches.
                            </p>
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="profile-filters__control w-100 pa2 br2 tl"
                                aria-expanded={openFilter === 'skills'}
                                aria-controls="required-skills-options"
                                aria-describedby="required-skills-help"
                                onClick={() =>
                                    setOpenFilter(
                                        openFilter === 'skills' ? '' : 'skills'
                                    )
                                }
                            >
                                Required skills
                                {selectedSkills.length > 0 &&
                                    ` (${selectedSkills.length})`}
                            </button>
                            <p id="required-skills-help" className="f6 mt2 mb0">
                                Matches all selected skills. Skills are
                                self-reported.
                            </p>
                            {openFilter === 'skills' && (
                                <div
                                    id="required-skills-options"
                                    className="profile-filters__dropdown"
                                >
                                    <label
                                        htmlFor="skill-search"
                                        className="db mb2"
                                    >
                                        Search declared skills
                                    </label>
                                    <input
                                        id="skill-search"
                                        type="search"
                                        value={skillSearch}
                                        onChange={(event) =>
                                            setSkillSearch(event.target.value)
                                        }
                                        className="profile-filters__control w-100 pa2 br2"
                                    />
                                    <div className="profile-filters__options">
                                        {filteredSkills.length === 0 && (
                                            <p role="status">
                                                No declared skills match this
                                                search.
                                            </p>
                                        )}
                                        {filteredSkills.map((skill) => (
                                            <label
                                                key={skill}
                                                className="profile-filters__option db pv2 ph1 pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSkills.includes(
                                                        skill
                                                    )}
                                                    onChange={() =>
                                                        onSkillChange(skill)
                                                    }
                                                />{' '}
                                                {skill}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div
                    className="relative"
                    style={{ flex: '1 1 220px' }}
                    data-filter="country"
                >
                    <button
                        type="button"
                        className="profile-filters__control w-100 pa2 br2 tl"
                        aria-expanded={openFilter === 'country'}
                        aria-controls="country-options"
                        onClick={() =>
                            setOpenFilter(
                                openFilter === 'country' ? '' : 'country'
                            )
                        }
                    >
                        Country
                        {selectedCountries.length > 0 &&
                            ` (${selectedCountries.length})`}
                    </button>

                    {openFilter === 'country' && (
                        <div
                            id="country-options"
                            className="profile-filters__dropdown"
                        >
                            <input
                                type="text"
                                aria-label="Search countries"
                                value={countrySearch}
                                onChange={(event) =>
                                    setCountrySearch(event.target.value)
                                }
                                placeholder="Search country..."
                                className="profile-filters__control w-100 pa2 br2"
                            />

                            <div className="profile-filters__options">
                                {filteredCountries.map((country) => (
                                    <label
                                        key={country}
                                        className="profile-filters__option db pv2 ph1 pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCountries.includes(
                                                country
                                            )}
                                            onChange={() =>
                                                onCountryChange(country)
                                            }
                                        />{' '}
                                        {country}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="relative"
                    style={{ flex: '1 1 220px' }}
                    data-filter="role"
                >
                    <button
                        type="button"
                        className="profile-filters__control w-100 pa2 br2 tl"
                        aria-expanded={openFilter === 'role'}
                        aria-controls="role-options"
                        onClick={() =>
                            setOpenFilter(openFilter === 'role' ? '' : 'role')
                        }
                    >
                        Role
                        {selectedJobTitles.length > 0 &&
                            ` (${selectedJobTitles.length})`}
                    </button>

                    {openFilter === 'role' && (
                        <div
                            id="role-options"
                            className="profile-filters__dropdown"
                        >
                            <input
                                type="text"
                                aria-label="Search roles"
                                value={roleSearch}
                                onChange={(event) =>
                                    setRoleSearch(event.target.value)
                                }
                                placeholder="Search role..."
                                className="profile-filters__control w-100 pa2 br2"
                            />

                            <div className="profile-filters__options">
                                {filteredJobTitles.map((jobTitle) => (
                                    <label
                                        key={jobTitle}
                                        className="profile-filters__option db pv2 ph1 pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedJobTitles.includes(
                                                jobTitle
                                            )}
                                            onChange={() =>
                                                onJobTitleChange(jobTitle)
                                            }
                                        />{' '}
                                        {jobTitle}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ flex: '1 1 180px' }}>
                    <select
                        value={sortOption}
                        aria-label="Sort developers"
                        onChange={(event) => {
                            const value = event.target.value
                            if (
                                value === 'default' ||
                                value === 'name-asc' ||
                                value === 'name-desc'
                            ) {
                                onSortChange(value)
                            }
                        }}
                        className="profile-filters__control w-100 pa2 br2"
                    >
                        <option value="default">Sort by: Default</option>
                        <option value="name-asc">Name A–Z</option>
                        <option value="name-desc">Name Z–A</option>
                    </select>
                </div>
            </div>
            {selectedSkills.length > 0 && (
                <ul
                    className="skill-chips mt3"
                    aria-label="Selected required skills"
                >
                    {selectedSkills.map((skill) => (
                        <li key={skill}>
                            <button
                                type="button"
                                className="skill-chip skill-chip--selected"
                                aria-label={`Remove required skill ${skill}`}
                                onClick={() => onSkillChange(skill)}
                            >
                                {skill} <span aria-hidden="true">&times;</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default ProfileFilters
