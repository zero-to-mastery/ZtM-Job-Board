import timezones from 'countries-and-timezones'
import { describe, expect, test } from 'vitest'
import type { City } from './geocode.ts'
import { createTimezoneResolver } from './timezones.ts'

const city = (
    name: string,
    country: string,
    lng: number,
    lat: number,
    population = 100,
    adminCode = ''
): City => ({
    cityId: 0,
    name,
    altName: '',
    country,
    adminCode,
    population,
    loc: { coordinates: [lng, lat] },
})

const cities: City[] = [
    city('São Paulo', 'BR', -46.63, -23.55, 1000),
    city('Sao Paulo', 'BR', -48.0, -22.0, 10),
    city('Curitiba', 'BR', -49.27, -25.43),
    city('Perth', 'AU', 115.86, -31.95),
    city('Sydney', 'AU', 151.21, -33.87),
    city('Toronto', 'CA', -79.38, 43.65),
    city('Edmonton', 'CA', -113.49, 53.55),
    city('Calgary', 'CA', -114.07, 51.05),
    city('Kolkata', 'IN', 88.36, 22.57),
]

const resolveTimezone = createTimezoneResolver({ timezones, cities })

describe('time zones', () => {
    test('matches accented namesake cities to IANA zone names', () => {
        expect(
            resolveTimezone({ countryCode: 'BR', lat: -23.55, lng: -46.63 })
        ).toEqual({ name: 'America/Sao_Paulo', utcOffset: -180 })
        expect(
            resolveTimezone({ countryCode: 'BR', lat: -25.43, lng: -49.27 })
        ).toEqual({ name: 'America/Sao_Paulo', utcOffset: -180 })
    })

    test('uses the only zone of a single-zone country', () => {
        expect(resolveTimezone({ countryCode: 'IN' })).toEqual({
            name: 'Asia/Kolkata',
            utcOffset: 330,
        })
    })

    test('uses the US state', () => {
        expect(
            resolveTimezone({ countryCode: 'US', adminCode: 'WA' })
        ).toMatchObject({ name: 'America/Los_Angeles', utcOffset: -480 })
        expect(
            resolveTimezone({ countryCode: 'US', state: 'Georgia' })
        ).toMatchObject({ name: 'America/New_York', utcOffset: -300 })
        expect(
            resolveTimezone({ countryCode: 'US', state: 'AZ' })
        ).toMatchObject({ name: 'America/Phoenix' })
    })

    test('uses the nearest zone city elsewhere', () => {
        // Perth and Sydney
        expect(
            resolveTimezone({ countryCode: 'AU', lat: -31.95, lng: 115.86 })
        ).toMatchObject({ name: 'Australia/Perth', utcOffset: 480 })
        expect(
            resolveTimezone({ countryCode: 'AU', lat: -33.87, lng: 151.21 })
        ).toMatchObject({ name: 'Australia/Sydney', utcOffset: 600 })
        // Calgary is closest to Edmonton
        expect(
            resolveTimezone({ countryCode: 'CA', lat: 51.05, lng: -114.07 })
        ).toMatchObject({ name: 'America/Edmonton' })
    })

    test('falls back to the first zone when no anchor city is located', () => {
        expect(
            resolveTimezone({ countryCode: 'CA', lat: 0, lng: 0 })
        ).toMatchObject({ name: 'America/Toronto' })
    })

    test('returns nothing without a country', () => {
        expect(resolveTimezone({ countryCode: null })).toBeNull()
    })
})
