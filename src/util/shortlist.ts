import Person from '../interfaces/person'
import { contactLinks } from './contactLinks'
import { formatLocation } from './mapGeometry'

export const SHORTLIST_STORAGE_KEY = 'ztm-job-board:shortlist'

/** Reads stored ids, ignoring anything that is not a list of strings. */
export function parseShortlist(raw: string | null): string[] {
    if (!raw) return []
    try {
        const value = JSON.parse(raw)
        return Array.isArray(value)
            ? value.filter((id): id is string => typeof id === 'string')
            : []
    } catch {
        return []
    }
}

const HASH_PREFIX = '#person-'

// "#person-ada-lovelace" -> "ada-lovelace"
export function personIdFromHash(hash: string) {
    if (!hash.startsWith(HASH_PREFIX)) return null
    try {
        const id = decodeURIComponent(hash.slice(HASH_PREFIX.length))
        return id || null
    } catch {
        return null
    }
}

export const personHash = (id: string) =>
    `${HASH_PREFIX}${encodeURIComponent(id)}`

/** A shareable link that opens the map on this developer. */
export const personUrl = (
    id: string,
    location: Pick<Location, 'origin' | 'pathname' | 'search'>
) => `${location.origin}${location.pathname}${location.search}${personHash(id)}`

// Quote every field and stop spreadsheet apps from running formulas
function csvField(value: string) {
    const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
    return `"${safe.replace(/"/g, '""')}"`
}

export const CSV_COLUMNS = [
    'Name',
    'Title',
    'Location',
    'Email',
    'Website',
    'GitHub',
    'LinkedIn',
    'Profile link',
]

export function shortlistCsv(
    people: Person[],
    location: Pick<Location, 'origin' | 'pathname' | 'search'>
) {
    const rows = people.map((person) => {
        const links = Object.fromEntries(
            contactLinks(person).map(({ kind, href }) => [kind, href])
        )
        return [
            person.name,
            person.jobTitle ?? '',
            formatLocation(person),
            links.email?.replace(/^mailto:/, '') ?? '',
            links.website ?? '',
            links.github ?? '',
            links.linkedin ?? '',
            personUrl(person.id, location),
        ]
    })
    return [CSV_COLUMNS, ...rows]
        .map((row) => row.map(csvField).join(','))
        .join('\r\n')
}
