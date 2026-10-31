
import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileCompare from './ProfileCompare'
import Person from '../interfaces/person'

const createPerson = (
    id: string,
    name: string,
    overrides: Partial<Person> = {}
): Person => ({
    id,
    name,
    jobTitle: 'Frontend Developer',
    skills: ['React', 'TypeScript'],
    location: {
        city: 'Indore',
        state: 'Madhya Pradesh',
        country: 'India',
    },
    email: `${id}@example.com`,
    links: {
        website: `https://${id}.example.com`,
        github: `https://github.com/${id}`,
        linkedin: `https://linkedin.com/in/${id}`,
    },
    ...overrides,
})

let container: HTMLDivElement
let root: Root

const renderComparison = (persons: Person[]) => {
    act(() => {
        root.render(
            <ProfileCompare
                persons={persons}
                onClear={vi.fn()}
                onBack={vi.fn()}
            />
        )
    })
}

describe('ProfileCompare', () => {
    beforeEach(() => {
        vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
        container = document.createElement('div')
        document.body.appendChild(container)
        root = createRoot(container)
    })

    afterEach(() => {
        act(() => root.unmount())
        container.remove()
        vi.unstubAllGlobals()
    })

    it('renders two comparison columns', () => {
        renderComparison([
            createPerson('one', 'Developer One'),
            createPerson('two', 'Developer Two'),
        ])

        expect(
            container.querySelectorAll('.profile-compare__column')
        ).toHaveLength(2)
    })

    it('renders three comparison columns', () => {
        renderComparison([
            createPerson('one', 'Developer One'),
            createPerson('two', 'Developer Two'),
            createPerson('three', 'Developer Three'),
        ])

        expect(
            container.querySelectorAll('.profile-compare__column')
        ).toHaveLength(3)
    })

    it('renders profile skills, location and contact links', () => {
        renderComparison([createPerson('one', 'Developer One')])

        expect(container.textContent).toContain('React')
        expect(container.textContent).toContain('TypeScript')
        expect(container.textContent).toContain('Indore')
        expect(container.textContent).toContain('Madhya Pradesh')
        expect(container.textContent).toContain('India')

        expect(
            container.querySelector('a[href="mailto:one@example.com"]')
        ).not.toBeNull()
        expect(
            container.querySelector('a[href="https://one.example.com"]')
        ).not.toBeNull()
        expect(
            container.querySelector('a[href="https://github.com/one"]')
        ).not.toBeNull()
        expect(
            container.querySelector(
                'a[href="https://linkedin.com/in/one"]'
            )
        ).not.toBeNull()
    })

    it('uses country as the timezone fallback when coordinates are absent', () => {
        renderComparison([createPerson('one', 'Developer One')])

        const timezone = container.querySelector(
            '.profile-compare__timezone'
        )

        expect(timezone?.textContent).toContain('India')
    })
})
