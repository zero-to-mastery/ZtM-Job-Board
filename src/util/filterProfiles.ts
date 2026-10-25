import Person from '../interfaces/person'
import searchIndex from '../assets/search-index.json'
import { normalizeSkills } from './skills'
import { matchesCountries } from './personCountries'
import { buildSearchIndex } from '../../scripts/lib/search-index.mjs'

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

type SearchIndex = Record<string, string[]>

const index = searchIndex as SearchIndex

const peopleIndexCache = new WeakMap<
    readonly Person[],
    { source: SearchIndex; active: SearchIndex }
>()

const indexedIdsCache = new WeakMap<SearchIndex, Set<string>>()

function getSearchIndex(
    people: readonly Person[],
    sourceIndex: SearchIndex
): SearchIndex {
    const cached = peopleIndexCache.get(people)

    if (cached?.source === sourceIndex) {
        return cached.active
    }

    let indexedIds = indexedIdsCache.get(sourceIndex)

    if (!indexedIds) {
        indexedIds = new Set(Object.values(sourceIndex).flat())
        indexedIdsCache.set(sourceIndex, indexedIds)
    }

    const isCompatible = people.every((person) => indexedIds!.has(person.id))

    const activeIndex = isCompatible
        ? sourceIndex
        : buildSearchIndex([...people])

    peopleIndexCache.set(people, {
        source: sourceIndex,
        active: activeIndex,
    })

    return activeIndex
}

function normalizeToken(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
}

function findMatchingProfileIds(
    query: string,
    activeIndex: SearchIndex
): Set<string> | null {
    const tokens = normalizeToken(query)
        .split(/[^a-z0-9]+/)
        .filter(Boolean)

    if (tokens.length === 0) {
        return null
    }

    let matchingIds: Set<string> | null = null

    for (const token of tokens) {
        const ids = new Set<string>()

        for (const [indexedToken, profileIds] of Object.entries(activeIndex)) {
            if (indexedToken.includes(token)) {
                profileIds.forEach((id) => ids.add(id))
            }
        }

        if (ids.size === 0) {
            return new Set()
        }

        if (matchingIds === null) {
            matchingIds = ids
        } else {
            const currentIds: Set<string> = matchingIds
            matchingIds = new Set<string>(
                Array.from(currentIds).filter((id: string) => ids.has(id))
            )
        }

        if (matchingIds.size === 0) {
            return matchingIds
        }
    }

    return matchingIds
}

export function filterProfiles(
    people: readonly Person[],
    criteria: ProfileCriteria,
    searchIndex: SearchIndex = index
): Person[] {
    const requiredSkills = normalizeSkills(criteria.skills).map((skill) =>
        skill.toLowerCase()
    )

    const activeIndex = getSearchIndex(people, searchIndex)

    const matchingIds = criteria.search.trim()
        ? findMatchingProfileIds(criteria.search, activeIndex)
        : null

    const filtered = people.filter((person) => {
        const skills = new Set(
            normalizeSkills(person.skills).map((skill) => skill.toLowerCase())
        )

        return (
            (matchingIds === null || matchingIds.has(person.id)) &&
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
