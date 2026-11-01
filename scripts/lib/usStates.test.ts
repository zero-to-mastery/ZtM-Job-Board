import { describe, expect, test } from 'vitest'
import { usStateCode, US_STATE_TIMEZONES } from './usStates.ts'

describe('US state location reference', () => {
    test.each<[unknown, string | null]>([
        ['California', 'CA'],
        ['ca.', 'CA'],
        ['CA', 'CA'],
        ['New York', 'NY'],
        ['north-carolina', 'NC'],
        ['Washington', 'WA'],
        ['District of Columbia', 'DC'],
        ['Washington DC', 'DC'],
        ['Washington, D.C.', 'DC'],
        ['DC', 'DC'],
        ['Texas', 'TX'],
        ['Calif.', null],
        ['Puerto Rico', null],
        ['Ontario', null],
        ['United States', null],
        ['', null],
        [undefined, null],
        [42, null],
    ])('%s -> %s', (input, expected) => {
        expect(usStateCode(input)).toBe(expected)
    })

    test('contains all 50 states and DC, each with a valid IANA zone', () => {
        expect(Object.keys(US_STATE_TIMEZONES)).toHaveLength(51)
        for (const [code, zone] of Object.entries(US_STATE_TIMEZONES)) {
            expect(usStateCode(code)).toBe(code)
            expect(
                () => new Intl.DateTimeFormat('en-US', { timeZone: zone })
            ).not.toThrow()
        }
    })

    test('keeps predominant-state zones explicit, not exact city claims', () => {
        // Texas is listed as Central time even though El Paso is on Mountain time.
        expect(US_STATE_TIMEZONES.AZ).toBe('America/Phoenix')
        expect(US_STATE_TIMEZONES.HI).toBe('Pacific/Honolulu')
        expect(US_STATE_TIMEZONES.AK).toBe('America/Anchorage')
        expect(US_STATE_TIMEZONES.TX).toBe('America/Chicago')
    })
})
