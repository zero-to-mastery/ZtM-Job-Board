import { createFilter } from 'react-search-input'
import Person from '../interfaces/person'
import { normalizeSkills } from './skills'
import { getPersonCountryCodes } from './countryFilters'

export type SortOption = 'default' | 'name-asc' | 'name-desc'

export interface ProfileCriteria {
    search: string
    countries: string[]
    jobTitles: string[]
    skills: string[]
    sort: SortOption
}

export const emptyCriteria: ProfileCriteria = {
    search: '',
    countries: [],
    jobTitles: [],
    skills: [],
    sort: 'default',
}

const searchKeys = [
    'name',
    'jobTitle',
    'location.city',
    'location.state',
    'location.country',
]

export function filterProfiles(
    people: readonly Person[],
    criteria: ProfileCriteria
): Person[] {
    const requiredSkills = normalizeSkills(criteria.skills).map((skill) =>
        skill.toLowerCase()
    )
    const matchesText = createFilter(criteria.search, searchKeys)
    const filtered = people.filter((person) => {
        const skills = new Set(
            normalizeSkills(person.skills).map((skill) => skill.toLowerCase())
        )
        return (
            matchesText(person) &&
            (criteria.countries.length === 0 ||
                getPersonCountryCodes(person).some((code) =>
                    criteria.countries.includes(code)
                )) &&
            (criteria.jobTitles.length === 0 ||
                criteria.jobTitles.includes(person.jobTitle || '')) &&
            requiredSkills.every((skill) => skills.has(skill))
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
