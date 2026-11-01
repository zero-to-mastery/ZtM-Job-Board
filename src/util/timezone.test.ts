import { describe, expect, test } from 'vitest'
import {
    developerOffset,
    formatOffset,
    workdayOverlapHours,
    zoneOffsetMinutes,
} from './timezone'

describe('daily 9-5 overlap', () => {
    test.each([
        ['same zone', 0, 0, 8],
        ['one hour apart', 0, 60, 7],
        ['New York and Berlin', -300, 60, 2],
        ['India and UTC', 330, 0, 2.5],
        ['Nepal and UTC', 345, 0, 2.25],
        ['opposite sides of the day', 0, 720, 0],
        ['LA and Tonga across the date line', -480, 780, 5],
        ['widest valid offset spread', -720, 840, 6],
    ])('%s', (_label, a, b, expected) => {
        expect(workdayOverlapHours(a, b)).toBe(expected)
        expect(workdayOverlapHours(b, a)).toBe(expected)
    })

    test('overlap is symmetric and never exceeds a workday for valid offsets', () => {
        for (let a = -720; a <= 840; a += 15) {
            for (let b = -720; b <= 840; b += 15) {
                const overlap = workdayOverlapHours(a, b)
                expect(overlap).toBeGreaterThanOrEqual(0)
                expect(overlap).toBeLessThanOrEqual(8)
                expect(overlap).toBe(workdayOverlapHours(b, a))
            }
        }
    })
})

describe('zone offsets', () => {
    const january = new Date('2026-01-15T12:00:00Z')
    const july = new Date('2026-07-15T12:00:00Z')

    test('uses date-specific DST even after caching a formatter', () => {
        expect(zoneOffsetMinutes('America/New_York', january)).toBe(-300)
        expect(zoneOffsetMinutes('America/New_York', july)).toBe(-240)
        expect(zoneOffsetMinutes('Australia/Sydney', january)).toBe(660)
        expect(zoneOffsetMinutes('Australia/Sydney', july)).toBe(600)
        expect(
            developerOffset({ name: 'America/New_York', utcOffset: -300 }, july)
        ).toBe(-240)
    })

    test('handles fractional and zero offsets', () => {
        expect(zoneOffsetMinutes('Asia/Kolkata', july)).toBe(330)
        expect(zoneOffsetMinutes('Asia/Kathmandu', july)).toBe(345)
        expect(zoneOffsetMinutes('Africa/Abidjan', july)).toBe(0)
    })

    test('unknown zones use the explicitly supplied standard offset', () => {
        expect(zoneOffsetMinutes('Not/AZone', july)).toBeNull()
        expect(zoneOffsetMinutes('Not/AZone', january)).toBeNull()
        expect(
            developerOffset({ name: 'Not/AZone', utcOffset: 120 }, july)
        ).toBe(120)
        expect(developerOffset(null, july)).toBeNull()
    })

    test.each([
        [0, 'UTC'],
        [-300, 'UTC-5'],
        [330, 'UTC+5:30'],
        [-570, 'UTC-9:30'],
        [345, 'UTC+5:45'],
    ])('formats %s minutes', (offset, label) => {
        expect(formatOffset(offset)).toBe(label)
    })
})
