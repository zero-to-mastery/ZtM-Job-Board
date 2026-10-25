import { describe, expect, test } from 'vitest'
import type Person from '../interfaces/person'
import { groupPeopleByCoordinates } from './groupPeopleByCoordinates'
const person = (
    id: string,
    lat?: number,
    lng?: number
): Person => ({
    id,
    name: `Developer ${id}`,
    location: {
        ...(lat !== undefined && lng !== undefined
            ? { coordinates: { lat, lng } }
            : {}),
    },
    links: {},
})
describe('groupPeopleByCoordinates', () => {
    test('groups profiles sharing the same coordinates', () => {
        const result = groupPeopleByCoordinates([
            person('a', 40.71, -74),
            person('b', 40.71, -74),
        ])
        expect(result).toHaveLength(1)
        expect(result[0].people.map((p) => p.id)).toEqual(['a', 'b'])
    })
    test('keeps profiles at different coordinates separate', () => {
        const result = groupPeopleByCoordinates([
            person('a', 40.71, -74),
            person('b', 51.5, -0.12),
        ])
        expect(result).toHaveLength(2)
    })
    test('ignores profiles without coordinates', () => {
        expect(
            groupPeopleByCoordinates([
                person('a'),
                person('b', 40.71, -74),
            ]).map((group) => group.people.map((p) => p.id))
        ).toEqual([['b']])
    })
})
