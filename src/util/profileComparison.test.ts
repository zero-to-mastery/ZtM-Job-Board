
import { describe, expect, it } from 'vitest'
import {
    getProfileTimezone,
    MAX_COMPARE_PROFILES,
    toggleProfileComparison,
} from './profileComparison'

describe('toggleProfileComparison', () => {
    it('adds a profile to the selection', () => {
        expect(toggleProfileComparison(['one'], 'two')).toEqual([
            'one',
            'two',
        ])
    })

    it('removes an already selected profile', () => {
        expect(toggleProfileComparison(['one', 'two'], 'one')).toEqual([
            'two',
        ])
    })

    it('blocks selection of a fourth profile', () => {
        const selected = ['one', 'two', 'three']

        expect(selected).toHaveLength(MAX_COMPARE_PROFILES)
        expect(toggleProfileComparison(selected, 'four')).toEqual(selected)
    })

    it('allows another selection after removing a profile', () => {
        const selected = toggleProfileComparison(
            ['one', 'two', 'three'],
            'two'
        )

        expect(toggleProfileComparison(selected, 'four')).toEqual([
            'one',
            'three',
            'four',
        ])
    })
})

describe('getProfileTimezone', () => {
    it('uses the country when coordinates are missing', () => {
        expect(
            getProfileTimezone({
                city: 'Guna',
                country: 'India',
            })
        ).toBe('India')
    })

    it('uses the country when coordinates are invalid', () => {
        expect(
            getProfileTimezone({
                country: 'India',
                coordinates: {
                    lat: Number.NaN,
                    lng: 78.18,
                },
            })
        ).toBe('India')
    })

    it('derives a timezone and UTC offset from coordinates', () => {
        const timezone = getProfileTimezone(
            {
                city: 'New York',
                country: 'United States',
                coordinates: {
                    lat: 40.7128,
                    lng: -74.006,
                },
            },
            new Date('2026-01-15T12:00:00Z')
        )

        expect(timezone).toContain('America/New_York')
        expect(timezone).toContain('UTC-05:00')
    })
})
