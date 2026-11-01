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

const withGeo = (
    id: string,
    geo: { lat: number; lng: number; approximate: boolean } | null,
    country?: string
): Person => ({
    id,
    name: `Developer ${id}`,
    location: country ? { country } : {},
    links: {},
    normalized: { countries: country ? [country] : [], geo },
})

describe('buildLocationMarkers with normalized geo fallback', () => {
    test('places a profile without coordinates at its normalized geo as an individual marker', () => {
        const result = buildLocationMarkers([
            withGeo('g', { lat: 6.45, lng: 3.39, approximate: true }, 'NG'),
        ])
        expect(result.approximateMarkers).toEqual([
            expect.objectContaining({
                person: expect.objectContaining({ id: 'g' }),
                lat: 6.45,
                lng: 3.39,
                approximate: true,
            }),
        ])
        expect(result.coordinateGroups).toEqual([])
        expect(result.countryMarkers).toEqual([])
    })

    test('keeps approximate false for a city-matched geo fallback', () => {
        const result = buildLocationMarkers([
            withGeo('g', { lat: 6.45, lng: 3.39, approximate: false }, 'NG'),
        ])
        expect(result.approximateMarkers).toEqual([
            expect.objectContaining({ approximate: false }),
        ])
    })

    test('submitted coordinates win over a differing normalized geo', () => {
        const pinned: Person = {
            id: 'p',
            name: 'Developer p',
            location: { country: 'NG', coordinates: { lat: 51.5, lng: -0.12 } },
            links: {},
            normalized: {
                countries: ['NG'],
                geo: { lat: 6.45, lng: 3.39, approximate: true },
            },
        }
        const result = buildLocationMarkers([pinned])
        expect(result.coordinateGroups).toEqual([
            expect.objectContaining({ lat: 51.5, lng: -0.12 }),
        ])
        expect(result.approximateMarkers).toEqual([])
        expect(result.countryMarkers).toEqual([])
    })

    test('keeps a profile with null geo in its country marker', () => {
        const result = buildLocationMarkers([withGeo('u', null, 'NG')])
        expect(result.approximateMarkers).toEqual([])
        expect(result.countryMarkers).toEqual([
            expect.objectContaining({ code: 'NG', numberOfDevs: 1 }),
        ])
    })

    test('treats non-finite geo coordinates as unplaced', () => {
        const result = buildLocationMarkers([
            withGeo('n', { lat: NaN, lng: 3.39, approximate: true }, 'NG'),
        ])
        expect(result.approximateMarkers).toEqual([])
        expect(result.countryMarkers).toEqual([
            expect.objectContaining({ code: 'NG', numberOfDevs: 1 }),
        ])
    })

    test('keeps fallback profiles at identical geo as separate markers', () => {
        const geo = { lat: 9.08, lng: 8.68, approximate: true }
        const result = buildLocationMarkers([
            withGeo('x', geo, 'NG'),
            withGeo('y', geo, 'NG'),
        ])
        expect(result.approximateMarkers.map((m) => m.person.id)).toEqual([
            'x',
            'y',
        ])
    })
})
