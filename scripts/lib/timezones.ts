import type { City } from './geocode.ts'
import { US_STATE_TIMEZONES, usStateCode } from './usStates.ts'

export interface TimezoneInfo {
    name: string
    utcOffset: number
}

// The subset of countries-and-timezones used here
export interface TimezoneSource {
    getCountry(id: string): { timezones?: string[] } | null
    getTimezone(name: string): { name: string; utcOffset: number } | null
}

export interface TimezoneInput {
    countryCode: string | null
    lat?: number
    lng?: number
    state?: string
    adminCode?: string
}

// Accents are removed after NFKD so "São Paulo" compares equal to "Sao_Paulo"
const compact = (value: string): string =>
    value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z]/g, '')

// Squared equirectangular distance; good enough to rank nearby points
const distance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {
    const x = (lng2 - lng1) * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180))
    const y = lat2 - lat1
    return x * x + y * y
}

/**
 * Picks an IANA time zone for a developer.
 *
 * - Countries with one zone use it.
 * - US developers use their state (from the geocoded city or the `state` field).
 * - Otherwise the zone whose namesake city ("America/Toronto" -> Toronto)
 *   is nearest to the developer's coordinates.
 *
 * `utcOffset` is the zone's standard offset in minutes. The browser applies
 * daylight saving time at runtime from the zone name (see src/util/timezone.ts).
 */
export function createTimezoneResolver({
    timezones,
    cities,
}: {
    timezones: TimezoneSource
    cities: readonly City[]
}) {
    // Keyed by country and compacted name; the most populous city wins
    const largestByCountryAndName = new Map<string, City>()
    for (const city of cities) {
        const key = `${city.country}:${compact(city.name)}`
        const current = largestByCountryAndName.get(key)
        if (!current || city.population > current.population) {
            largestByCountryAndName.set(key, city)
        }
    }

    const zoneInfo = (name: string | undefined): TimezoneInfo | null => {
        if (!name) return null
        const zone = timezones.getTimezone(name)
        return zone ? { name: zone.name, utcOffset: zone.utcOffset } : null
    }

    const anchorsByCountry = new Map<
        string,
        { name: string; point: [number, number] | null }[]
    >()
    const anchorsFor = (countryCode: string) => {
        const cached = anchorsByCountry.get(countryCode)
        if (cached) return cached

        const country = timezones.getCountry(countryCode)
        const anchors = (country?.timezones ?? []).map((name) => {
            const place = name.split('/').pop() ?? name
            const city = largestByCountryAndName.get(
                `${countryCode}:${compact(place)}`
            )
            return {
                name,
                point: city
                    ? ([city.loc.coordinates[1], city.loc.coordinates[0]] as [
                          number,
                          number,
                      ])
                    : null,
            }
        })
        anchorsByCountry.set(countryCode, anchors)
        return anchors
    }

    return function resolveTimezone({
        countryCode,
        lat,
        lng,
        state,
        adminCode,
    }: TimezoneInput): TimezoneInfo | null {
        if (!countryCode) return null

        if (countryCode === 'US') {
            const stateCode = usStateCode(adminCode) ?? usStateCode(state)
            if (stateCode) return zoneInfo(US_STATE_TIMEZONES[stateCode])
        }

        const anchors = anchorsFor(countryCode)
        if (anchors.length === 0) return null
        if (anchors.length === 1 || lat === undefined || lng === undefined) {
            return zoneInfo(anchors[0].name)
        }

        const located = anchors.filter(
            (anchor): anchor is { name: string; point: [number, number] } =>
                anchor.point !== null
        )
        if (located.length === 0) return zoneInfo(anchors[0].name)

        const nearest = located.reduce((best, anchor) =>
            distance(lat, lng, ...anchor.point) <
            distance(lat, lng, ...best.point)
                ? anchor
                : best
        )
        return zoneInfo(nearest.name)
    }
}
