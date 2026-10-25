import React, { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import App from './App'
import ProfileFilters from './components/ProfileFilters'
import { shuffle } from './util/shuffle'

const { profiles, counterMounted } = vi.hoisted(() => ({
    counterMounted: vi.fn(),
    profiles: Array.from({ length: 18 }, (_, index) => ({
        id: String(index + 1),
        name: `Developer ${String(index + 1).padStart(2, '0')}`,
        jobTitle:
            index < 16
                ? [
                      'Frontend Developer',
                      'Frontend Developer / Backend Developer',
                      'Senior Frontend React Engineer',
                  ][index % 3]
                : 'Backend Developer',
        location: { country: index < 17 ? 'Canada' : 'United States' },
        normalized: { countries: [index < 17 ? 'CA' : 'US'] },
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

let container
let root
beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
})
afterEach(() => {
    act(() => root.unmount())
    container.remove()
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

function click(element) {
    act(() => element.click())
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

const cardNames = () =>
    [...container.querySelectorAll('.card .name')].map(
        (element) => element.textContent
    )
const resultCount = () =>
    container.querySelector('.developer-results__count').textContent

describe('recruiter discovery', () => {
    test('lists role spelling variants once and matches every variant', () => {
        render()
        click(button('Role'))
        const labels = [...container.querySelectorAll('label')].map((label) =>
            label.textContent.trim()
        )
        expect(labels).toEqual(['Backend Developer', 'Frontend Developer'])
        click(checkbox('Frontend Developer'))
        expect(resultCount()).toContain('16 matching developers')
        expect(container.querySelector('#role-options').textContent).toContain(
            'Other roles'
        )
    })

    test('searches role options using the same spelling normalization', () => {
        render()
        click(button('Role'))
        const search = container.querySelector('[aria-label="Search roles"]')
        for (const query of [' FRONT-END ', 'front end', 'frontend']) {
            type(search, query)
            expect(
                [...container.querySelectorAll('label')].map((label) =>
                    label.textContent.trim()
                )
            ).toEqual(['Frontend Developer'])
        }
        type(search, '   ')
        expect(container.querySelectorAll('label')).toHaveLength(2)
    })

    test('keeps a dropdown open when blur has no related target', () => {
        render(
            <ProfileFilters
                countries={[]}
                selectedCountries={[]}
                onCountryChange={vi.fn()}
                jobTitles={[]}
                selectedJobTitles={[]}
                onJobTitleChange={vi.fn()}
                skills={['React']}
                selectedSkills={[]}
                onSkillChange={vi.fn()}
                sortOption="default"
                onSortChange={vi.fn()}
                onClear={vi.fn()}
            />
        )

        click(button('Required skills'))
        const search = container.querySelector('#skill-search')
        act(() => {
            search.dispatchEvent(
                new FocusEvent('focusout', {
                    bubbles: true,
                    relatedTarget: null,
                })
            )
        })

        expect(button('Required skills').getAttribute('aria-expanded')).toBe(
            'true'
        )
        expect(container.querySelector('#required-skills-options')).toBeTruthy()
    })

    test('preserves the profile and global country statistics when filtering', () => {
        render()
        const stats = () =>
            [...container.querySelectorAll('.developer-results__stats dd')].map(
                (element) => element.textContent
            )
        expect(
            container.querySelector('.developer-results__stats').textContent
        ).toContain('Total Countries')
        expect(stats()).toEqual(['18', '2'])
        click(button('Required skills'))
        click(checkbox('TypeScript'))
        expect(stats()).toEqual(['18', '2'])
        expect(resultCount()).toContain('16 matching developers')
    })

    test('does not remount the statistics counters when search or filters change', () => {
        render()
        expect(counterMounted).toHaveBeenCalledTimes(2)
        const counters = [
            ...container.querySelectorAll('.developer-results__stats dd span'),
        ]
        type(container.querySelector('input[type="search"]'), 'Developer 01')
        type(container.querySelector('input[type="search"]'), 'Developer')
        click(button('Required skills'))
        click(checkbox('React'))
        click(button('Clear filters'))
        expect(counterMounted).toHaveBeenCalledTimes(2)
        expect([
            ...container.querySelectorAll('.developer-results__stats dd span'),
        ]).toEqual(counters)
    })

    test.each([
        ['Required skills', '#required-skills-options'],
        ['Country', '#country-options'],
        ['Role', '#role-options'],
    ])(
        '%s focuses its search and consistently dismisses on Escape, outside clicks and focus leaving',
        (label, selector) => {
            render()
            const trigger = button(label)
            click(trigger)
            let input = container.querySelector(`${selector} input`)
            expect(document.activeElement).toBe(input)
            const option = container.querySelector(
                `${selector} input[type="checkbox"]`
            )
            act(() => option.focus())
            expect(container.querySelector(selector)).not.toBeNull()
            act(() =>
                option.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 'Escape',
                        bubbles: true,
                    })
                )
            )
            expect(container.querySelector(selector)).toBeNull()
            expect(document.activeElement).toBe(trigger)

            click(trigger)
            act(() =>
                document.body.dispatchEvent(
                    new Event('pointerdown', { bubbles: true })
                )
            )
            expect(container.querySelector(selector)).toBeNull()

            click(trigger)
            act(() => button('Clear filters').focus())
            expect(container.querySelector(selector)).toBeNull()
            expect(document.activeElement).toBe(button('Clear filters'))
            expect(trigger.getAttribute('aria-expanded')).toBe('false')
        }
    )

    test('filters by all selected skills and displays normalized matching badges', () => {
        render()
        expect(resultCount()).toContain('18 matching developers')
        click(button('Required skills'))
        expect(document.activeElement.id).toBe('skill-search')
        expect(
            container.querySelectorAll(
                '#required-skills-options input[type="checkbox"]'
            )
        ).toHaveLength(2)
        click(checkbox('React'))
        expect(resultCount()).toContain('17 matching developers')
        click(checkbox('TypeScript'))
        expect(resultCount()).toContain('16 matching developers')
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
                '[aria-label="Remove required skill TypeScript"]'
            )
        )
        expect(resultCount()).toContain('17 matching developers')
        expect(
            container.querySelector(
                '[aria-label="Remove required skill TypeScript"]'
            )
        ).toBeNull()
    })

    test('searches skill options and supports Escape and outside dismissal', () => {
        render()
        click(button('Required skills'))
        const input = container.querySelector('#skill-search')
        type(input, 'type')
        expect(
            container.querySelectorAll(
                '#required-skills-options input[type="checkbox"]'
            )
        ).toHaveLength(1)
        type(input, 'unlisted')
        expect(container.textContent).toContain(
            'No declared skills match this search.'
        )
        act(() =>
            input.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
            )
        )
        expect(container.querySelector('#required-skills-options')).toBeNull()
        expect(document.activeElement).toBe(button('Required skills'))
        click(button('Required skills'))
        act(() =>
            document.body.dispatchEvent(
                new Event('pointerdown', { bubbles: true })
            )
        )
        expect(container.querySelector('#required-skills-options')).toBeNull()
    })

    test('searches country options case-insensitively with whitespace normalization and no typo correction', () => {
        render()
        click(button('Country'))
        const search = container.querySelector(
            '[aria-label="Search countries"]'
        )
        const labels = () =>
            [...container.querySelectorAll('#country-options label')].map(
                (label) => label.textContent.trim()
            )
        type(search, '  uNiTeD    StAtEs  ')
        expect(labels()).toEqual(['United States'])
        type(search, 'Canda')
        expect(labels()).toEqual([])
        type(search, '   ')
        expect(labels()).toEqual(['Canada', 'United States'])
    })

    test('searches skill options case-insensitively with whitespace normalization and no typo correction', () => {
        render()
        click(button('Required skills'))
        const search = container.querySelector('#skill-search')
        const matches = () =>
            container.querySelectorAll(
                '#required-skills-options input[type="checkbox"]'
            ).length
        type(search, '  typescript  ')
        expect(matches()).toBe(1)
        type(search, 'typscript')
        expect(container.textContent).toContain(
            'No declared skills match this search.'
        )
        type(search, '   ')
        expect(matches()).toBe(2)
    })

    test('keeps order stable during searches and shuffles only when explicitly requested', () => {
        render()
        const order = cardNames()
        expect(shuffle).toHaveBeenCalledTimes(1)
        const inputs = container.querySelectorAll('input[type="search"]')
        type(inputs[0], 'Developer')
        expect(cardNames()).toEqual(order)
        expect(inputs[1].value).toBe('Developer')
        type(inputs[1], '')
        expect(inputs[0].value).toBe('')
        expect(cardNames()).toEqual(order)
        expect(shuffle).toHaveBeenCalledTimes(1)
        click(button('Shuffle'))
        expect(shuffle).toHaveBeenCalledTimes(2)
        expect(cardNames()).not.toEqual(order)
        expect(profiles[0].id).toBe('1')
    })

    test('resets pagination when criteria change and hides Show More at the end', () => {
        render()
        expect(cardNames()).toHaveLength(16)
        click(button('Show More'))
        expect(cardNames()).toHaveLength(18)
        expect(container.textContent).not.toContain('Show More')
        type(container.querySelector('input[type="search"]'), 'Developer')
        expect(cardNames()).toHaveLength(16)
        click(button('Show More'))
        click(button('Required skills'))
        click(checkbox('React'))
        expect(resultCount()).toContain('17 matching developers')
        expect(cardNames()).toHaveLength(16)
        click(button('Show More'))
        expect(cardNames()).toHaveLength(17)
        expect(container.textContent).not.toContain('Show More')
    })

    test('resets pagination on sort changes and clears the sort and option search', () => {
        render()
        click(button('Show More'))
        const select = container.querySelector('[aria-label="Sort developers"]')
        act(() => {
            select.value = 'name-asc'
            select.dispatchEvent(new Event('change', { bubbles: true }))
        })
        expect(cardNames()).toHaveLength(16)
        expect(cardNames()[0]).toBe('Developer 01')
        click(button('Required skills'))
        type(container.querySelector('#skill-search'), 'type')
        click(checkbox('TypeScript'))
        click(button('Clear filters'))
        expect(select.value).toBe('default')
        expect(resultCount()).toContain('18 matching developers')
        click(button('Required skills'))
        expect(container.querySelector('#skill-search').value).toBe('')
        expect(
            container.querySelectorAll(
                '#required-skills-options input[type="checkbox"]'
            )
        ).toHaveLength(2)
    })

    test.each([
        ['Country', 'Canada'],
        ['Role', 'Frontend Developer'],
    ])('resets pagination when a %s filter changes', (filterLabel, option) => {
        render()
        click(button('Show More'))
        expect(cardNames()).toHaveLength(18)
        click(button(filterLabel))
        click(checkbox(option))
        click(checkbox(option))
        expect(resultCount()).toContain('18 matching developers')
        expect(cardNames()).toHaveLength(16)
        expect(button('Show More')).toBeTruthy()
    })

    test('keeps the results list mounted when criteria change', () => {
        render()
        const results = container.querySelector('.developer-results')
        type(container.querySelector('input[type="search"]'), 'Developer')
        click(button('Country'))
        click(checkbox('Canada'))
        click(button('Role'))
        click(checkbox('Frontend Developer'))
        click(button('Required skills'))
        click(checkbox('React'))
        const select = container.querySelector('[aria-label="Sort developers"]')
        act(() => {
            select.value = 'name-asc'
            select.dispatchEvent(new Event('change', { bubbles: true }))
        })
        click(button('Clear filters'))
        expect(container.querySelector('.developer-results')).toBe(results)
    })

    test('clear filters from the empty-results message also clears open option searches', () => {
        render()
        click(button('Country'))
        type(container.querySelector('#country-options input'), 'United States')
        click(button('Role'))
        type(container.querySelector('#role-options input'), 'Backend')
        click(button('Required skills'))
        type(container.querySelector('#skill-search'), 'type')
        click(checkbox('TypeScript'))
        type(
            container.querySelector('input[type="search"]'),
            'no such developer'
        )
        expect(resultCount()).toContain('0 matching developers')
        click(container.querySelector('.developer-results__empty button'))
        expect(resultCount()).toContain('18 matching developers')
        expect(container.querySelector('#required-skills-options')).toBeNull()
        click(button('Required skills'))
        expect(container.querySelector('#skill-search').value).toBe('')
    })

    test('combines country, role and text with skills, and clears all filters from zero results', () => {
        render()
        click(button('Required skills'))
        click(checkbox('React'))
        click(button('Country'))
        click(checkbox('Canada'))
        click(button('Role'))
        click(checkbox('Frontend Developer'))
        type(container.querySelector('input[type="search"]'), 'Developer 01')
        expect(resultCount()).toContain('1 matching developer')
        expect(cardNames()).toEqual(['Developer 01'])
        click(button('Country (1)'))
        click(checkbox('Canada'))
        click(checkbox('United States'))
        expect(resultCount()).toContain('0 matching developers')
        expect(container.textContent).toContain(
            'No developers match your criteria'
        )
        const clearButtons = [...container.querySelectorAll('button')].filter(
            (element) => element.textContent.trim() === 'Clear filters'
        )
        click(clearButtons[1])
        expect(resultCount()).toContain('18 matching developers')
        expect(container.querySelector('input[type="search"]').value).toBe('')
        expect(
            container.querySelector('[aria-label="Selected required skills"]')
        ).toBeNull()
        expect(button('Country')).toBeTruthy()
        expect(button('Role')).toBeTruthy()
        expect(
            container.querySelector('[aria-label="Sort developers"]').value
        ).toBe('default')
        expect(cardNames()).toHaveLength(16)
    })

    test('explains the rollout when no profiles have declared skills', () => {
        render(
            <ProfileFilters
                countries={[]}
                selectedCountries={[]}
                onCountryChange={vi.fn()}
                jobTitles={[]}
                selectedJobTitles={[]}
                onJobTitleChange={vi.fn()}
                skills={[]}
                selectedSkills={[]}
                onSkillChange={vi.fn()}
                sortOption="default"
                onSortChange={vi.fn()}
                onClear={vi.fn()}
            />
        )
        expect(container.textContent).toContain(
            'No profiles have declared skills yet.'
        )
        expect(
            container.querySelector('[aria-controls="required-skills-options"]')
        ).toBeNull()
    })
})
