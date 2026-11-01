import cities from 'all-the-cities'
import { describe, expect, test } from 'vitest'
import {
    cityKeys,
    cleanPlaceText,
    createGeocoder,
    type City,
} from './geocode.ts'

const fixture: City[] = [
    {
        cityId: 1,
        name: 'Springfield',
        altName: '',
        country: 'US',
        adminCode: 'IL',
        population: 100,
        loc: { coordinates: [-89.65, 39.8] },
    },
    {
        cityId: 2,
        name: 'Springfield',
        altName: '',
        country: 'US',
        adminCode: 'MO',
        population: 200,
        loc: { coordinates: [-93.29, 37.21] },
    },
    {
        cityId: 3,
        name: 'Málaga',
        altName: 'Malaga',
        country: 'ES',
        adminCode: '29',
        population: 300,
        loc: { coordinates: [-4.42, 36.72] },
    },
    {
        cityId: 4,
        name: 'Twin',
        altName: '',
        country: 'XX',
        adminCode: 'A',
        population: 50,
        loc: { coordinates: [1, 1] },
    },
    {
        cityId: 5,
        name: 'Twin',
        altName: '',
        country: 'XX',
        adminCode: 'B',
        population: 50,
        loc: { coordinates: [2, 2] },
    },
]

describe('place text', () => {
    test('strips accents and parenthesised text', () => {
        expect(cleanPlaceText('São Paulo (Brazil)')).toBe('sao paulo')
        expect(cleanPlaceText('Łódź')).toBe('lodz')
    })

    test('maps aliases and drops a city/metro suffix', () => {
        expect(cityKeys('NYC')).toEqual(['newyorkcity'])
        expect(cityKeys('Greater Lagos, Nigeria')).toEqual([
            'greaterlagosnigeria',
            'lagosnigeria',
            'greaterlagos',
            'lagos',
            'nigeria',
        ])
        expect(cityKeys('Bangalore')).toEqual(['bengaluru'])
    })

    test('ignores inherited object keys', () => {
        expect(cityKeys('constructor')).toEqual(['constructor'])
    })
})

describe('city geocoding with the dataset', () => {
    const geocode = createGeocoder({ cities })

    test('places a known city at its coordinates', () => {
        const place = geocode({ city: 'Lagos', countryCode: 'NG' })
        expect(place?.lat).toBeCloseTo(6.45, 1)
        expect(place?.lng).toBeCloseTo(3.39, 1)
    })

    test('resolves aliases to the same place', () => {
        expect(geocode({ city: 'SF', countryCode: 'US' })).toEqual(
            geocode({ city: 'San Francisco', countryCode: 'US' })
        )
    })

    test('matches accented and unaccented names identically', () => {
        expect(geocode({ city: 'Zürich', countryCode: 'CH' })).toEqual(
            geocode({ city: 'Zurich', countryCode: 'CH' })
        )
    })

    test('leaves unmatched input unplaced', () => {
        expect(geocode({ city: 'Nowhereville', countryCode: 'NG' })).toBeNull()
        expect(geocode({ city: 'Lagos', countryCode: null })).toBeNull()
        expect(geocode({ city: undefined, countryCode: 'NG' })).toBeNull()
    })
})

describe('indexed matching', () => {
    const geocode = createGeocoder({ cities: fixture })

    test('matches an alternate name within the country', () => {
        expect(geocode({ city: 'Malaga', countryCode: 'ES' })).toEqual({
            lat: 36.72,
            lng: -4.42,
            adminCode: '29',
        })
    })

    test('does not match a city in another country', () => {
        expect(geocode({ city: 'Málaga', countryCode: 'US' })).toBeNull()
    })

    test('uses the stated state to pick between same-named cities', () => {
        expect(
            geocode({
                city: 'Springfield',
                state: 'Illinois',
                countryCode: 'US',
            })
        ).toMatchObject({ adminCode: 'IL' })
        expect(
            geocode({ city: 'Springfield', state: 'MO', countryCode: 'US' })
        ).toMatchObject({ adminCode: 'MO' })
    })

    test('falls back to the most populous match when the state is unknown', () => {
        expect(
            geocode({ city: 'Springfield', state: 'Ohio', countryCode: 'US' })
        ).toMatchObject({ adminCode: 'MO' })
    })

    test('breaks equal-population ties by lowest cityId', () => {
        const first = geocode({ city: 'Twin', countryCode: 'XX' })
        expect(first).toEqual({ lat: 1, lng: 1, adminCode: 'A' })
        expect(geocode({ city: 'Twin', countryCode: 'XX' })).toEqual(first)
    })
})
