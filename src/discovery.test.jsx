import React, { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import App from './App'
import ProfileFilters from './components/ProfileFilters'
import { shuffle } from './util/shuffle'

const { profiles, counterMounted, mapReceived } = vi.hoisted(() => ({
    counterMounted: vi.fn(),
    mapReceived: { people: undefined },
    profiles: Array.from({ length: 18 }, (_, index) => ({
        id: String(index + 1),
        name: `Developer ${String(index + 1).padStart(2, '0')}`,
        jobTitle: index < 16 ? 'Frontend Developer' : 'Backend Developer',
        location: { country: index < 17 ? 'Canada' : 'United States' },
        normalized: {
            countries: [index < 17 ? 'CA' : 'US'],
            roles: [index < 16 ? 'frontend-developer' : 'backend-developer'],
            seniority: null,
            technologies: [],
        },
        links: {},
        skills:
            index < 16
                ? [' React ', 'TypeScript', 'react']
                : index === 16
                  ? ['React']
                  : undefined,
    })),
}))
vi.mock('./assets/persons.json', () => ({ default: profiles }))
vi.mock('./util/shuffle', () => ({
    shuffle: vi.fn((people) => {
        people.reverse()
        return people.length
    }),
}))
vi.mock('react-countup', () => ({
    default: ({ end }) => {
        useEffect(() => {
            counterMounted()
        }, [])
        return <span>{end}</span>
    },
}))
// Capture what the map receives instead of rendering Leaflet
vi.mock('./components/Map', () => ({
    default: ({ people }) => {
        mapReceived.people = people
        return <div data-testid="map">{people.length}</div>
    },
}))

let container
let root
beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    localStorage.clear()
    // Open the filter panel, which starts collapsed
    localStorage.setItem('discovery-filters-collapsed', 'false')
    delete document.documentElement.dataset.theme
    mapReceived.people = undefined
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
})
afterEach(() => {
    act(() => root.unmount())
    container.remove()
    localStorage.clear()
    delete document.documentElement.dataset.theme
    vi.clearAllMocks()
})

function render(element = <App />) {
    act(() => root.render(element))
}

function button(text) {
    const found = [...container.querySelectorAll('button')].find(
        (element) => element.textContent.trim() === text
    )
    if (!found) throw new Error(`Button not found: ${text}`)
    return found
}

// Filter dropdown triggers read "<label><current value>", e.g. "SkillsAny skill"
function trigger(label) {
    const found = [
        ...container.querySelectorAll('.profile-filters__trigger'),
    ].find((element) => element.textContent.startsWith(label))
    if (!found) throw new Error(`Filter not found: ${label}`)
    return found
}

function click(element) {
    act(() => element.click())
}

// Opens a filter dropdown as a real pointer would: the pointerdown closes
// any other open dropdown before the click toggles this one
function openFilter(label) {
    const element = trigger(label)
    act(() =>
        element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    )
    if (element.getAttribute('aria-expanded') !== 'true') click(element)
}

function type(input, value) {
    act(() => {
        Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
        ).set.call(input, value)
        input.dispatchEvent(new Event('input', { bubbles: true }))
    })
}

function checkbox(text) {
    const label = [...container.querySelectorAll('label')].find(
        (element) => element.textContent.trim() === text
    )
    if (!label) throw new Error(`Checkbox label not found: ${text}`)
    return label.querySelector('input')
}

const openMenu = () => container.querySelector('.profile-filters__menu')
const menuOptions = () =>
    container.querySelectorAll('.profile-filters__menu input[type="checkbox"]')
const search = () => container.querySelector('.discovery-filters__search input')
const cardNames = () =>
    [...container.querySelectorAll('.card .name')].map(
        (element) => element.textContent
    )
const resultCount = () =>
    container.querySelector('.discovery-filters__count').textContent
const stats = () =>
    [...container.querySelectorAll('.profile-stats__value')].map(
        (element) => element.textContent
    )

describe('skills-based discovery', () => {
    test('filters by all selected skills and displays normalized matching badges', () => {
        render()
        expect(resultCount()).toBe('18 developers')
        click(trigger('Skills'))
        expect(container.textContent).toContain(
            'Matches all selected skills. Skills are self-reported.'
        )
        // " React " and "react" collapse into one option
        expect(menuOptions()).toHaveLength(2)
        click(checkbox('React'))
        expect(resultCount()).toBe('17 of 18 developers')
        click(checkbox('TypeScript'))
        expect(resultCount()).toBe('16 of 18 developers')
        expect(cardNames()).toHaveLength(16)
        expect(container.querySelectorAll('.skill-chip--matched')).toHaveLength(
            32
        )
        expect(container.textContent).toContain(
            'Self-reported skills (not verified)'
        )
        expect(container.textContent).not.toContain('Show More')

        click(
            container.querySelector(
                '[aria-label="Remove filter: Skill: TypeScript"]'
            )
        )
        expect(resultCount()).toBe('17 of 18 developers')
        expect(
            container.querySelector(
                '[aria-label="Remove filter: Skill: TypeScript"]'
            )
        ).toBeNull()
    })

    test('searches skill options and dismisses on Escape and outside clicks', () => {
        render()
        const skills = trigger('Skills')
        click(skills)
        const input = container.querySelector(
            '.profile-filters__menu input[type="search"]'
        )
        expect(document.activeElement).toBe(input)
        type(input, 'type')
        expect(menuOptions()).toHaveLength(1)
        type(input, 'unlisted')
        expect(container.textContent).toContain('No skills match')

        act(() =>
            input.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
            )
        )
        expect(openMenu()).toBeNull()
        expect(document.activeElement).toBe(skills)

        click(skills)
        act(() =>
            document.body.dispatchEvent(
                new Event('pointerdown', { bubbles: true })
            )
        )
        expect(openMenu()).toBeNull()
    })

    test('keeps the totals and does not remount the counters while filtering', () => {
        render()
        expect(stats()).toEqual(['18', '2'])
        expect(counterMounted).toHaveBeenCalledTimes(2)
        const counters = [
            ...container.querySelectorAll('.profile-stats__value span'),
        ]

        type(search(), 'Developer 01')
        type(search(), 'Developer')
        openFilter('Skills')
        click(checkbox('TypeScript'))
        expect(resultCount()).toBe('16 of 18 developers')
        click(button('Clear all'))

        expect(stats()).toEqual(['18', '2'])
        expect(counterMounted).toHaveBeenCalledTimes(2)
        expect([
            ...container.querySelectorAll('.profile-stats__value span'),
        ]).toEqual(counters)
    })

    test('resets pagination when criteria change and hides Show More at the end', () => {
        render()
        expect(cardNames()).toHaveLength(16)
        click(button('Show More'))
        expect(cardNames()).toHaveLength(18)
        expect(container.textContent).not.toContain('Show More')

        type(search(), 'Developer')
        expect(cardNames()).toHaveLength(16)
        click(button('Show More'))
        openFilter('Skills')
        click(checkbox('React'))
        expect(resultCount()).toBe('17 of 18 developers')
        expect(cardNames()).toHaveLength(16)
        click(button('Show More'))
        expect(cardNames()).toHaveLength(17)
        expect(container.textContent).not.toContain('Show More')
    })

    test('keeps order stable while filtering and shuffles only when asked', () => {
        render()
        const order = cardNames()
        expect(shuffle).toHaveBeenCalledTimes(1)
        openFilter('Skills')
        click(checkbox('React'))
        click(checkbox('React'))
        expect(cardNames()).toEqual(order)
        expect(shuffle).toHaveBeenCalledTimes(1)
        click(button('Shuffle'))
        expect(shuffle).toHaveBeenCalledTimes(2)
        expect(cardNames()).not.toEqual(order)
        expect(profiles[0].id).toBe('1')
    })

    test('combines country, role and text with skills, and clears all from zero results', () => {
        render()
        openFilter('Skills')
        click(checkbox('React'))
        openFilter('Country')
        click(checkbox('Canada'))
        openFilter('Role')
        click(checkbox('Frontend Developer'))
        type(search(), 'Developer 01')
        expect(resultCount()).toBe('1 of 18 developers')
        expect(cardNames()).toEqual(['Developer 01'])

        openFilter('Country')
        click(checkbox('Canada'))
        click(checkbox('United States'))
        expect(resultCount()).toBe('0 of 18 developers')
        expect(container.textContent).toContain(
            'No developers match your criteria'
        )

        click(container.querySelector('.empty-state button'))
        expect(resultCount()).toBe('18 developers')
        expect(search().value).toBe('')
        expect(container.querySelector('.discovery-filters__active')).toBeNull()
        expect(trigger('Skills').textContent).toContain('Any skill')
        expect(
            container.querySelector('[aria-label="Sort profiles"]').value
        ).toBe('default')
        expect(cardNames()).toHaveLength(16)
    })

    test('the map shows the same skill-filtered developers as the cards', async () => {
        render()
        openFilter('Skills')
        click(checkbox('TypeScript'))
        const cards = cardNames()
        expect(cards).toHaveLength(16)

        await act(async () => button('Map').click())
        expect(container.querySelector('[data-testid="map"]')).not.toBeNull()
        expect(mapReceived.people.map(({ name }) => name)).toEqual(cards)
        expect(resultCount()).toBe('16 of 18 developers')
    })

    test('explains the rollout when no profiles have declared skills', () => {
        render(
            <ProfileFilters
                countries={[]}
                selectedCountries={[]}
                onCountryChange={vi.fn()}
                roles={[]}
                selectedRoles={[]}
                onRoleChange={vi.fn()}
                skills={[]}
                selectedSkills={[]}
                onSkillChange={vi.fn()}
            />
        )
        expect(trigger('Skills').textContent).toContain('None declared yet')
        click(trigger('Skills'))
        expect(container.textContent).toContain(
            'No profiles have declared skills yet.'
        )
        expect(menuOptions()).toHaveLength(0)
    })

    test('uses the saved theme and preserves skill criteria when toggling it', () => {
        localStorage.setItem('theme', 'dark')
        render()
        expect(document.documentElement.dataset.theme).toBe('dark')
        openFilter('Skills')
        click(checkbox('TypeScript'))
        expect(resultCount()).toBe('16 of 18 developers')

        click(container.querySelector('[aria-label="Switch to light mode"]'))
        expect(document.documentElement.dataset.theme).toBe('light')
        expect(localStorage.getItem('theme')).toBe('light')
        expect(resultCount()).toBe('16 of 18 developers')
        expect(
            container.querySelector(
                '[aria-label="Remove filter: Skill: TypeScript"]'
            )
        ).not.toBeNull()
        expect(container.querySelectorAll('.skill-chip--matched')).toHaveLength(
            16
        )
        expect(shuffle).toHaveBeenCalledTimes(1)
    })
})
