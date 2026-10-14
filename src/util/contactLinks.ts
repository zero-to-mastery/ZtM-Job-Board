import Person from '../interfaces/person'

export type ContactKind = 'email' | 'website' | 'github' | 'linkedin'

export interface ContactLink {
    kind: ContactKind
    href: string
}

const isBlank = (value?: string) =>
    typeof value !== 'string' || value.trim() === ''

/**
 * Makes a submitted URL safe to put in an href.
 * Adds https:// to bare domains and rejects other schemes (javascript:, data:).
 */
export function safeUrl(value?: string): string | null {
    if (isBlank(value)) return null
    const trimmed = (value as string).trim()
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
        ? trimmed
        : `https://${trimmed.replace(/^\/+/, '')}`
    try {
        const url = new URL(withScheme)
        return url.protocol === 'http:' || url.protocol === 'https:'
            ? url.href
            : null
    } catch {
        return null
    }
}

/**
 * The contact links shown on profile cards, map popups and list entries.
 * A link is left out when its value is missing, empty or not a usable URL.
 */
export function contactLinks(person: Pick<Person, 'email' | 'links'>) {
    const links: ContactLink[] = []
    if (!isBlank(person.email)) {
        links.push({
            kind: 'email',
            href: `mailto:${(person.email as string).trim()}`,
        })
    }
    const website = safeUrl(person.links?.website)
    if (website) links.push({ kind: 'website', href: website })
    const github = safeUrl(person.links?.github)
    if (github) links.push({ kind: 'github', href: github })
    const linkedin = safeUrl(person.links?.linkedin)
    if (linkedin) links.push({ kind: 'linkedin', href: linkedin })
    return links
}
