import { createFilter } from 'react-search-input'
import Person from '../interfaces/person'
import { normalizeSkills } from './skills'
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

const formatJobTitle = (title: string) =>
    title
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\bfronted\b/gi, 'Frontend')
        .replace(/\bfullstak\b/gi, 'Full Stack')
        .replace(/\b(?:developper|devoloper)\b/gi, 'Developer')
        .replace(/\bfront[- ]?end\b/gi, 'Frontend')
        .replace(/\bback[- ]?end\b/gi, 'Backend')
        .replace(/\bfull[- ]?stack\b/gi, 'Full Stack')

export const jobTitleKey = (title: string) =>
    formatJobTitle(title).toLowerCase()

export function getJobTitleOptions(people: readonly Person[]): string[] {
    const titles = new Map<string, string>()
    for (const person of people) {
        const label = formatJobTitle(person.jobTitle || '')
        const key = label.toLowerCase()
        if (key && !titles.has(key)) titles.set(key, label)
    }
    return [...titles.values()].sort((a, b) => a.localeCompare(b))
}

export function filterProfiles(
    people: readonly Person[],
    criteria: ProfileCriteria
): Person[] {
    const requiredSkills = normalizeSkills(criteria.skills).map((skill) =>
        skill.toLowerCase()
    )
    const matchesText = createFilter(criteria.search, searchKeys)
    const selectedTitles = new Set(criteria.jobTitles.map(jobTitleKey))
    const filtered = people.filter((person) => {
        const skills = new Set(
            normalizeSkills(person.skills).map((skill) => skill.toLowerCase())
        )
        return (
            matchesText(person) &&
            matchesCountries(person, criteria.countries) &&
            (selectedTitles.size === 0 ||
                selectedTitles.has(jobTitleKey(person.jobTitle || ''))) &&
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
