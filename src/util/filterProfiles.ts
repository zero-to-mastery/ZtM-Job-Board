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

// Fields the text search matches. Skills, links and other fields are ignored.
const searchFields: ((person: Person) => string | undefined)[] = [
    (person) => person.name,
    (person) => person.jobTitle,
    (person) => person.location?.city,
    (person) => person.location?.state,
    (person) => person.location?.country,
]

// Every whitespace-separated term must appear, ignoring case, in at least one
// searched field. Terms are literal text, so "." and "c++" are not regexes.
const createTextFilter = (search: string) => {
    const terms = search
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term !== '')
    return (person: Person) =>
        terms.every((term) =>
            searchFields.some((field) =>
                (field(person) ?? '').toLowerCase().includes(term)
            )
        )
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
    criteria: ProfileCriteria
): Person[] {
    const requiredSkills = normalizeSkills(criteria.skills).map(skillKey)
    const matchesText = createTextFilter(criteria.search)
    const selectedTitles = new Set(criteria.jobTitles.map(jobTitleKey))
    const filtered = people.filter((person) => {
        const skills = new Set(normalizeSkills(person.skills).map(skillKey))
        return (
            matchesText(person) &&
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
