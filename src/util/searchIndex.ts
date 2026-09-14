import persons from '../assets/persons.json'
import searchIndexData from '../assets/search-index.json'
import Person from '../interfaces/person'

const people: Person[] = persons as Person[]
const index: Record<string, string[]> = (searchIndexData || {}) as Record<
    string,
    string[]
>

function tokenize(text: string): string[] {
    if (!text) return []
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/gi, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 0)
}

/**
 * Filter persons list using the pre-built static inverted search index.
 */
export function filterPersons(query: string): Person[] {
    const trimmed = query ? query.trim() : ''
    if (!trimmed) {
        return people
    }

    const queryTokens = tokenize(trimmed)
    if (queryTokens.length === 0) {
        return people
    }

    const indexKeys = Object.keys(index)

    // For each query token, find all indexed tokens that start with or match the token (prefix search)
    const tokenMatchingIdsSets: Set<string>[] = queryTokens.map((qToken) => {
        const matchingIds = new Set<string>()
        for (const key of indexKeys) {
            if (key.startsWith(qToken) || key.includes(qToken)) {
                const ids = index[key]
                if (ids) {
                    for (const id of ids) {
                        matchingIds.add(id)
                    }
                }
            }
        }
        return matchingIds
    })

    // Intersection: persons must match ALL query tokens (AND search)
    let resultIds = tokenMatchingIdsSets[0] || new Set<string>()
    for (let i = 1; i < tokenMatchingIdsSets.length; i++) {
        const currentSet = tokenMatchingIdsSets[i]
        const intersected = new Set<string>()
        for (const id of resultIds) {
            if (currentSet.has(id)) {
                intersected.add(id)
            }
        }
        resultIds = intersected
    }

    // Fallback to Union (OR search) if AND search returned no results
    if (resultIds.size === 0) {
        const unionSet = new Set<string>()
        for (const set of tokenMatchingIdsSets) {
            for (const id of set) {
                unionSet.add(id)
            }
        }
        resultIds = unionSet
    }

    return people.filter((person) => resultIds.has(person.id))
}
