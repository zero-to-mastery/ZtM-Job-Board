import React, { useId, useState } from 'react'
import '../styles/RecruiterFilters.scss'
import ProfileFilters from './ProfileFilters'
import RecruiterFilters, {
    LevelOption,
    levelLabel,
    SeniorityFilter,
    SignalOption,
} from './RecruiterFilters'
import { DeveloperFilters } from '../hooks/useDeveloperFilters'
import { CountryOption } from '../util/countryFilters'
import { RoleOption } from '../util/roleFilters'
import { OVERLAP_SORT } from '../util/filterPeople'

const COLLAPSED_KEY = 'discovery-filters-collapsed'

export const SORT_OPTIONS = [
    { value: 'default', label: 'Shuffled' },
    { value: OVERLAP_SORT, label: 'Most shared work hours' },
    { value: 'name-asc', label: 'Name A–Z' },
    { value: 'name-desc', label: 'Name Z–A' },
]

// Remembered per browser; phones start collapsed so results are visible
function initiallyCollapsed() {
    try {
        const stored = window.localStorage.getItem(COLLAPSED_KEY)
        if (stored !== null) return stored === 'true'
    } catch {
        // Storage can be blocked; fall back to the screen size
    }
    return window.matchMedia?.('(max-width: 680px)').matches ?? false
}

function rememberCollapsed(collapsed: boolean) {
    try {
        window.localStorage.setItem(COLLAPSED_KEY, String(collapsed))
    } catch {
        // Only a convenience
    }
}

interface ActiveFilter {
    key: string
    label: string
    onRemove: () => void
}

interface DiscoveryFiltersProps {
    developerFilters: DeveloperFilters
    countries: CountryOption[]
    roles: RoleOption[]
    levels: LevelOption[]
    signals: SignalOption[]
    total: number
}

// The filter panel shared by the card view and the map: a header that stays
// visible (result count, sort, active filters) and a collapsible body.
const DiscoveryFilters = ({
    developerFilters,
    countries,
    roles,
    levels,
    signals,
    total,
}: DiscoveryFiltersProps) => {
    const { filters, results } = developerFilters
    const [collapsed, setCollapsed] = useState(initiallyCollapsed)
    const bodyId = useId()

    const toggleCollapsed = () => {
        setCollapsed(!collapsed)
        rememberCollapsed(!collapsed)
    }

    const active: ActiveFilter[] = [
        ...filters.countries.map((code) => ({
            key: `country-${code}`,
            label: countries.find((c) => c.code === code)?.label ?? code,
            onRemove: () => developerFilters.toggleCountry(code),
        })),
        ...filters.roles.map((id) => ({
            key: `role-${id}`,
            label: roles.find((r) => r.id === id)?.label ?? id,
            onRemove: () => developerFilters.toggleRole(id),
        })),
        ...filters.levels.map((level) => ({
            key: `level-${level}`,
            label: `${levelLabel(level)} level`,
            onRemove: () => developerFilters.setLevel(''),
        })),
        ...(filters.overlap.minHours > 0
            ? [
                  {
                      key: 'overlap',
                      label: `${filters.overlap.minHours}h+ shared hours`,
                      onRemove: () =>
                          developerFilters.setOverlap({ minHours: 0 }),
                  },
              ]
            : []),
        ...filters.signals.map((signal) => ({
            key: `signal-${signal}`,
            label: `Has ${
                signals.find((s) => s.value === signal)?.label ?? signal
            }`,
            onRemove: () => developerFilters.toggleSignal(signal),
        })),
    ]
    // The search box stays visible in the header, so it is not counted or shown as a pill
    const filterCount = active.length
    const canClear =
        filterCount > 0 ||
        filters.sort !== 'default' ||
        filters.search.trim() !== ''

    return (
        <section
            className="discovery-filters"
            aria-label="Developer filters"
            data-collapsed={collapsed}
        >
            <div className="discovery-filters__header">
                <h2 className="discovery-filters__title">
                    <button
                        type="button"
                        className="discovery-filters__toggle"
                        aria-expanded={!collapsed}
                        aria-controls={bodyId}
                        onClick={toggleCollapsed}
                    >
                        <span
                            className="discovery-filters__toggle-icon"
                            aria-hidden="true"
                        />
                        Filters
                        {filterCount > 0 && (
                            <span className="discovery-filters__badge">
                                {filterCount}
                                <span className="sr-only"> active</span>
                            </span>
                        )}
                    </button>
                </h2>

                <label className="discovery-filters__search">
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search by name, role or location"
                        aria-label="Search developers by name, role or location"
                        value={filters.search}
                        onChange={(event) =>
                            developerFilters.setSearch(event.target.value)
                        }
                    />
                </label>

                <p className="discovery-filters__count" aria-live="polite">
                    <strong>{results.length}</strong>
                    {results.length === total
                        ? ` developer${total === 1 ? '' : 's'}`
                        : ` of ${total} developers`}
                </p>

                <div className="discovery-filters__actions">
                    <label className="discovery-filters__sort">
                        <span>Sort</span>
                        <select
                            aria-label="Sort profiles"
                            value={filters.sort}
                            onChange={(event) =>
                                developerFilters.setSort(event.target.value)
                            }
                        >
                            {SORT_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="button"
                        className="discovery-filters__clear"
                        onClick={developerFilters.clear}
                        disabled={!canClear}
                        aria-label="Clear search, filters and sorting"
                    >
                        Clear all
                    </button>
                </div>
            </div>

            <div
                className="discovery-filters__body"
                id={bodyId}
                hidden={collapsed}
            >
                <ProfileFilters
                    countries={countries}
                    selectedCountries={filters.countries}
                    onCountryChange={developerFilters.toggleCountry}
                    roles={roles}
                    selectedRoles={filters.roles}
                    onRoleChange={developerFilters.toggleRole}
                />
                <SeniorityFilter
                    levels={levels}
                    value={filters.levels[0] ?? ''}
                    onChange={developerFilters.setLevel}
                />
                <RecruiterFilters
                    signals={signals}
                    filters={filters}
                    onSignalChange={developerFilters.toggleSignal}
                    onOverlapChange={developerFilters.setOverlap}
                />
            </div>

            {active.length > 0 && (
                <ul
                    className="discovery-filters__active"
                    aria-label="Active filters"
                >
                    {active.map(({ key, label, onRemove }) => (
                        <li key={key}>
                            <button
                                type="button"
                                className="discovery-filters__pill"
                                onClick={onRemove}
                                aria-label={`Remove filter: ${label}`}
                            >
                                {label}
                                <span aria-hidden="true">×</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default DiscoveryFilters
