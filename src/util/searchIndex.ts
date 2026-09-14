import lunr from 'lunr'
import persons from '../assets/persons.json'
import searchIndexData from '../assets/search-index.json'
import Person from '../interfaces/person'

const people: Person[] = persons as Person[]

let searchIndex: lunr.Index | null = null

try {
    if (searchIndexData) {
        searchIndex = lunr.Index.load(searchIndexData as any)
    }
} catch (e) {
    console.error('Failed to load pre-built search index:', e)
}

/**
 * Filter persons list using the pre-built Lunr.js static search index.
 */
export function filterPersons(query: string): Person[] {
    const trimmedQuery = query ? query.trim() : ''
    if (!trimmedQuery) {
        return people
    }

    if (!searchIndex) {
        // Fallback filter if search index is unavailable
        const lower = trimmedQuery.toLowerCase()
        return people.filter(
            (p) =>
                p.name?.toLowerCase().includes(lower) ||
                p.jobTitle?.toLowerCase().includes(lower) ||
                p.location?.city?.toLowerCase().includes(lower) ||
                p.location?.state?.toLowerCase().includes(lower) ||
                p.location?.country?.toLowerCase().includes(lower)
        )
    }

    try {
        // Sanitize input terms for Lunr
        const terms = trimmedQuery
            .replace(/[^a-zA-Z0-9\s]/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean)

        if (terms.length === 0) {
            return people
        }

        // Search index requiring all terms with trailing wildcards
        let results = searchIndex.query((q) => {
            terms.forEach((term) => {
                q.term(term, {
                    presence: lunr.Query.presence.REQUIRED,
                    wildcard: lunr.Query.wildcard.TRAILING,
                })
            })
        })

        // Fallback to optional presence if strict AND returns no results
        if (results.length === 0) {
            results = searchIndex.query((q) => {
                terms.forEach((term) => {
                    q.term(term, {
                        wildcard: lunr.Query.wildcard.TRAILING,
                    })
                })
            })
        }

        const matchedIds = new Set(results.map((r) => r.ref))
        return people.filter((p) => matchedIds.has(p.id))
    } catch (e) {
        // Fallback search in case of any search query syntax errors
        const lower = trimmedQuery.toLowerCase()
        return people.filter(
            (p) =>
                p.name?.toLowerCase().includes(lower) ||
                p.jobTitle?.toLowerCase().includes(lower) ||
                p.location?.city?.toLowerCase().includes(lower) ||
                p.location?.state?.toLowerCase().includes(lower) ||
                p.location?.country?.toLowerCase().includes(lower)
        )
    }
}
