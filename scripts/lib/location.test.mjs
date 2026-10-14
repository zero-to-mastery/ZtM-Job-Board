// @vitest-environment node
import fs from 'fs'
import path from 'path'
import cities from 'all-the-cities'
import timezones from 'countries-and-timezones'
import { describe, expect, test } from 'vitest'
import { buildPersons, loadSubmissions } from './aggregate.mjs'
import { cityKeys, createGeocoder } from './geocode.mjs'
import { createLocationEnricher, locationReport } from './location.mjs'
import { createTimezoneResolver } from './timezones.mjs'

const countryCentroids = JSON.parse(
    fs.readFileSync(path.resolve('src/assets/countries.json'), 'utf-8')
)
const countryCenters = Object.fromEntries(
    countryCentroids.map(({ ISO, latitude, longitude }) => [
        ISO,
        [parseFloat(latitude), parseFloat(longitude)],
    ])
)

describe('city geocoding', () => {
    const geocode = createGeocoder({ cities, countryCenters })

    test('places a known city at its coordinates', () => {
        const place = geocode({ city: 'Lagos', countryCode: 'NG' })
        expect(place).toMatchObject({ approximate: false })
        expect(place.lat).toBeCloseTo(6.45, 1)
        expect(place.lng).toBeCloseTo(3.39, 1)
    })

    test('matches accents, aliases and noisy city text', () => {
        expect(geocode({ city: 'São Paulo', countryCode: 'BR' })).toMatchObject(
            { approximate: false }
        )
        expect(geocode({ city: 'Bangalore', countryCode: 'IN' })).toMatchObject(
            { approximate: false }
        )
        expect(geocode({ city: 'NYC', countryCode: 'US' })).toMatchObject({
            approximate: false,
            adminCode: 'NY',
        })
        expect(
            geocode({ city: 'Bialystok, Poland', countryCode: 'PL' })
        ).toMatchObject({ approximate: false })
        expect(cityKeys('Greater Lagos, Nigeria')).toContain('lagos')
    })

    test('uses the state to tell same-named cities apart', () => {
        expect(
            geocode({ city: 'Portland', state: 'Maine', countryCode: 'US' })
        ).toMatchObject({ adminCode: 'ME' })
        expect(
            geocode({ city: 'Portland', state: 'OR', countryCode: 'US' })
        ).toMatchObject({ adminCode: 'OR' })
        // Without a state the most populous match wins
        expect(geocode({ city: 'Portland', countryCode: 'US' })).toMatchObject({
            adminCode: 'OR',
        })
    })

    test('falls back to the country center, flagged approximate', () => {
        const place = geocode({ city: 'Nowhere Town', countryCode: 'KE' })
        expect(place).toEqual({
            lat: expect.any(Number),
            lng: expect.any(Number),
            approximate: true,
        })
        expect(geocode({ city: '', countryCode: 'KE' })).toEqual(place)
    })

    test('falls back to the largest city when there is no centroid', () => {
        expect(countryCenters.HK).toBeUndefined()
        expect(geocode({ countryCode: 'HK' })).toMatchObject({
            approximate: true,
        })
    })

    test('returns nothing without a country', () => {
        expect(geocode({ city: 'London', countryCode: null })).toBeNull()
    })
})

describe('time zones', () => {
    const resolveTimezone = createTimezoneResolver({ timezones, cities })

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

    test('returns nothing without a country', () => {
        expect(resolveTimezone({ countryCode: null })).toBeNull()
    })
})

describe('location enrichment', () => {
    const addLocation = createLocationEnricher({
        cities,
        timezones,
        countryCentroids,
    })
    const [built] = buildPersons([
        {
            file: 'ada.json',
            data: {
                name: 'Ada',
                jobTitle: 'Senior Backend Engineer',
                location: {
                    city: 'Zürich',
                    country: 'Switzerland (open to remote)',
                },
                links: {},
            },
        },
    ])

    test('adds coordinates and a time zone next to the normalized fields', () => {
        const person = addLocation(built)
        expect(person.id).toBe(built.id)
        expect(person.location).toEqual(built.location)
        expect(person.normalized).toMatchObject({
            ...built.normalized,
            geo: { approximate: false },
            timezone: { name: 'Europe/Zurich', utcOffset: 60 },
        })
    })

    test('uses the first of several countries', () => {
        const person = addLocation({
            location: { city: 'Toronto' },
            normalized: { countries: ['CA', 'CN'] },
        })
        expect(person.normalized.geo.approximate).toBe(false)
        expect(person.normalized.timezone.name).toBe('America/Toronto')
    })

    test('leaves profiles without a resolved country off the map', () => {
        expect(
            addLocation({ location: {}, normalized: { countries: [] } })
                .normalized
        ).toMatchObject({ countries: [], geo: null, timezone: null })
    })

    test('every real submission with a resolved country is plotted', () => {
        const persons = buildPersons(
            loadSubmissions(path.resolve('Submissions'))
        ).map(addLocation)
        const withCountry = persons.filter(
            (person) => person.normalized.countries.length > 0
        )
        expect(withCountry.every((person) => person.normalized.geo)).toBe(true)
        expect(withCountry.every((person) => person.normalized.timezone)).toBe(
            true
        )

        const report = locationReport(persons)
        expect(report.city + report.countryOnly + report.none).toBe(
            persons.length
        )
        expect(report.city).toBeGreaterThan(report.countryOnly)
    })
})
