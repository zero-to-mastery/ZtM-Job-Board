import timezones from 'countries-and-timezones'
import { describe, expect, test } from 'vitest'
import type { Person } from './aggregate.ts'
import type { City } from './geocode.ts'
import { createLocationEnricher } from './location.ts'

const cities: City[] = [
    {
        cityId: 1,
        name: 'Springfield',
        altName: '',
        country: 'US',
        adminCode: 'IL',
        population: 100,
        loc: { coordinates: [-89.65, 39.8] },
    },
]

const countryCenter = (code: string): [number, number] | undefined =>
    code === 'US' ? [37.09, -95.71] : undefined

const addLocation = createLocationEnricher({
    cities,
    countryCenter,
    timezones,
})

const person = (
    location: Record<string, unknown>,
    countries: string[] = ['US']
): Person => ({
    id: 'abc',
    name: 'Test',
    location,
    normalized: { countries },
})

describe('createLocationEnricher', () => {
    test('explicit coordinates win over the city lookup and are not rewritten', () => {
        const input = person({
            city: 'Springfield',
            state: 'IL',
            coordinates: { lat: 40.12, lng: -80.34 },
        })

        const output = addLocation(input)

        expect(output.normalized.geo).toEqual({
            lat: 40.12,
            lng: -80.34,
            approximate: false,
        })
        expect(output.location.coordinates).toEqual({
            lat: 40.12,
            lng: -80.34,
        })
    })

    test('geocodes a known city without coordinates', () => {
        const output = addLocation(person({ city: 'Springfield', state: 'IL' }))

        expect(output.normalized.geo).toEqual({
            lat: 39.8,
            lng: -89.65,
            approximate: false,
        })
    })

    test('falls back to the country center and marks it approximate', () => {
        const output = addLocation(person({ city: 'Nowhere' }))

        expect(output.normalized.geo).toEqual({
            lat: 37.09,
            lng: -95.71,
            approximate: true,
        })
    })

    test('sets geo to an explicit null when nothing can be placed', () => {
        const output = addLocation(person({ city: 'Nowhere' }, ['XX']))

        expect(output.normalized).toHaveProperty('geo', null)
    })

    test('sets geo to null when there is no normalized country', () => {
        const output = addLocation(person({ city: 'Springfield' }, []))

        expect(output.normalized.geo).toBeNull()
    })

    test('does not mutate the input or change the id and countries', () => {
        const input = person({ city: 'Springfield', state: 'IL' })
        const snapshot = JSON.stringify(input)

        const output = addLocation(input)

        expect(JSON.stringify(input)).toBe(snapshot)
        expect(output.id).toBe('abc')
        expect(output.normalized.countries).toEqual(['US'])
        expect(output).not.toBe(input)
    })
})
