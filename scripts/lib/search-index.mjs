/**
 * Builds a deterministic inverted index for developer profile search.
 * Only public search fields are indexed; email and profile links are excluded.
 *
 * @param {Array<{
 *   id: string,
 *   name?: string,
 *   jobTitle?: string,
 *   location?: { city?: string, state?: string, country?: string }
 * }>} persons
 * @returns {Record<string, string[]>}
 */
export function buildSearchIndex(persons) {
    /** @type {Record<string, Set<string>>} */
    const index = Object.create(null)

    for (const person of persons) {
        const fields = [
            person.name,
            person.jobTitle,
            person.location?.city,
            person.location?.state,
            person.location?.country,
        ]
        const tokens = new Set(
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
        for (const token of tokens) {
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
