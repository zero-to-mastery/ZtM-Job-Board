/**
 * Builds a deterministic inverted index for developer profile search.
 * Only public search fields are indexed; email and profile links are excluded.
 */
interface SearchablePerson {
    id: string
    name?: string
    jobTitle?: string
    location?: {
        city?: string
        state?: string
        country?: string
    }
}

export function tokenizeSearchText(value: string): string[] {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean)
}

export function getSearchableTokens(person: SearchablePerson): Set<string> {
    const fields = [
        person.name,
        person.jobTitle,
        person.location?.city,
        person.location?.state,
        person.location?.country,
    ]

    return new Set(
        fields
            .filter((field): field is string => typeof field === 'string')
            .flatMap(tokenizeSearchText)
    )
}

export function buildSearchIndex(
    persons: readonly SearchablePerson[]
): Record<string, string[]> {
    const index: Record<string, Set<string>> = Object.create(null)

    for (const person of persons) {
        for (const token of getSearchableTokens(person)) {
            if (!index[token]) index[token] = new Set()
            index[token].add(person.id)
        }
    }
    return Object.fromEntries(
        Object.keys(index)
            .sort()
            .map((token) => [token, [...index[token]].sort()])
    )
}
