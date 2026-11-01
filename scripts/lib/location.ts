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

export interface LocationReport {
    total: number
    exact: { explicit: number; city: number }
    approximate: number
    unplaced: number
    timezone: number
    approximateCities: { city: string; country: string | null; count: number }[]
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

/**
 * Counts how each enriched profile was placed, for `aggregate-json --report`.
 * Every profile falls into exactly one of `explicit`, `city`, `approximate` or
 * `unplaced`, so those four always add up to `total`. `timezone` counts
 * profiles with a time zone and is independent of placement.
 * `approximateCities` lists the cities that only fell back to a state or
 * country center, most frequent first.
 *
 * @param {Person[]} persons profiles that have been through `addLocation`
 */
export function locationReport(persons: Person[]): LocationReport {
    const report: LocationReport = {
        total: persons.length,
        exact: { explicit: 0, city: 0 },
        approximate: 0,
        unplaced: 0,
        timezone: 0,
        approximateCities: [],
    }
    const fallbacks = new Map<
        string,
        { city: string; country: string | null; count: number }
    >()

    for (const person of persons) {
        const geo = person.normalized.geo
        if (person.normalized.timezone) report.timezone++

        if (!geo) {
            report.unplaced++
        } else if (geo.approximate) {
            report.approximate++
            const city = person.location?.city?.trim()
            if (city) {
                const country = person.normalized.countries?.[0] ?? null
                const key = `${country}:${city}`
                const entry = fallbacks.get(key) ?? { city, country, count: 0 }
                entry.count++
                fallbacks.set(key, entry)
            }
        } else if (person.location?.coordinates) {
            report.exact.explicit++
        } else {
            report.exact.city++
        }
    }

    report.approximateCities = [...fallbacks.values()].sort(
        (a, b) => b.count - a.count || a.city.localeCompare(b.city)
    )
    return report
}
