import Person from '../interfaces/person'

export interface BoundsBox {
    south: number
    west: number
    north: number
    east: number
}

/**
 * Whether a point is inside the visible map area.
 * Handles views that cross the antimeridian or show more than one world.
 */
export function isInBounds(lat: number, lng: number, bounds: BoundsBox) {
    if (lat < bounds.south || lat > bounds.north) return false
    if (bounds.east - bounds.west >= 360) return true
    const span = bounds.east - bounds.west
    const offset = (((lng - bounds.west) % 360) + 360) % 360
    return offset <= span
}

// Build-time location fields; see scripts/lib/location.mjs
export const personGeo = (person: Person) => person.normalized?.geo ?? null
export const personTimezone = (person: Person) =>
    person.normalized?.timezone ?? null

export const peopleInBounds = (people: Person[], bounds: BoundsBox | null) =>
    people.filter((person) => {
        const geo = personGeo(person)
        return (
            geo !== null &&
            (bounds === null || isInBounds(geo.lat, geo.lng, bounds))
        )
    })

const HTML_ESCAPES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}

// For text placed into Leaflet divIcon HTML strings
export const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])

/** An http(s) image URL that is safe inside CSS url(), or null. */
export function safeImageUrl(value?: string) {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    if (!/^https?:\/\//i.test(trimmed)) return null
    try {
        return new URL(trimmed).href.replace(
            /["'()\\\s]/g,
            (char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0')
        )
    } catch {
        return null
    }
}

// "Ada Lovelace" -> "AL"
export const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]!.toUpperCase())
        .join('') || '?'

export const formatLocation = (person: Person) =>
    [person.location.city, person.location.state, person.location.country]
        .filter((info) => info && info.trim() !== '')
        .join(', ')
