import React, { useState } from 'react'
import { CountryOption } from '../util/countryFilters'
import { RoleOption } from '../util/roleFilters'

interface ProfileFiltersProps {
    countries: CountryOption[]
    selectedCountries: string[]
    onCountryChange: (countryCode: string) => void
    roles: RoleOption[]
    selectedRoles: string[]
    onRoleChange: (roleId: string) => void
    sortOption: string
    onSortChange: (sortOption: string) => void
    onClear: () => void
}

const ProfileFilters = ({
    countries,
    selectedCountries,
    onCountryChange,
    roles,
    selectedRoles,
    onRoleChange,
    sortOption,
    onSortChange,
    onClear,
}: ProfileFiltersProps) => {
    const [openFilter, setOpenFilter] = useState('')
    const [countrySearch, setCountrySearch] = useState('')
    const [roleSearch, setRoleSearch] = useState('')

    const filteredCountries = countries.filter((country) =>
        country.label.toLowerCase().includes(countrySearch.toLowerCase())
    )

    const filteredRoles = roles.filter((role) =>
        role.label.toLowerCase().includes(roleSearch.toLowerCase())
    )

    const dropdownStyle: React.CSSProperties = {
        position: 'absolute',
        top: 'calc(100% + 0.5rem)',
        left: 0,
        width: '100%',
        minWidth: '260px',
        background: 'var(--dm-surface)',
        border: '1px solid var(--dm-border)',
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

    return (
        <div
            className="br2 pa3 mb3"
            style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                color: 'var(--dm-text)',
            }}
        >
            <div className="flex justify-between items-center mb3">
                <h2 className="f4 ma0">Filters & Sort</h2>

                <button
                    type="button"
                    className="bg-transparent bn blue pointer"
                    onClick={onClear}
                >
                    Clear
                </button>
            </div>

            <div
                className="flex flex-wrap items-center"
                style={{ gap: '1rem' }}
            >
                <div className="relative" style={{ flex: '1 1 220px' }}>
                    <button
                        type="button"
                        className="w-100 pa2 ba b--black-20 br2 tl pointer dark-gray"
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
                                className="w-100 pa2 ba b--black-20 br2"
                            />

                            <div style={optionContainerStyle}>
                                {filteredCountries.map((country) => (
                                    <label
                                        key={country.code}
                                        className="db pv2 pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCountries.includes(
                                                country.code
                                            )}
                                            onChange={() =>
                                                onCountryChange(country.code)
                                            }
                                        />{' '}
                                        {country.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative" style={{ flex: '1 1 220px' }}>
                    <button
                        type="button"
                        className="w-100 pa2 ba b--black-20 br2 tl pointer dark-gray"
                        onClick={() =>
                            setOpenFilter(openFilter === 'role' ? '' : 'role')
                        }
                    >
                        Role
                        {selectedRoles.length > 0 &&
                            ` (${selectedRoles.length})`}
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
                                className="w-100 pa2 ba b--black-20 br2"
                            />

                            <div style={optionContainerStyle}>
                                {filteredRoles.map((role) => (
                                    <label
                                        key={role.id}
                                        className="db pv2 pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles.includes(
                                                role.id
                                            )}
                                            onChange={() =>
                                                onRoleChange(role.id)
                                            }
                                        />{' '}
                                        {role.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ flex: '1 1 180px' }}>
                    <select
                        value={sortOption}
                        onChange={(event) => onSortChange(event.target.value)}
                        className="w-100 pa2 ba b--black-20 br2 bg-near-white dark-gray"
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
