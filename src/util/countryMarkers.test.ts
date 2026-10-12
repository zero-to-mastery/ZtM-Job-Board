import { describe, expect, test } from 'vitest'
import { buildCountryMarkers, countDevelopersByCountry } from './countryMarkers'
import { resolveCountry } from './countries/resolveCountry.js'
import { countriesWithLatLng } from './CountriesDataFilter'

const person = (country: string) => ({
    normalized: { countries: resolveCountry(country).countries },
})

describe('countDevelopersByCountry', () => {
    test('aliases are grouped under one country', () => {
        const people = [
            'USA',
            'US',
            'United States',
            'U.S.',
            'UNited States',
            'Brasil',
            'Brazil',
        ].map(person)
        expect(countDevelopersByCountry(people)).toEqual({ US: 5, BR: 2 })
    })

    test('a developer is counted once in each listed country', () => {
        const people = ['USA/Belgium', 'United Kingdom, UK'].map(person)
        expect(countDevelopersByCountry(people)).toEqual({
            US: 1,
            BE: 1,
            GB: 1,
        })
        expect(
            countDevelopersByCountry([
                { normalized: { countries: ['US', 'US'] } },
            ])
        ).toEqual({ US: 1 })
    })

    test('unresolved values are not counted', () => {
        const people = ['Georgia', 'Remote', 'Earth', ''].map(person)
        expect(countDevelopersByCountry([...people, {}])).toEqual({})
    })
})

describe('buildCountryMarkers', () => {
    test('uses coordinates from countries.json, matched by ISO code', () => {
        const markers = buildCountryMarkers(
            { US: 3, RU: 1 },
            countriesWithLatLng
        )
        expect(markers).toEqual([
            {
                code: 'RU',
                country: 'Russia',
                latlng: expect.any(Array),
                numberOfDevs: 1,
            },
            {
                code: 'US',
                country: 'United States',
                latlng: ['37.1', '-95.7'],
                numberOfDevs: 3,
            },
        ])
    })

    test('codes without coordinates do not produce markers', () => {
        // Hong Kong is a valid code but has no entry in countries.json
        expect(
            buildCountryMarkers({ HK: 2, XX: 1 }, countriesWithLatLng)
        ).toEqual([])
    })

    test('duplicate ISO entries in countries.json produce a single marker', () => {
        const markers = buildCountryMarkers({ BQ: 1 }, countriesWithLatLng)
        expect(markers).toHaveLength(1)
    })

    test('every marker has numeric coordinates', () => {
        const counts = Object.fromEntries(
            countriesWithLatLng.map((c: { iso: string }) => [c.iso, 1])
        )
        buildCountryMarkers(counts, countriesWithLatLng).forEach((marker) => {
            expect(marker.latlng).toHaveLength(2)
            marker.latlng.forEach((value) =>
                expect(Number.isFinite(Number(value))).toBe(true)
            )
        })
    })
})
