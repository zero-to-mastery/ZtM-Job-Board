import { createGeocoder, type City, type CountryCenter } from './geocode.ts'
import type { Person } from './aggregate.ts'
import {
    createTimezoneResolver,
    type TimezoneInfo,
    type TimezoneSource,
} from './timezones.ts'

export interface Geo {
    lat: number
    lng: number
    approximate: boolean
}

/**
 * Adds `normalized.geo` and `normalized.timezone` to profiles built by
 * `buildPersons`. Explicit submitted coordinates win and are never rewritten;
 * otherwise the city, state and first normalized country are geocoded offline.
 * `geo` is `null` when nothing can be placed. The time zone is resolved from
 * the country, US state or nearest zone city. The input person is not mutated.
 *
 * @param {{ cities: readonly City[], countryCenter: CountryCenter, timezones: TimezoneSource }} options
 */
export function createLocationEnricher({
    cities,
    countryCenter,
    timezones,
}: {
    cities: readonly City[]
    countryCenter: CountryCenter
    timezones: TimezoneSource
}) {
    const geocode = createGeocoder({ cities, countryCenter })
    const resolveTimezone = createTimezoneResolver({ timezones, cities })

    return function addLocation(person: Person): Person {
        const location = person.location ?? {}
        const countryCode: string | null =
            person.normalized?.countries?.[0] ?? null

        let geo: Geo | null
        let place: { lat: number; lng: number; adminCode?: string } | null
        if (location.coordinates) {
            geo = {
                lat: location.coordinates.lat,
                lng: location.coordinates.lng,
                approximate: false,
            }
            place = geo
        } else {
            const found = geocode({
                city: location.city,
                state: location.state,
                countryCode,
            })
            geo = found
                ? {
                      lat: found.lat,
                      lng: found.lng,
                      approximate: found.approximate,
                  }
                : null
            place = found
        }

        const timezone: TimezoneInfo | null = resolveTimezone({
            countryCode,
            lat: place?.lat,
            lng: place?.lng,
            state: location.state,
            adminCode: place?.adminCode,
        })

        return {
            ...person,
            normalized: { ...person.normalized, geo, timezone },
        }
    }
}
