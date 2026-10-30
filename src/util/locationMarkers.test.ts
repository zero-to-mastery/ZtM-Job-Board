import { describe, expect, test } from 'vitest'
import type Person from '../interfaces/person'
import { buildLocationMarkers } from './locationMarkers'

const person = (
    id: string,
    opts: {
        lat?: number
        lng?: number
        country?: string
        countries?: string[]
    } = {}
): Person => ({
    id,
    name: `Developer ${id}`,
    location: {
        ...(opts.country ? { country: opts.country } : {}),
        ...(opts.lat !== undefined && opts.lng !== undefined
            ? { coordinates: { lat: opts.lat, lng: opts.lng } }
            : {}),
    },
    links: {},
    ...(opts.countries
        ? { normalized: { countries: opts.countries } }
        : opts.country
          ? { normalized: { countries: [opts.country] } }
          : {}),
})

describe('buildLocationMarkers', () => {
    test('groups profiles sharing the same coordinates', () => {
        const result = buildLocationMarkers([
            person('a', { lat: 40.71, lng: -74 }),
            person('b', { lat: 40.71, lng: -74 }),
        ])
        expect(result.coordinateGroups).toHaveLength(1)
        expect(result.coordinateGroups[0].people.map((p) => p.id)).toEqual([
            'a',
            'b',
        ])
    })

    test('keeps profiles at different coordinates separate', () => {
        const result = buildLocationMarkers([
            person('a', { lat: 40.71, lng: -74 }),
            person('b', { lat: 51.5, lng: -0.12 }),
        ])
        expect(result.coordinateGroups).toHaveLength(2)
    })

    test('excludes people with coordinates from their country marker', () => {
        const result = buildLocationMarkers([
            person('a', { lat: 40.71, lng: -74, country: 'US' }),
            person('b', { country: 'US' }),
        ])
        expect(result.coordinateGroups).toHaveLength(1)
        expect(result.countryMarkers).toEqual([
            expect.objectContaining({ code: 'US', numberOfDevs: 1 }),
        ])
    })

    test('excludes a multi-country pinned person from every country marker', () => {
        // Relies on getCountryMarkers only emitting markers for countries it
        // actually counted: the pinned person never reaches that side, so CA
        // must not appear even though it is listed in their countries.
        const result = buildLocationMarkers([
            person('pinned', {
                lat: 40.71,
                lng: -74,
                country: 'US',
                countries: ['US', 'CA'],
            }),
            person('us', { country: 'US' }),
        ])
        expect(result.coordinateGroups).toHaveLength(1)
        expect(result.countryMarkers).toEqual([
            expect.objectContaining({ code: 'US', numberOfDevs: 1 }),
        ])
        expect(result.countryMarkers.map((m) => m.code)).not.toContain('CA')
    })

    test('ignores profiles without coordinates when grouping', () => {
        const result = buildLocationMarkers([
            person('a'),
            person('b', { lat: 40.71, lng: -74 }),
        ])
        expect(
            result.coordinateGroups.map((g) => g.people.map((p) => p.id))
        ).toEqual([['b']])
    })
})
