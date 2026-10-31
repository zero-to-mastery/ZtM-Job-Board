import Person from '../interfaces/person'
import searchIndex from '../assets/search-index.json'
import { normalizeSkills, skillKey } from './skills'
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

const indexedTokensCache = new WeakMap<SearchIndex, Map<string, Set<string>>>()

function getIndexedTokens(sourceIndex: SearchIndex): Map<string, Set<string>> {
    const cached = indexedTokensCache.get(sourceIndex)

    if (cached) {
        return cached
    }

    const tokensById = new Map<string, Set<string>>()

    for (const [token, ids] of Object.entries(sourceIndex)) {
        for (const id of ids) {
            if (!tokensById.has(id)) {
                tokensById.set(id, new Set())
            }

            tokensById.get(id)!.add(token)
        }
    }

    indexedTokensCache.set(sourceIndex, tokensById)

    return tokensById
}

function getProfileTokens(person: Person): Set<string> {
    const fields = [
        person.name,
        person.jobTitle,
        person.location?.city,
        person.location?.state,
        person.location?.country,
    ]

    return new Set(
        fields
            .filter((field) => typeof field === 'string')
            .flatMap((field) =>
                field
                    .toLowerCase()
                    .normalize('NFKD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .split(/[^a-z0-9]+/)
                    .filter(Boolean)
            )
    )
}

function getSearchIndex(
    people: readonly Person[],
    sourceIndex: SearchIndex
): SearchIndex {
    const cached = peopleIndexCache.get(people)

    if (cached?.source === sourceIndex) {
        const indexedTokens = getIndexedTokens(cached.active)

        const isCacheValid = people.every((person) => {
            const expectedTokens = getProfileTokens(person)
            const actualTokens = indexedTokens.get(person.id)

            return (
                (actualTokens?.size ?? 0) === expectedTokens.size &&
                [...expectedTokens].every((token) => actualTokens?.has(token))
            )
        })

        if (isCacheValid) {
            return cached.active
        }
    }

    const indexedTokens = getIndexedTokens(sourceIndex)

    const isCompatible = people.every((person) => {
        const expectedTokens = getProfileTokens(person)
        const actualTokens = indexedTokens.get(person.id)

        return (
            (actualTokens?.size ?? 0) === expectedTokens.size &&
            [...expectedTokens].every((token) => actualTokens?.has(token))
        )
    })

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

const formatJobTitle = (title: string) =>
    title
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\bfronted\b/gi, 'Frontend')
        .replace(/\bfullstak\b/gi, 'Full Stack')
        .replace(/\bsof[te]ware\b/gi, 'Software')
        .replace(/\b(?:developper|devoloper)\b/gi, 'Developer')
        .replace(/\bfront[- ]?end\b/gi, 'Frontend')
        .replace(/\bback[- ]?end\b/gi, 'Backend')
        .replace(/\bfull[- ]?stack\b/gi, 'Full Stack')

export const jobTitleKey = (title: string) =>
    formatJobTitle(title).toLowerCase()

const roleFamilies: [string, RegExp][] = [
    [
        'Frontend Developer',
        /\bfrontend(?: [\w.+#-]+){0,3} (?:developer|engineer|dev)\b/,
    ],
    [
        'Backend Developer',
        /\bbackend(?: [\w.+#-]+){0,3} (?:developer|engineer|dev)\b/,
    ],
    [
        'Full Stack Developer',
        /\b(?:full stack|mern|mean|mevn)(?: [\w.+#-]+){0,3} (?:developer|engineer|dev)\b/,
    ],
    [
        'Mobile Developer',
        /\b(?:mobile|android|ios|react native|flutter)(?: app)? (?:developer|engineer)\b/,
    ],
    ['Game Developer', /\b(?:game|unity|unreal) (?:developer|engineer)\b/],
    ['Data Scientist', /\bdata scientist\b/],
    ['Data Analyst', /\bdata analyst\b/],
    ['Data Engineer', /\bdata engineer\b/],
    [
        'Machine Learning Engineer',
        /\b(?:machine learning|ml|ai|deep learning) (?:developer|engineer)\b/,
    ],
    [
        'DevOps Engineer',
        /\bdevops(?: (?:developer|engineer))?\b|\bsite reliability (?:developer|engineer)\b/,
    ],
    ['Cloud Engineer', /\bcloud (?:developer|engineer)\b/],
    [
        'Blockchain / Web3 Developer',
        /\b(?:blockchain|web3|smart contract) (?:developer|engineer)\b/,
    ],
    ['Solutions Architect', /\b(?:solutions?|cloud|software) architect\b/],
    ['Engineering Manager', /\b(?:engineering|development) manager\b/],
    ['Product Manager', /\bproduct manager\b/],
    ['Technical Writer', /\btechnical writer\b/],
    [
        'QA / Test Engineer',
        /\b(?:qa|test|testing|automation) engineer\b|\bsdet\b/,
    ],
    [
        'Security',
        /\b(?:cybersecurity|security engineer|security analyst|ethical hacker|penetration tester)\b/,
    ],
    ['Designer', /\b(?:ui|ux|web|product|graphic)(?:\s+(?:ui|ux))? designer\b/],
    [
        'Web Developer',
        /\b(?:web|wordpress|shopify)[ -](?:developer|engineer)\b/,
    ],
    [
        'Software Developer',
        /\b(?:software|application)[ -](?:developer|engineer)\b/,
    ],
]

function getRoleFamilies(title: string): string[] {
    const roles = new Set<string>()
    const parts = jobTitleKey(title).split(/\s*(?:[|;,/]|&|\band\b)\s*/i)
    const roleParts = parts.map((part) => {
        if (/\b(?:aspiring|enthusiast|student|candidate|wannabe)\b/.test(part))
            return ''
        return part.split(/\s(?:at|@)\s/)[0]
    })
    const jobWords = roleParts.map(
        (part) => /\b(developer|engineer|dev)\b$/.exec(part)?.[1]
    )
    const partMatches = roleParts.map((part) =>
        roleFamilies
            .filter(([, pattern]) => pattern.test(part))
            .map(([label]) => label)
    )

    for (const [index, part] of roleParts.entries()) {
        if (!part) continue
        let matches = partMatches[index]
        if (matches.length === 0) {
            let jobWord: string | undefined
            for (
                let distance = 0;
                jobWord === undefined && distance < roleParts.length;
                distance++
            ) {
                for (const candidate of [index - distance, index + distance]) {
                    if (candidate < 0 || candidate >= roleParts.length) continue
                    const word = jobWords[candidate]
                    if (word === undefined) continue
                    const start = Math.min(index, candidate) + 1
                    const end = Math.max(index, candidate)
                    const blocked = partMatches
                        .slice(start, end)
                        .some((labels) => labels.length > 0)
                    if (blocked) continue
                    jobWord = word
                    break
                }
            }
            if (jobWord) {
                matches = roleFamilies
                    .filter(([, pattern]) => pattern.test(`${part} ${jobWord}`))
                    .map(([label]) => label)
            }
        }
        for (const label of matches) roles.add(label)
    }
    return roles.size ? [...roles] : ['Other roles']
}

export function getJobTitleOptions(people: readonly Person[]): string[] {
    const titles = new Set(
        people.flatMap((person) => getRoleFamilies(person.jobTitle || ''))
    )
    return [...titles].sort(
        (a, b) =>
            Number(a === 'Other roles') - Number(b === 'Other roles') ||
            a.localeCompare(b)
    )
}

export function filterProfiles(
    people: readonly Person[],
    criteria: ProfileCriteria,
    searchIndex: SearchIndex = index
): Person[] {
    const requiredSkills = normalizeSkills(criteria.skills).map(skillKey)

    const activeIndex = getSearchIndex(people, searchIndex)

    const matchingIds = criteria.search.trim()
        ? findMatchingProfileIds(criteria.search, activeIndex)
        : null

    const selectedTitles = new Set(criteria.jobTitles.map(jobTitleKey))

    const filtered = people.filter((person) => {
        const skills = new Set(normalizeSkills(person.skills).map(skillKey))

        return (
            (matchingIds === null || matchingIds.has(person.id)) &&
            matchesCountries(person, criteria.countries) &&
            (selectedTitles.size === 0 ||
                getRoleFamilies(person.jobTitle || '').some((role) =>
                    selectedTitles.has(jobTitleKey(role))
                )) &&
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
