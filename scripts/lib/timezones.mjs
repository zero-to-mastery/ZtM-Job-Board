import { US_STATE_TIMEZONES, usStateCode } from './usStates.mjs'

const compact = (value) => value.toLowerCase().replace(/[^a-z]/g, '')

// Squared equirectangular distance; good enough to rank nearby points
const distance = (lat1, lng1, lat2, lng2) => {
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
 * `utcOffset` is the zone's standard offset in minutes. The app uses the
 * zone name with Intl at runtime so daylight saving time is applied.
 *
 * @param {object} options
 * @param {{ getCountry: Function, getTimezone: Function }} options.timezones countries-and-timezones
 * @param {Array<{name: string, country: string, population: number, loc: {coordinates: [number, number]}}>} options.cities
 */
export function createTimezoneResolver({ timezones, cities }) {
    const largestByCountryAndName = new Map()
    for (const city of cities) {
        const key = `${city.country}:${compact(city.name)}`
        const current = largestByCountryAndName.get(key)
        if (!current || city.population > current.population) {
            largestByCountryAndName.set(key, city)
        }
    }

    const zoneInfo = (name) => {
        const zone = timezones.getTimezone(name)
        return zone ? { name: zone.name, utcOffset: zone.utcOffset } : null
    }

    const anchorsByCountry = new Map()
    const anchorsFor = (countryCode) => {
        if (anchorsByCountry.has(countryCode)) {
            return anchorsByCountry.get(countryCode)
        }
        const country = timezones.getCountry(countryCode)
        const anchors = (country?.timezones ?? []).map((name) => {
            const place = name.split('/').pop()
            const city = largestByCountryAndName.get(
                `${countryCode}:${compact(place)}`
            )
            return {
                name,
                point: city
                    ? [city.loc.coordinates[1], city.loc.coordinates[0]]
                    : null,
            }
        })
        anchorsByCountry.set(countryCode, anchors)
        return anchors
    }

    /**
     * @param {{ countryCode: string | null, lat?: number, lng?: number, state?: string, adminCode?: string }} input
     * @returns {{ name: string, utcOffset: number } | null}
     */
    return function resolveTimezone({
        countryCode,
        lat,
        lng,
        state,
        adminCode,
    }) {
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

        const located = anchors.filter((anchor) => anchor.point)
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
