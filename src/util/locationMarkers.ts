import type Person from '../interfaces/person'
import { getCountryMarkers, type CountryMarker } from './personCountries'

export interface CoordinateGroup {
    key: string
    lat: number
    lng: number
    people: Person[]
}

export interface LocationMarkers {
    countryMarkers: CountryMarker[]
    coordinateGroups: CoordinateGroup[]
}

// Single owner of the "has an exact pin" rule. A person with
// `location.coordinates` is grouped into a coordinate pin and excluded from
// country counts; everyone else is counted toward their country's marker.
export const buildLocationMarkers = (
    people: readonly Person[]
): LocationMarkers => {
    const pinned: { person: Person; lat: number; lng: number }[] = []
    const peopleWithoutCoordinates: Person[] = []
    for (const person of people) {
        const coordinates = person.location?.coordinates
        if (coordinates) {
            pinned.push({ person, ...coordinates })
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
    }
}
