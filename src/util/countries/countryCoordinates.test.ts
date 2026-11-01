import { describe, expect, test } from 'vitest'
import { getCountryCoordinates } from './countryCoordinates.ts'
import { COUNTRY_NAMES } from './countryNames.ts'

// Codes with no entry in the pinned coordinate CSV (and no supplement entry).
// Adding to this list requires updating the "how to add a country" checklist
// in docs/country-normalization.md.
const ALLOWLIST_NO_COORDINATES = ['AX', 'EH', 'HK', 'MO']

describe('getCountryCoordinates', () => {
    test('returns the full-precision tuple for a known code', () => {
        expect(getCountryCoordinates('FR')).toEqual([
            46.20410930340389, 2.936178131958199,
        ])
    })

    test('returns undefined for an unknown code', () => {
        expect(getCountryCoordinates('ZZ')).toBeUndefined()
    })

    test('applies ISO-keyed coordinate fixes (Denmark typo fixed)', () => {
        expect(getCountryCoordinates('DK')).toEqual([56.26392, 9.501785])
    })

    test('dedupes duplicate ISO rows — first name-sorted row wins (BQ, TF)', () => {
        // 'Bonaire' sorts before 'Saba' / 'Saint Eustatius'
        expect(getCountryCoordinates('BQ')).toEqual([
            12.180844982440338, -68.29350445958761,
        ])
        // 'French Southern Territories' sorts before 'Glorioso' / 'Juan De Nova'
        expect(getCountryCoordinates('TF')).toEqual([
            -48.26579567146711, 63.297413102060936,
        ])
    })

    test('dedupes ES to mainland Spain, not Canarias (override)', () => {
        expect(getCountryCoordinates('ES')).toEqual([
            40.03038547506125, -2.9429673360930226,
        ])
    })

    test('includes supplement entries missing from the CSV (TW)', () => {
        expect(getCountryCoordinates('TW')).toEqual([23.8171616, 120.6847786])
    })

    test('every countryNames code has coordinates except the allowlist', () => {
        const missing = Object.keys(COUNTRY_NAMES).filter(
            (code) =>
                !ALLOWLIST_NO_COORDINATES.includes(code) &&
                getCountryCoordinates(code) === undefined
        )
        expect(missing).toEqual([])
    })

    test('allowlisted codes are still absent from the CSV (keep list honest)', () => {
        for (const code of ALLOWLIST_NO_COORDINATES) {
            expect(getCountryCoordinates(code)).toBeUndefined()
        }
    })
})
