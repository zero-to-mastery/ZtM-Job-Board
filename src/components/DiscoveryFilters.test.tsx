import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test } from 'vitest'
import Person from '../interfaces/person'
import { useDeveloperFilters } from '../hooks/useDeveloperFilters'
import DiscoveryFilters from './DiscoveryFilters'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const person = (id: string, countries: string[]): Person => ({
    id,
    img: '',
    name: id,
    jobTitle: '',
    location: {},
    links: {},
    normalized: { countries, roles: [], seniority: null, technologies: [] },
})

const PEOPLE = [person('a', ['US']), person('b', ['GB']), person('c', ['US'])]
const NOW = new Date('2026-07-15T12:00:00Z')

function Harness() {
    const developerFilters = useDeveloperFilters(PEOPLE, NOW)
    return (
        <DiscoveryFilters
            developerFilters={developerFilters}
            countries={[
                { code: 'GB', label: 'United Kingdom' },
                { code: 'US', label: 'United States' },
            ]}
            roles={[]}
            levels={[]}
            signals={[]}
            total={PEOPLE.length}
        />
    )
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
    window.localStorage.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(<Harness />))
})

afterEach(() => {
    act(() => root.unmount())
    container.remove()
})

const button = (text: string) => {
    const found = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.startsWith(text)
    )
    if (!found) throw new Error(`No button starting with "${text}"`)
    return found
}
const count = () =>
    container.querySelector('.discovery-filters__count')?.textContent

test('shows active filters as removable pills with the result count', () => {
    expect(count()).toBe('3 developers')
    expect(button('Clear all').disabled).toBe(true)

    act(() => button('Country').click())
    const us = Array.from(container.querySelectorAll('label'))
        .find((label) => label.textContent?.includes('United States'))
        ?.querySelector('input')
    act(() => us?.click())

    expect(count()).toBe('2 of 3 developers')
    expect(button('Filters').textContent).toContain('1')
    expect(button('Clear all').disabled).toBe(false)

    act(() => button('United States').click())
    expect(count()).toBe('3 developers')
    expect(container.querySelector('.discovery-filters__active')).toBeNull()
})

test('collapses the body, keeps the header and remembers the choice', () => {
    const toggle = button('Filters')
    const body = container.querySelector('.discovery-filters__body')
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(body?.hasAttribute('hidden')).toBe(false)

    act(() => toggle.click())
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(body?.hasAttribute('hidden')).toBe(true)
    expect(
        container.querySelector('select[aria-label="Sort profiles"]')
    ).not.toBeNull()
    expect(window.localStorage.getItem('discovery-filters-collapsed')).toBe(
        'true'
    )
})
