import type Person from '../interfaces/person'
export interface CoordinateGroup {
    key: string
    lat: number
    lng: number
    people: Person[]
}
export const groupPeopleByCoordinates = (
    people: readonly Person[]
): CoordinateGroup[] => {
    const groups = new Map<string, CoordinateGroup>()
    people.forEach((person) => {
        const coordinates = person.location?.coordinates
        if (!coordinates) return
        const key = `${coordinates.lat},${coordinates.lng}`
        const existing = groups.get(key)
        if (existing) {
            existing.people.push(person)
        } else {
            groups.set(key, {
                key,
                lat: coordinates.lat,
                lng: coordinates.lng,
                people: [person],
            })
        }
    })
    return Array.from(groups.values())
}
