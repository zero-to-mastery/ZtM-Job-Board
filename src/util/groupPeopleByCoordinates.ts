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
    return Array.from(groups.values())
}
