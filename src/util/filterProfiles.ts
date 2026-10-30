import { createFilter } from 'react-search-input'
import Person from '../interfaces/person'
import { normalizeSkills, skillKey } from './skills'
import { matchesCountries } from './personCountries'

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
    const requiredSkills = normalizeSkills(criteria.skills).map(skillKey)
    const matchesText = createFilter(criteria.search, searchKeys)
    const filtered = people.filter((person) => {
        const skills = new Set(normalizeSkills(person.skills).map(skillKey))
        return (
            matchesText(person) &&
            matchesCountries(person, criteria.countries) &&
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
