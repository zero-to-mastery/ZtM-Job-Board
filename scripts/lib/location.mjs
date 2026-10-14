import { createGeocoder } from './geocode.mjs'
import { createTimezoneResolver } from './timezones.mjs'

/**
 * Adds map coordinates and a time zone to profiles built by `buildPersons`.
 * The country comes from `normalized.countries` (see
 * docs/country-normalization.md); when several are listed, the first is used
 * as the developer's location.
 *
 * @param {object} data
 * @param {Array} data.cities all-the-cities
 * @param {object} data.timezones countries-and-timezones
 * @param {Array<{ ISO: string, latitude: string, longitude: string }>} data.countryCentroids src/assets/countries.json
 */
export function createLocationEnricher({
    cities,
    timezones,
    countryCentroids,
}) {
    const countryCenters = {}
    for (const { ISO, latitude, longitude } of countryCentroids) {
        // countries.json lists some codes more than once; the first entry is
        // the main territory
        if (!countryCenters[ISO]) {
            countryCenters[ISO] = [parseFloat(latitude), parseFloat(longitude)]
        }
    }

    const geocode = createGeocoder({ cities, countryCenters })
    const resolveTimezone = createTimezoneResolver({ timezones, cities })

    /**
     * @param {{ location?: { city?: string, state?: string, coordinates?: { lat: number, lng: number } }, normalized: { countries: string[] } }} person
     */
    return function addLocation(person) {
        const location = person.location ?? {}
        const countryCode = person.normalized?.countries?.[0] ?? null
        // Coordinates in the submission are exact; otherwise look up the city
        const place = location.coordinates
            ? {
                  lat: location.coordinates.lat,
                  lng: location.coordinates.lng,
                  approximate: false,
              }
            : geocode({
                  city: location.city,
                  state: location.state,
                  countryCode,
              })
        const timezone = resolveTimezone({
            countryCode,
            lat: place?.lat,
            lng: place?.lng,
            state: location.state,
            adminCode: place?.adminCode,
        })

        return {
            ...person,
            normalized: {
                ...person.normalized,
                geo: place
                    ? {
                          lat: place.lat,
                          lng: place.lng,
                          approximate: place.approximate,
                      }
                    : null,
                timezone,
            },
        }
    }
}

/**
 * Location coverage, for `aggregate-json.mjs --report`.
 *
 * @param {Array<{ location?: { city?: string }, normalized: { countries: string[], geo?: { approximate: boolean } | null, timezone?: object | null } }>} persons
 */
export function locationReport(persons) {
    const count = (predicate) => persons.filter(predicate).length
    const missedCities = {}
    for (const person of persons) {
        const city = person.location?.city?.trim()
        if (city && person.normalized.geo?.approximate) {
            const key = `${city} [${person.normalized.countries[0]}]`
            missedCities[key] = (missedCities[key] ?? 0) + 1
        }
    }
    return {
        total: persons.length,
        city: count((p) => p.normalized.geo && !p.normalized.geo.approximate),
        countryOnly: count((p) => p.normalized.geo?.approximate),
        none: count((p) => !p.normalized.geo),
        timezone: count((p) => p.normalized.timezone),
        missedCities: Object.entries(missedCities).sort((a, b) => b[1] - a[1]),
    }
}
