
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

    const dropdownStyle: React.CSSProperties = {
        position: 'absolute',
        top: 'calc(100% + 0.5rem)',
        left: 0,
        width: '100%',
        minWidth: '260px',
        boxSizing: 'border-box',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        padding: '0.75rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10,
    }

    const optionContainerStyle: React.CSSProperties = {
        maxHeight: '220px',
        overflowY: 'auto',
        marginTop: '0.5rem',
    }

    const filterButtonStyle: React.CSSProperties = {
        width: '100%',
        boxSizing: 'border-box',
        textAlign: 'left',
        minHeight: '40px',
    }

    const filterInputStyle: React.CSSProperties = {
        width: '100%',
        boxSizing: 'border-box',
    }

    return (
        <div
            className="br2 pa3 mb3"
            style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            }}
        >
            <div className="flex justify-between items-center mb3">
                <h2 className="f4 ma0">Filters &amp; Sort</h2>

                <button
                    type="button"
                    className="bg-transparent bn blue pointer"
                    onClick={onClear}
                >
                    Clear
                </button>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                    gap: '1rem',
                    alignItems: 'start',
                }}
            >
                <div className="relative">
                    <button
                        type="button"
                        className="w-100 pa2 ba b--black-20 br2 tl pointer dark-gray"
                        style={filterButtonStyle}
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
                        <div style={dropdownStyle}>
                            <input
                                type="text"
                                value={countrySearch}
                                onChange={(event) =>
                                    setCountrySearch(event.target.value)
                                }
                                placeholder="Search country..."
                                className="pa2 ba b--black-20 br2"
                                style={filterInputStyle}
                            />

                            <div style={optionContainerStyle}>
                                {filteredCountries.map((country) => (
                                    <label
                                        key={country}
                                        className="db pv2 pointer"
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

                                {filteredCountries.length === 0 && (
                                    <p className="f6 gray ma0">
                                        No countries found.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button
                        type="button"
                        className="w-100 pa2 ba b--black-20 br2 tl pointer dark-gray"
                        style={filterButtonStyle}
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
                        <div style={dropdownStyle}>
                            <input
                                type="text"
                                value={roleSearch}
                                onChange={(event) =>
                                    setRoleSearch(event.target.value)
                                }
                                placeholder="Search role..."
                                className="pa2 ba b--black-20 br2"
                                style={filterInputStyle}
                            />

                            <div style={optionContainerStyle}>
                                {filteredJobTitles.map((jobTitle) => (
                                    <label
                                        key={jobTitle}
                                        className="db pv2 pointer"
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

                                {filteredJobTitles.length === 0 && (
                                    <p className="f6 gray ma0">
                                        No roles found.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <select
                        value={sortOption}
                        onChange={(event) =>
                            onSortChange(event.target.value)
                        }
                        className="w-100 pa2 ba b--black-20 br2 bg-near-white dark-gray"
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            minHeight: '40px',
                        }}
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
