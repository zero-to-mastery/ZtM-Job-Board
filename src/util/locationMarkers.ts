import type Person from '../interfaces/person'
import { getCountryMarkers, type CountryMarker } from './personCountries'

export interface CoordinateGroup {
    key: string
    lat: number
    lng: number
    people: Person[]
}

export interface InferredCoordinateGroup {
    key: string
    lat: number
    lng: number
    approximate: boolean
    people: Person[]
}

export interface LocationMarkers {
    countryMarkers: CountryMarker[]
    coordinateGroups: CoordinateGroup[]
    inferredGroups: InferredCoordinateGroup[]
}

// Single owner of the placement rule, in priority order: submitted
// `location.coordinates` gives an exact pin grouped by position; otherwise a
// valid `normalized.geo` gives a faded inferred pin grouped by position and
// approximation class; otherwise the person is counted toward their country's
// marker. A person is never counted in more than one of these.
export const buildLocationMarkers = (
    people: readonly Person[]
): LocationMarkers => {
    const pinned: { person: Person; lat: number; lng: number }[] = []
    const inferredGroups = new Map<string, InferredCoordinateGroup>()
    const peopleWithoutCoordinates: Person[] = []
    for (const person of people) {
        const coordinates = person.location?.coordinates
        const geo = person.normalized?.geo
        if (coordinates) {
            pinned.push({ person, ...coordinates })
        } else if (
            geo &&
            Number.isFinite(geo.lat) &&
            Number.isFinite(geo.lng)
        ) {
            const key = `${geo.lat},${geo.lng},${geo.approximate}`
            let group = inferredGroups.get(key)
            if (!group) {
                group = {
                    key,
                    lat: geo.lat,
                    lng: geo.lng,
                    approximate: geo.approximate,
                    people: [],
                }
                inferredGroups.set(key, group)
            }
            group.people.push(person)
        } else {
            peopleWithoutCoordinates.push(person)
        }
    }

    const countryMarkers = getCountryMarkers(peopleWithoutCoordinates)

    const groups = new Map<string, CoordinateGroup>()
    pinned.forEach(({ person, lat, lng }) => {
        const key = `${lat},${lng}`
        let group = groups.get(key)
        if (!group) {
            group = { key, lat, lng, people: [] }
            groups.set(key, group)
        }
        group.people.push(person)
    })

    return {
        countryMarkers,
        coordinateGroups: Array.from(groups.values()),
        inferredGroups: Array.from(inferredGroups.values()),
    }
}
