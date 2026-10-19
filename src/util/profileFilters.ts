import { createFilter } from 'react-search-input'
import { filterByCountries } from './countryFilters'
import { filterByRoles, getPersonRoleLabels } from './roleFilters'

// Fields matched by the free-text search. `roleLabels` holds the display
// labels of the profile's canonical roles, so "frontend" also finds a
// "React Developer"; the original fields are searched as before.
export const SEARCH_KEYS = [
    'name',
    'jobTitle',
    'location.city',
    'location.state',
    'location.country',
    'roleLabels',
]

export interface ProfileFilterOptions {
    search: string
    countries: string[]
    roles: string[]
    sort: string
}

interface FilterableProfile {
    name: string
    normalized?: { countries?: string[]; roles?: string[] }
}

const searchDocuments = new WeakMap<object, object>()
const toSearchDocument = (person: FilterableProfile) => {
    let document = searchDocuments.get(person)
    if (!document) {
        document = { ...person, roleLabels: getPersonRoleLabels(person) }
        searchDocuments.set(person, document)
    }
    return document
}

// Free-text search, then countries (any selected), then roles (any selected),
// then sorting. Country and role selections must both match.
export const filterProfiles = <T extends FilterableProfile>(
    people: T[],
    { search, countries, roles, sort }: ProfileFilterOptions
): T[] => {
    const matchesSearch = createFilter(search, SEARCH_KEYS)
    let filtered = people.filter((person) =>
        matchesSearch(toSearchDocument(person))
    )

    filtered = filterByCountries(filtered, countries)
    filtered = filterByRoles(filtered, roles)

    if (sort === 'name-asc') {
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    }

    if (sort === 'name-desc') {
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name))
    }

    return filtered
}
