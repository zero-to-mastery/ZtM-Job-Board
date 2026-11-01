import cities from 'all-the-cities'
import { describe, expect, test } from 'vitest'
import { getCountryCoordinates } from '../../src/util/countries/countryCoordinates.ts'
import {
    cityKeys,
    cleanPlaceText,
    createGeocoder,
    type City,
} from './geocode.ts'

const countryCenters: Record<string, [number, number]> = {
    US: [37.09, -95.71],
    XX: [0.5, 0.5],
}
const fixtureCountryCenter = (code: string) => countryCenters[code]

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

    test('transliterates dotless ı to i instead of undefined', () => {
        expect(cleanPlaceText('Kırklareli')).toBe('kirklareli')
        expect(cleanPlaceText('Diyarbakır')).toBe('diyarbakir')
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
    const geocode = createGeocoder({
        cities,
        countryCenter: getCountryCoordinates,
    })

    test('places a known city at its coordinates', () => {
        const place = geocode({ city: 'Lagos', countryCode: 'NG' })
        expect(place?.lat).toBeCloseTo(6.45, 1)
        expect(place?.lng).toBeCloseTo(3.39, 1)
        expect(place?.approximate).toBe(false)
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

    test('leaves input with no country unplaced', () => {
        expect(geocode({ city: 'Lagos', countryCode: null })).toBeNull()
        expect(geocode({ city: undefined, countryCode: null })).toBeNull()
    })

    test('leaves input in an unknown country unplaced', () => {
        expect(geocode({ city: 'Nowhereville', countryCode: 'ZZ' })).toBeNull()
        expect(geocode({ city: undefined, countryCode: 'ZZ' })).toBeNull()
    })

    test('falls back to the country center for an unmatched city', () => {
        const place = geocode({ city: 'Nowhereville', countryCode: 'NG' })
        const [lat, lng] = getCountryCoordinates('NG') ?? []
        expect(place?.approximate).toBe(true)
        expect(place?.lat).toBeCloseTo(lat ?? NaN, 2)
        expect(place?.lng).toBeCloseTo(lng ?? NaN, 2)
        expect(place?.adminCode).toBeUndefined()
    })
})

describe('indexed matching', () => {
    const geocode = createGeocoder({
        cities: fixture,
        countryCenter: fixtureCountryCenter,
    })

    test('matches an alternate name within the country', () => {
        expect(geocode({ city: 'Malaga', countryCode: 'ES' })).toEqual({
            lat: 36.72,
            lng: -4.42,
            approximate: false,
            adminCode: '29',
        })
    })

    test('does not match a city in another country', () => {
        expect(geocode({ city: 'Málaga', countryCode: 'US' })).toEqual({
            lat: 37.09,
            lng: -95.71,
            approximate: true,
        })
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
        expect(first).toEqual({
            lat: 1,
            lng: 1,
            approximate: false,
            adminCode: 'A',
        })
        expect(geocode({ city: 'Twin', countryCode: 'XX' })).toEqual(first)
    })
})

const regionFixture: City[] = [
    {
        cityId: 10,
        name: 'Alpha',
        altName: '',
        country: 'US',
        adminCode: 'IL',
        population: 100,
        loc: { coordinates: [0, 0] },
    },
    {
        cityId: 11,
        name: 'Beta',
        altName: '',
        country: 'US',
        adminCode: 'IL',
        population: 100,
        loc: { coordinates: [10, 0] },
    },
    {
        cityId: 12,
        name: 'Gamma',
        altName: '',
        country: 'US',
        adminCode: 'IL',
        population: 10,
        loc: { coordinates: [5, 1] },
    },
    {
        cityId: 20,
        name: 'Delta',
        altName: '',
        country: 'QQ',
        adminCode: '1',
        population: 500,
        loc: { coordinates: [7, 8] },
    },
    {
        cityId: 21,
        name: 'Epsilon',
        altName: '',
        country: 'QQ',
        adminCode: '2',
        population: 1,
        loc: { coordinates: [1, 2] },
    },
]

describe('approximate fallback', () => {
    const geocode = createGeocoder({
        cities: regionFixture,
        countryCenter: fixtureCountryCenter,
    })

    test('uses the city nearest the mean of the stated region', () => {
        expect(
            geocode({ city: 'Nowhere', state: 'Illinois', countryCode: 'US' })
        ).toEqual({ lat: 1, lng: 5, approximate: true, adminCode: 'IL' })
    })

    test('returns the same region center on repeated calls', () => {
        const first = geocode({
            city: 'Nowhere',
            state: 'IL',
            countryCode: 'US',
        })
        expect(
            geocode({ city: 'Elsewhere', state: 'IL', countryCode: 'US' })
        ).toEqual(first)
    })

    test('falls back to the country center when the state is unknown', () => {
        expect(
            geocode({ city: 'Nowhere', state: 'Ohio', countryCode: 'US' })
        ).toEqual({ lat: 37.09, lng: -95.71, approximate: true })
    })

    test('prefers the country center over the largest city', () => {
        expect(geocode({ city: 'Nowhere', countryCode: 'XX' })).toEqual({
            lat: 0.5,
            lng: 0.5,
            approximate: true,
        })
    })

    test('uses the largest city when the country has no center', () => {
        expect(geocode({ city: 'Nowhere', countryCode: 'QQ' })).toEqual({
            lat: 8,
            lng: 7,
            approximate: true,
        })
    })

    test('keeps a matched city exact even when a region is stated', () => {
        expect(
            geocode({ city: 'Alpha', state: 'Illinois', countryCode: 'US' })
        ).toEqual({ lat: 0, lng: 0, approximate: false, adminCode: 'IL' })
    })
})
