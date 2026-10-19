import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { filterByRoles, getRoleOptions } from './roleFilters'
import { filterProfiles } from './profileFilters'
import { resolveRole } from './roles/resolveRole.js'
import { resolveCountry } from './countries/resolveCountry.js'
import ProfileFilters from '../components/ProfileFilters'

// Profiles as produced by scripts/aggregate-json.mjs, using real titles and
// country values from Submissions/
const person = (name: string, jobTitle: string | undefined, country = '') => {
    const role = resolveRole(jobTitle)
    return {
        name,
        jobTitle,
        location: { city: '', state: '', country },
        normalized: {
            countries: resolveCountry(country).countries,
            roles: role.roles,
            seniority: role.seniority,
            technologies: role.technologies,
        },
    }
}

const PEOPLE = [
    person('a', 'Front-End Developer', 'USA'),
    person('b', 'Front End Developer', 'Canada'),
    person('c', 'FrontEnd Developer', 'India'),
    person('d', 'Fronted Web Developer', 'USA'),
    person('e', 'React Developer', 'Brasil'),
    person('f', 'Frontend Developer | Full Stack Developer', 'United States'),
    person('g', 'Full Stack Developer', 'Canada'),
    person('h', 'FullStack Developer', 'India'),
    person('i', 'Back-end Developer', 'USA'),
    person('j', 'React Native Developer', 'Canada'),
    person('k', 'Software Engineer', 'Germany'),
    person('l', 'Student', 'USA'),
    person('m', undefined, 'Canada'),
    person('n', 'Data Scientist / Python Developer', 'India'),
]

const names = (people: { name: string }[]) => people.map((p) => p.name)

describe('getRoleOptions', () => {
    test('lists each canonical role once, sorted by label', () => {
        expect(getRoleOptions(PEOPLE)).toEqual([
            { id: 'backend-developer', label: 'Backend Developer' },
            { id: 'data-scientist', label: 'Data Scientist' },
            { id: 'frontend-developer', label: 'Frontend Developer' },
            { id: 'full-stack-developer', label: 'Full Stack Developer' },
            { id: 'mobile-developer', label: 'Mobile Developer' },
            {
                id: 'software-engineer',
                label: 'Software Engineer / Developer',
            },
        ])
    })

    test('title variations collapse into one option', () => {
        const raw = new Set(PEOPLE.map((p) => p.jobTitle).filter(Boolean))
        expect(raw.size).toBe(13)
        expect(getRoleOptions(PEOPLE)).toHaveLength(6)
    })

    test('profiles without normalized roles are ignored', () => {
        expect(getRoleOptions([{}, { normalized: {} }])).toEqual([])
    })
})

describe('filterByRoles', () => {
    test('an empty selection returns everyone, including unclassified', () => {
        expect(filterByRoles(PEOPLE, [])).toBe(PEOPLE)
    })

    test('Frontend Developer matches every frontend spelling, once each', () => {
        const result = names(filterByRoles(PEOPLE, ['frontend-developer']))
        expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    })

    test('multi-role profiles match each of their roles', () => {
        expect(names(filterByRoles(PEOPLE, ['full-stack-developer']))).toEqual([
            'f',
            'g',
            'h',
        ])
    })

    test('multiple selections use OR and never duplicate a profile', () => {
        const result = names(
            filterByRoles(PEOPLE, [
                'frontend-developer',
                'full-stack-developer',
            ])
        )
        expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])
        expect(new Set(result).size).toBe(result.length)
    })

    test('React Native is mobile, not frontend', () => {
        expect(names(filterByRoles(PEOPLE, ['mobile-developer']))).toEqual([
            'j',
        ])
    })

    test('aspirations and employer text do not create role filter matches', () => {
        const people = [
            person('aspiring', 'Aspiring Frontend/Backend Developer', 'USA'),
            person(
                'current',
                'Aspiring Frontend/Backend Developer | Software Engineer',
                'Canada'
            ),
            person(
                'employed',
                'Frontend Developer at Data Scientist / ML Engineer',
                'USA'
            ),
        ]
        expect(names(filterByRoles(people, ['backend-developer']))).toEqual([])
        expect(names(filterByRoles(people, ['ml-engineer']))).toEqual([])
        expect(names(filterByRoles(people, ['software-engineer']))).toEqual([
            'current',
        ])
        expect(names(filterByRoles(people, ['frontend-developer']))).toEqual([
            'employed',
        ])
        expect(filterByRoles(people, [])).toBe(people)
    })
})

describe('filterProfiles', () => {
    const none = { search: '', countries: [], roles: [], sort: 'default' }

    test('with no filters every profile is returned in order', () => {
        expect(names(filterProfiles(PEOPLE, none))).toEqual(names(PEOPLE))
    })

    test('roles AND countries; OR within each', () => {
        const result = filterProfiles(PEOPLE, {
            ...none,
            roles: ['frontend-developer', 'full-stack-developer'],
            countries: ['US', 'CA'],
        })
        expect(names(result)).toEqual(['a', 'b', 'd', 'f', 'g'])
    })

    test('clearing the selections restores everyone', () => {
        const filtered = filterProfiles(PEOPLE, {
            ...none,
            roles: ['backend-developer'],
            countries: ['US'],
        })
        expect(names(filtered)).toEqual(['i'])
        expect(filterProfiles(PEOPLE, none)).toHaveLength(PEOPLE.length)
    })

    test('sorting applies after filtering', () => {
        const options = { ...none, roles: ['frontend-developer'] }
        expect(
            names(filterProfiles(PEOPLE, { ...options, sort: 'name-desc' }))
        ).toEqual(['f', 'e', 'd', 'c', 'b', 'a'])
        expect(
            names(
                filterProfiles([...PEOPLE].reverse(), {
                    ...options,
                    sort: 'name-asc',
                })
            )
        ).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    })

    test('free text still matches the original title', () => {
        expect(
            names(filterProfiles(PEOPLE, { ...none, search: 'React' }))
        ).toEqual(['e', 'j'])
        expect(
            names(filterProfiles(PEOPLE, { ...none, search: 'Front End' }))
        ).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    })

    test('free text also matches canonical role labels', () => {
        // "React Developer" has no "frontend" in its title
        expect(
            names(filterProfiles(PEOPLE, { ...none, search: 'frontend' }))
        ).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
        expect(
            names(filterProfiles(PEOPLE, { ...none, search: 'mobile' }))
        ).toEqual(['j'])
    })

    test('does not modify the profiles', () => {
        const before = JSON.stringify(PEOPLE)
        filterProfiles(PEOPLE, { ...none, search: 'frontend' })
        expect(JSON.stringify(PEOPLE)).toBe(before)
        expect(PEOPLE[0]).not.toHaveProperty('roleLabels')
    })
})

describe('ProfileFilters role dropdown', () => {
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
                    countries={[]}
                    selectedCountries={[]}
                    onCountryChange={() => {}}
                    roles={getRoleOptions(PEOPLE)}
                    selectedRoles={[]}
                    onRoleChange={() => {}}
                    {...props}
                />
            )
        )
        const roleButton = Array.from(
            container.querySelectorAll('button')
        ).find((b) => b.textContent?.startsWith('Role')) as HTMLButtonElement
        act(() => roleButton.click())
        return roleButton
    }

    test('shows readable labels and reports role ids', () => {
        const onRoleChange = vi.fn()
        const button = render({
            onRoleChange,
            selectedRoles: ['frontend-developer', 'mobile-developer'],
        })
        // Label, then the first selection and how many more
        expect(button.textContent).toBe('RoleFrontend Developer +1')

        const labels = Array.from(container.querySelectorAll('label'))
        expect(labels.map((l) => l.textContent?.trim())).toEqual([
            'Backend Developer',
            'Data Scientist',
            'Frontend Developer',
            'Full Stack Developer',
            'Mobile Developer',
            'Software Engineer / Developer',
        ])

        const frontend = labels[2].querySelector('input') as HTMLInputElement
        expect(frontend.checked).toBe(true)
        act(() => frontend.click())
        expect(onRoleChange).toHaveBeenCalledWith('frontend-developer')
    })

    test('the role search filters by label', () => {
        render({})
        const input = container.querySelector(
            'input[aria-label="Search roles"]'
        ) as HTMLInputElement
        const setValue = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
        )!.set!
        act(() => {
            setValue.call(input, 'stack')
            input.dispatchEvent(new Event('input', { bubbles: true }))
        })
        const labels = Array.from(container.querySelectorAll('label'))
        expect(labels.map((l) => l.textContent?.trim())).toEqual([
            'Full Stack Developer',
        ])
    })
})
