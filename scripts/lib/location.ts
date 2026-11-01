import { createGeocoder, type City, type CountryCenter } from './geocode.ts'
import type { Person } from './aggregate.ts'

export interface Geo {
    lat: number
    lng: number
    approximate: boolean
}

/**
 * Adds `normalized.geo` to profiles built by `buildPersons`. Explicit
 * submitted coordinates win and are never rewritten; otherwise the city,
 * state and first normalized country are geocoded offline. `geo` is `null`
 * when nothing can be placed. The input person is not mutated.
 *
 * @param {{ cities: readonly City[], countryCenter: CountryCenter }} options
 */
export function createLocationEnricher({
    cities,
    countryCenter,
}: {
    cities: readonly City[]
    countryCenter: CountryCenter
}) {
    const geocode = createGeocoder({ cities, countryCenter })

    return function addLocation(person: Person): Person {
        const location = person.location ?? {}
        const countryCode: string | null =
            person.normalized?.countries?.[0] ?? null

        let geo: Geo | null
        if (location.coordinates) {
            geo = {
                lat: location.coordinates.lat,
                lng: location.coordinates.lng,
                approximate: false,
            }
        } else {
            const place = geocode({
                city: location.city,
                state: location.state,
                countryCode,
            })
            geo = place
                ? {
                      lat: place.lat,
                      lng: place.lng,
                      approximate: place.approximate,
                  }
                : null
        }

        return {
            ...person,
            normalized: { ...person.normalized, geo },
        }
    }
}
