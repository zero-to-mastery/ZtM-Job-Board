import { describe, expect, test } from 'vitest'
import {
    developerOffset,
    formatOffset,
    getTimeZoneGroups,
    localTimeLabel,
    parseUtcOffset,
    selectedTimeZoneOffsetMinutes,
    searchTimeZones,
    timeZoneLabel,
    workdayOverlapHours,
    zoneOffsetMinutes,
} from './timezone'

const hours = (h: number) => h * 60

describe('workdayOverlapHours', () => {
    test.each([
        ['same zone', 0, 0, 8],
        ['one hour apart', 0, hours(1), 7],
        ['New York and Berlin', hours(-5), hours(1), 2],
        ['half-hour offset (India and UTC)', 330, 0, 2.5],
        ['quarter-hour offset (Nepal and UTC)', 345, 0, 2.25],
        ['twelve hours apart', 0, hours(12), 0],
        // Tonga's morning is the previous afternoon in Los Angeles
        ['across the date line (LA and Tonga)', hours(-8), hours(13), 5],
        ['the widest spread (UTC-12 and UTC+14)', hours(-12), hours(14), 6],
    ])('%s', (_label, a, b, expected) => {
        expect(workdayOverlapHours(a, b)).toBe(expected)
        expect(workdayOverlapHours(b, a)).toBe(expected)
    })
})

describe('zone offsets', () => {
    const january = new Date('2026-01-15T12:00:00Z')
    const july = new Date('2026-07-15T12:00:00Z')

    test('applies daylight saving time', () => {
        expect(zoneOffsetMinutes('America/New_York', january)).toBe(-300)
        expect(zoneOffsetMinutes('America/New_York', july)).toBe(-240)
        expect(zoneOffsetMinutes('Australia/Sydney', january)).toBe(660)
        expect(zoneOffsetMinutes('Australia/Sydney', july)).toBe(600)
    })

    test('handles fractional and zero offsets', () => {
        expect(zoneOffsetMinutes('Asia/Kolkata', july)).toBe(330)
        expect(zoneOffsetMinutes('Asia/Kathmandu', july)).toBe(345)
        expect(zoneOffsetMinutes('Africa/Abidjan', july)).toBe(0)
    })

    test('falls back to the stored standard offset for unknown zones', () => {
        expect(zoneOffsetMinutes('Not/AZone', july)).toBeNull()
        expect(
            developerOffset({ name: 'Not/AZone', utcOffset: 120 }, july)
        ).toBe(120)
        expect(developerOffset(null, july)).toBeNull()
    })

    test('formats offsets', () => {
        expect(formatOffset(0)).toBe('UTC')
        expect(formatOffset(-300)).toBe('UTC-5')
        expect(formatOffset(330)).toBe('UTC+5:30')
        expect(formatOffset(-570)).toBe('UTC-9:30')
    })

    test('parses signed UTC/GMT offsets, including half-hour offsets', () => {
        expect(parseUtcOffset('GMT')).toBe(0)
        expect(parseUtcOffset('utc')).toBe(0)
        expect(parseUtcOffset('UTC-5')).toBe(-300)
        expect(parseUtcOffset('gmt-5')).toBe(-300)
        expect(parseUtcOffset('GMT +5:30')).toBe(330)
        expect(parseUtcOffset('UTC+0530')).toBe(330)
        expect(parseUtcOffset('UTC−4')).toBe(-240)
        expect(parseUtcOffset('UTC+14:30')).toBeNull()
        expect(parseUtcOffset('UTC+5:60')).toBeNull()
        expect(parseUtcOffset('New York')).toBeNull()
    })

    describe('time-zone search', () => {
        const zones = ['America/New_York', 'Europe/London', 'UTC']
        const values = (query: string) =>
            searchTimeZones(query, zones).map(({ value }) => value)

        test.each(['gm', 'GMT', 'ut', 'UTC'])(
            '%s offers a short list of selectable offsets',
            (query) => {
                const results = searchTimeZones(query, zones)
                expect(results[0].value).toBe('UTC')
                expect(results.length).toBeLessThanOrEqual(12)
                expect(results.length).toBeGreaterThan(1)
                expect(
                    results.every(({ label }) => label.includes('GMT'))
                ).toBe(true)
            }
        )

        test.each(['GMT-', 'utc-'])('%s matches negative offsets', (query) => {
            expect(values(query)).toContain('UTC-5')
            expect(
                values(query).every((value) => value.startsWith('UTC-'))
            ).toBe(true)
        })

        test.each(['gmt-5', 'UTC-05', 'GMT − 5', 'UTC-0500'])(
            '%s puts the exact offset first',
            (query) => expect(values(query)[0]).toBe('UTC-5')
        )

        test.each(['GMT+5:30', 'utc + 0530', 'UTC＋5:30'])(
            '%s finds a fractional fixed offset',
            (query) => expect(values(query)[0]).toBe('UTC+5:30')
        )

        test('suggests completions while entering minutes', () => {
            expect(values('GMT+5:')).toContain('UTC+5:30')
            expect(values('UTC+5:3')).toEqual(['UTC+5:30'])
            expect(values('UTC+05:3')).toEqual(['UTC+5:30'])
        })

        test.each(['UTC+25', 'GMT+5:60', 'GMT+14:30'])(
            '%s does not offer an invalid offset',
            (query) => expect(values(query)).toEqual([])
        )

        test('keeps city searches readable and supports raw IANA identifiers', () => {
            expect(values('new york')).toEqual(['America/New_York'])
            expect(values('America/New_York')).toEqual(['America/New_York'])
            expect(timeZoneLabel('America/New_York')).toBe('New York · America')
            expect(timeZoneLabel('GMT-5')).toBe('UTC-5')
        })
    })

    test('resolves fixed offsets without applying daylight-saving changes', () => {
        expect(selectedTimeZoneOffsetMinutes('GMT-5', january)).toBe(-300)
        expect(selectedTimeZoneOffsetMinutes('UTC-5', july)).toBe(-300)
        expect(selectedTimeZoneOffsetMinutes('America/New_York', january)).toBe(
            -300
        )
        expect(selectedTimeZoneOffsetMinutes('America/New_York', july)).toBe(
            -240
        )
    })

    test('groups IANA zones and includes the current zone and UTC', () => {
        const groups = getTimeZoneGroups('America/Example')
        const america = groups.find(({ region }) => region === 'America')
        const other = groups.find(({ region }) => region === 'Other')
        const americaZones = america?.zones ?? []

        expect(america).toBeDefined()
        expect(america?.zones).toContain('America/Example')
        expect(other?.zones).toContain('UTC')
        expect(americaZones).toEqual(
            [...americaZones].sort((a, b) => a.localeCompare(b))
        )
    })
})

describe('localTimeLabel', () => {
    // Thursday 15 January 2026, 23:30 UTC
    const moment = new Date('2026-01-15T23:30:00Z')

    test('shows the local weekday so day boundaries are visible', () => {
        expect(localTimeLabel(0, moment)).toBe('Thu 11:30 PM')
        expect(localTimeLabel(hours(14), moment)).toBe('Fri 1:30 PM')
        expect(localTimeLabel(hours(-11), moment)).toBe('Thu 12:30 PM')
        expect(localTimeLabel(330, moment)).toBe('Fri 5:00 AM')
    })
})
