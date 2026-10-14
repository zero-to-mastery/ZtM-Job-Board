import { describe, expect, test } from 'vitest'
import {
    developerOffset,
    formatOffset,
    localTimeLabel,
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
