import React, { useEffect, useRef, useState } from 'react'
import { jobTitleKey, SortOption } from '../util/filterProfiles'
import { CountryOption } from '../util/personCountries'
import CheckboxDropdown from './CheckboxDropdown'

interface ProfileFiltersProps {
    openFilter?: string
    onOpenFilterChange?: (value: string) => void
    countrySearch?: string
    onCountrySearchChange?: (value: string) => void
    roleSearch?: string
    onRoleSearchChange?: (value: string) => void
    skillSearch?: string
    onSkillSearchChange?: (value: string) => void
    countries: CountryOption[]
    selectedCountries: string[]
    onCountryChange: (countryCode: string) => void
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
    openFilter: controlledOpenFilter,
    onOpenFilterChange,
    countrySearch: controlledCountrySearch,
    onCountrySearchChange,
    roleSearch: controlledRoleSearch,
    onRoleSearchChange,
    skillSearch: controlledSkillSearch,
    onSkillSearchChange,
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
    const [localOpenFilter, setLocalOpenFilter] = useState('')
    const [localCountrySearch, setLocalCountrySearch] = useState('')
    const [localRoleSearch, setLocalRoleSearch] = useState('')
    const [localSkillSearch, setLocalSkillSearch] = useState('')
    const openFilter = controlledOpenFilter ?? localOpenFilter
    const setOpenFilter = onOpenFilterChange ?? setLocalOpenFilter
    const countrySearch = controlledCountrySearch ?? localCountrySearch
    const setCountrySearch = onCountrySearchChange ?? setLocalCountrySearch
    const roleSearch = controlledRoleSearch ?? localRoleSearch
    const setRoleSearch = onRoleSearchChange ?? setLocalRoleSearch
    const skillSearch = controlledSkillSearch ?? localSkillSearch
    const setSkillSearch = onSkillSearchChange ?? setLocalSkillSearch
    const filterContainer = useRef<HTMLDivElement>(null)

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

    const searchKey = (value: string) =>
        value.trim().replace(/\s+/g, ' ').toLowerCase()

    const filteredCountries = countries.filter((country) =>
        searchKey(country.label).includes(searchKey(countrySearch))
    )

    const roleSearchKey = jobTitleKey(roleSearch)
    const filteredJobTitles = jobTitles.filter((jobTitle) =>
        jobTitleKey(jobTitle).includes(roleSearchKey)
    )

    const filteredSkills = skills.filter((skill) =>
        searchKey(skill).includes(searchKey(skillSearch))
    )

    const toggleFilter = (filter: string) => {
        setOpenFilter(openFilter === filter ? '' : filter)
    }

    const clearFilters = () => {
        setCountrySearch('')
        setRoleSearch('')
        setSkillSearch('')
        setOpenFilter('')
        onClear()
    }

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
                <h2 className="f4 ma0">Filters &amp; Sort</h2>

                <button
                    type="button"
                    className="profile-filters__clear"
                    onClick={clearFilters}
                >
                    Clear filters
                </button>
            </div>

            <div className="profile-filters__grid">
                <div className="relative" data-filter="skills">
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
                            <CheckboxDropdown
                                id="required-skills-options"
                                label="Required skills"
                                isOpen={openFilter === 'skills'}
                                selectedCount={selectedSkills.length}
                                options={filteredSkills.map((skill) => ({
                                    value: skill,
                                    label: skill,
                                }))}
                                selectedValues={selectedSkills}
                                searchValue={skillSearch}
                                onSearchChange={setSkillSearch}
                                onOptionChange={onSkillChange}
                                onToggle={() => toggleFilter('skills')}
                                searchLabel="Search declared skills"
                                helpText="Matches all selected skills. Skills are self-reported."
                                noResultsMessage="No declared skills match this search."
                            />
                        </>
                    )}
                </div>

                <div className="relative" data-filter="country">
                    <CheckboxDropdown
                        id="country-options"
                        label="Country"
                        isOpen={openFilter === 'country'}
                        selectedCount={selectedCountries.length}
                        options={filteredCountries.map((country) => ({
                            value: country.code,
                            label: country.label,
                        }))}
                        selectedValues={selectedCountries}
                        searchValue={countrySearch}
                        onSearchChange={setCountrySearch}
                        onOptionChange={onCountryChange}
                        onToggle={() => toggleFilter('country')}
                        searchLabel="Search countries"
                    />
                </div>

                <div className="relative" data-filter="role">
                    <CheckboxDropdown
                        id="role-options"
                        label="Role"
                        isOpen={openFilter === 'role'}
                        selectedCount={selectedJobTitles.length}
                        options={filteredJobTitles.map((jobTitle) => ({
                            value: jobTitle,
                            label: jobTitle,
                        }))}
                        selectedValues={selectedJobTitles}
                        searchValue={roleSearch}
                        onSearchChange={setRoleSearch}
                        onOptionChange={onJobTitleChange}
                        onToggle={() => toggleFilter('role')}
                        searchLabel="Search roles"
                        helpText="Roles are grouped into families. Use the main search for specific titles; unmatched titles are included in Other roles."
                    />
                </div>
                <div>
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
