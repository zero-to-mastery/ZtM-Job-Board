import { createFilter } from 'react-search-input'
import Person from '../interfaces/person'
import { normalizeSkills } from './skills'
import { filterByCountries } from './countryFilters'
import { filterByRoles, getPersonRoleLabels } from './roleFilters'

export type SortOption = 'default' | 'name-asc' | 'name-desc'

export interface ProfileCriteria {
    search: string
    countries: string[] // ISO 3166-1 alpha-2 codes
    roles: string[] // canonical role ids
    skills: string[]
    sort: SortOption
}

export const emptyCriteria: ProfileCriteria = {
    search: '',
    countries: [],
    roles: [],
    skills: [],
    sort: 'default',
}

const searchKeys = [
    'name',
    'jobTitle',
    'location.city',
    'location.state',
    'location.country',
    'roleLabels',
]

export function filterProfiles(
    people: readonly Person[],
    criteria: ProfileCriteria
): Person[] {
    const requiredSkills = normalizeSkills(criteria.skills).map((skill) =>
        skill.toLowerCase()
    )
    const matchesText = createFilter(criteria.search, searchKeys)
    const filtered = filterByRoles(
        filterByCountries([...people], criteria.countries),
        criteria.roles
    ).filter((person) => {
        const skills = new Set(
            normalizeSkills(person.skills).map((skill) => skill.toLowerCase())
        )
        return (
            matchesText({
                ...person,
                roleLabels: getPersonRoleLabels(person),
            }) && requiredSkills.every((skill) => skills.has(skill))
        )
    })

    if (criteria.sort !== 'default') {
        filtered.sort((a, b) =>
            criteria.sort === 'name-asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        )
    }
    return filtered
}
