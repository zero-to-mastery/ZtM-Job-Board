import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, describe, expect, test, vi } from 'vitest'
import Person from '../interfaces/person'
import {
    getCountryMarkers,
    getCountryOptions,
    matchesCountries,
} from './personCountries'
import { resolveCountry } from './countries/resolveCountry.js'
import { getCountryCoordinates } from './countries/countryCoordinates.js'
import ProfileFilters from '../components/ProfileFilters'

// Profiles as produced by scripts/aggregate-json.mjs, using real country values
const person = (name: string, country: string | undefined): Person => ({
    id: name,
    name,
    location: { country },
    links: {},
    normalized: { countries: resolveCountry(country).countries },
})

const PEOPLE = [
    person('a', 'USA'),
    person('b', 'US'),
    person('c', 'United States'),
    person('d', 'United States of America'),
    person('e', 'USA (Willing to relocate!)'),
    person('f', 'USA/Belgium'),
    person('g', 'Belgium'),
    person('h', 'Brasil'),
    person('i', 'Brazil'),
    person('j', 'Georgia'),
    person('k', 'Remote'),
    person('l', 'Earth'),
    person('m', ''),
    person('n', undefined),
    person('o', 'United Kingdom, UK'),
]

describe('getCountryOptions', () => {
    test('lists each canonical country once, sorted by label', () => {
        expect(getCountryOptions(PEOPLE)).toEqual([
            { code: 'BE', label: 'Belgium' },
            { code: 'BR', label: 'Brazil' },
            { code: 'GB', label: 'United Kingdom' },
            { code: 'US', label: 'United States' },
        ])
    })

    test('unresolved values do not create options', () => {
        const labels = getCountryOptions(PEOPLE).map((o) => o.label)
        expect(labels).not.toContain('Georgia')
        expect(labels).not.toContain('Remote')
        expect(labels).not.toContain('Earth')
    })

    test('profiles without normalized data are ignored', () => {
        const bare: Person = {
            id: '1',
            name: 'n',
            location: {},
            links: {},
        }
        expect(
            getCountryOptions([
                bare,
                { ...bare, normalized: { countries: [] } },
            ])
        ).toEqual([])
    })
})

describe('matchesCountries', () => {
    const names = (people: Person[], codes: string[]) =>
        people.filter((p) => matchesCountries(p, codes)).map((p) => p.name)

    test('an empty selection matches everyone', () => {
        expect(PEOPLE.every((p) => matchesCountries(p, []))).toBe(true)
    })

    test('United States matches every US alias, once each', () => {
        expect(names(PEOPLE, ['US'])).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    })

    test('multi-country profiles match any of their countries', () => {
        expect(names(PEOPLE, ['BE'])).toEqual(['f', 'g'])
    })

    test('multiple selections are combined without duplicates', () => {
        const result = names(PEOPLE, ['US', 'BE', 'BR'])
        expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'])
        expect(new Set(result).size).toBe(result.length)
    })

    test('preserves the incoming order (sorting is applied separately)', () => {
        const reversed = [...PEOPLE].reverse()
        expect(names(reversed, ['BR'])).toEqual(['i', 'h'])
    })
})

describe('getCountryMarkers', () => {
    const devsByCode = (people: Person[]) =>
        Object.fromEntries(
            getCountryMarkers(people).map((m) => [m.code, m.numberOfDevs])
        )

    test('aliases are grouped under one country', () => {
        const people = [
            'USA',
            'US',
            'United States',
            'U.S.',
            'UNited States',
            'Brasil',
            'Brazil',
        ].map((country) => person(country, country))
        expect(devsByCode(people)).toEqual({ US: 5, BR: 2 })
    })

    test('a developer is counted once in each listed country', () => {
        const people = ['USA/Belgium', 'United Kingdom, UK'].map((country) =>
            person(country, country)
        )
        expect(devsByCode(people)).toEqual({ US: 1, BE: 1, GB: 1 })
        expect(
            getCountryMarkers([
                {
                    id: '1',
                    name: 'n',
                    location: {},
                    links: {},
                    normalized: { countries: ['US', 'US'] },
                },
            ])
        ).toEqual([
            {
                code: 'US',
                country: 'United States',
                latlng: getCountryCoordinates('US'),
                numberOfDevs: 1,
            },
        ])
    })

    test('unresolved values are not counted', () => {
        const people = ['Georgia', 'Remote', 'Earth', ''].map((country) =>
            person(country, country)
        )
        expect(getCountryMarkers(people)).toEqual([])
    })

    test('no people produce no markers', () => {
        expect(getCountryMarkers([])).toEqual([])
    })

    test('joins counts with generated coordinates, sorted by code', () => {
        const people = ['Russia', 'United States', 'US', 'USA'].map((country) =>
            person(country, country)
        )
        expect(getCountryMarkers(people)).toEqual([
            {
                code: 'RU',
                country: 'Russia',
                latlng: getCountryCoordinates('RU'),
                numberOfDevs: 1,
            },
            {
                code: 'US',
                country: 'United States',
                latlng: getCountryCoordinates('US'),
                numberOfDevs: 3,
            },
        ])
    })

    test('codes without coordinates do not produce markers', () => {
        // Hong Kong is a valid code but has no generated coordinates
        expect(
            getCountryMarkers([
                {
                    id: '1',
                    name: 'n',
                    location: {},
                    links: {},
                    normalized: { countries: ['HK', 'XX'] },
                },
            ])
        ).toEqual([])
    })

    test('a code listed twice produces a single marker', () => {
        expect(
            getCountryMarkers([
                {
                    id: '1',
                    name: 'n',
                    location: {},
                    links: {},
                    normalized: { countries: ['BQ', 'BQ'] },
                },
            ])
        ).toHaveLength(1)
    })
})

describe('ProfileFilters country dropdown', () => {
    let container: HTMLDivElement
    let root: Root
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

    afterEach(() => {
        act(() => root.unmount())
        container.remove()
    })

    const render = (
        props: Partial<React.ComponentProps<typeof ProfileFilters>>
    ) => {
        container = document.createElement('div')
        document.body.appendChild(container)
        root = createRoot(container)
        act(() =>
            root.render(
                React.createElement(ProfileFilters, {
                    countries: getCountryOptions(PEOPLE),
                    selectedCountries: [],
                    onCountryChange: () => {},
                    skills: [],
                    selectedSkills: [],
                    onSkillChange: () => {},
                    jobTitles: [],
                    selectedJobTitles: [],
                    onJobTitleChange: () => {},
                    sortOption: 'default',
                    onSortChange: () => {},
                    onClear: () => {},
                    ...props,
                })
            )
        )
        const countryButton = Array.from(
            container.querySelectorAll('button')
        ).find((b) => b.textContent?.startsWith('Country')) as HTMLButtonElement
        act(() => countryButton.click())
    }

    test('shows readable labels and reports ISO codes', () => {
        const onCountryChange = vi.fn()
        render({ onCountryChange, selectedCountries: ['US'] })

        const labels = Array.from(container.querySelectorAll('label'))
        expect(labels.map((l) => l.textContent?.trim())).toEqual([
            'Search countries',
            'Belgium',
            'Brazil',
            'United Kingdom',
            'United States',
        ])

        const us = labels
            .find((l) => l.textContent?.trim() === 'United States')
            ?.querySelector('input') as HTMLInputElement
        expect(us.checked).toBe(true)
        act(() => us.click())
        expect(onCountryChange).toHaveBeenCalledWith('US')
    })
})
