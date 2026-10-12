import React, { useState } from 'react'

interface ProfileFiltersProps {
    countries: string[]
    selectedCountries: string[]
    onCountryChange: (country: string) => void
    jobTitles: string[]
    selectedJobTitles: string[]
    onJobTitleChange: (jobTitle: string) => void
    sortOption: string
    onSortChange: (sortOption: string) => void
    onClear: () => void
}

const ProfileFilters = ({
    countries,
    selectedCountries,
    onCountryChange,
    jobTitles,
    selectedJobTitles,
    onJobTitleChange,
    sortOption,
    onSortChange,
    onClear,
}: ProfileFiltersProps) => {
    const [openFilter, setOpenFilter] = useState('')
    const [countrySearch, setCountrySearch] = useState('')
    const [roleSearch, setRoleSearch] = useState('')

    const filteredCountries = countries.filter((country) =>
        country.toLowerCase().includes(countrySearch.toLowerCase())
    )

    const filteredJobTitles = jobTitles.filter((jobTitle) =>
        jobTitle.toLowerCase().includes(roleSearch.toLowerCase())
    )

    return (
        <div className="profile-filters br2 pa3 mb3">
            <div className="flex justify-between items-center mb3">
                <h2 className="f4 ma0">Filters & Sort</h2>

                <button
                    type="button"
                    className="profile-filters__clear"
                    onClick={onClear}
                >
                    Clear
                </button>
            </div>

            <div className="flex flex-wrap items-center" style={{ gap: '1rem' }}>
                <div
                    className="relative"
                    style={{ flex: '1 1 220px' }}
                >
                    <button
                        type="button"
                        className="profile-filters__control w-100 pa2 br2 tl"
                        aria-expanded={openFilter === 'country'}
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
                        <div className="profile-filters__dropdown">
                            <input
                                type="text"
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
                >
                    <button
                        type="button"
                        className="profile-filters__control w-100 pa2 br2 tl"
                        aria-expanded={openFilter === 'role'}
                        onClick={() =>
                            setOpenFilter(
                                openFilter === 'role' ? '' : 'role'
                            )
                        }
                    >
                        Role
                        {selectedJobTitles.length > 0 &&
                            ` (${selectedJobTitles.length})`}
                    </button>

                    {openFilter === 'role' && (
                        <div className="profile-filters__dropdown">
                            <input
                                type="text"
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
                        onChange={(event) =>
                            onSortChange(event.target.value)
                        }
                        className="profile-filters__control w-100 pa2 br2"
                        aria-label="Sort profiles"
                    >
                        <option value="default">Sort by: Default</option>
                        <option value="name-asc">Name A–Z</option>
                        <option value="name-desc">Name Z–A</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default ProfileFilters