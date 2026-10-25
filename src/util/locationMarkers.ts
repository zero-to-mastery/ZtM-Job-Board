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
    const peopleWithCoordinates: Person[] = []
    const peopleWithoutCoordinates: Person[] = []
    for (const person of people) {
        if (person.location?.coordinates) {
            peopleWithCoordinates.push(person)
        } else {
            peopleWithoutCoordinates.push(person)
        }
    }

    const countryMarkers = getCountryMarkers(peopleWithoutCoordinates)

    const groups = new Map<string, CoordinateGroup>()
    peopleWithCoordinates.forEach((person) => {
        const coordinates = person.location?.coordinates
        if (!coordinates) return
        const key = `${coordinates.lat},${coordinates.lng}`
        let group = groups.get(key)
        if (!group) {
            group = {
                key,
                lat: coordinates.lat,
                lng: coordinates.lng,
                people: [],
            }
            groups.set(key, group)
        }
        group.people.push(person)
    })

    return {
        countryMarkers,
        coordinateGroups: Array.from(groups.values()),
    }
}
