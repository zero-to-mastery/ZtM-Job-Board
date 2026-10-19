import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { filterByCountries, getCountryOptions } from './countryFilters'
import { resolveCountry } from './countries/resolveCountry.js'
import ProfileFilters from '../components/ProfileFilters'

// Profiles as produced by scripts/aggregate-json.mjs, using real country values
const person = (name: string, country: string | undefined) => ({
    name,
    location: { country },
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
        expect(getCountryOptions([{}, { normalized: {} }])).toEqual([])
    })
})

describe('filterByCountries', () => {
    const names = (people: { name: string }[]) => people.map((p) => p.name)

    test('an empty selection returns everyone', () => {
        expect(filterByCountries(PEOPLE, [])).toBe(PEOPLE)
    })

    test('United States matches every US alias, once each', () => {
        expect(names(filterByCountries(PEOPLE, ['US']))).toEqual([
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
        ])
    })

    test('multi-country profiles match any of their countries', () => {
        expect(names(filterByCountries(PEOPLE, ['BE']))).toEqual(['f', 'g'])
    })

    test('multiple selections are combined without duplicates', () => {
        const result = names(filterByCountries(PEOPLE, ['US', 'BE', 'BR']))
        expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'])
        expect(new Set(result).size).toBe(result.length)
    })

    test('preserves the incoming order (sorting is applied separately)', () => {
        const reversed = [...PEOPLE].reverse()
        expect(names(filterByCountries(reversed, ['BR']))).toEqual(['i', 'h'])
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
                <ProfileFilters
                    countries={getCountryOptions(PEOPLE)}
                    selectedCountries={[]}
                    onCountryChange={() => {}}
                    roles={[]}
                    selectedRoles={[]}
                    onRoleChange={() => {}}
                    sortOption="default"
                    onSortChange={() => {}}
                    onClear={() => {}}
                    {...props}
                />
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
            'Belgium',
            'Brazil',
            'United Kingdom',
            'United States',
        ])

        const us = labels[3].querySelector('input') as HTMLInputElement
        expect(us.checked).toBe(true)
        act(() => us.click())
        expect(onCountryChange).toHaveBeenCalledWith('US')
    })
})
