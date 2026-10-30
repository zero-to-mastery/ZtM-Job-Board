import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Card from './Card'
import { emptyCriteria, filterProfiles } from '../util/filterProfiles'

const user = {
    id: 'test-profile',
    name: 'Test Developer',
    img: '',
    email: '',
    jobTitle: 'Developer',
    location: { city: '', state: '', country: '' },
    links: { website: '', github: '', linkedin: '' },
}

let container: HTMLDivElement
let root: Root

describe('Card', () => {
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

    it.each([
        {
            selectedSkills: [' REACT ', '\tTYPESCRIPT '],
            matchedLabels: ['React', 'TypeScript'],
            included: true,
        },
        {
            selectedSkills: ['react', ' REACT '],
            matchedLabels: ['React'],
            included: true,
        },
        {
            selectedSkills: ['react', 'Rust'],
            matchedLabels: ['React'],
            included: false,
        },
        {
            selectedSkills: ['React.js'],
            matchedLabels: [],
            included: false,
        },
        {
            selectedSkills: ['C++', 'C#'],
            matchedLabels: [],
            included: false,
        },
        {
            selectedSkills: [],
            matchedLabels: [],
            included: true,
        },
    ])(
        'agrees with profile filtering for $selectedSkills without changing labels',
        ({ selectedSkills, matchedLabels, included }) => {
            const person = {
                ...user,
                skills: [' React ', 'react', 'TypeScript', 'C'],
            }
            act(() =>
                root.render(
                    <Card user={person} selectedSkills={selectedSkills} />
                )
            )
            const chips = [...container.querySelectorAll('.skill-chip')]
            const label = (chip: Element) => chip.firstChild?.textContent
            expect(chips.map(label)).toEqual(['React', 'TypeScript', 'C'])
            expect(
                chips
                    .filter((chip) =>
                        chip.classList.contains('skill-chip--matched')
                    )
                    .map(label)
            ).toEqual(matchedLabels)
            expect(
                filterProfiles([person], {
                    ...emptyCriteria,
                    skills: selectedSkills,
                })
            ).toEqual(included ? [person] : [])
        }
    )

    it('uses a decorative theme-aware SVG when no photo is provided', () => {
        act(() => root.render(<Card user={user} />))
        const avatar = container.querySelector('svg.photo--fallback')
        // Decorative: the name is announced once, by the heading
        expect(avatar?.getAttribute('aria-hidden')).toBe('true')
        expect(avatar?.hasAttribute('role')).toBe(false)
        expect(container.querySelector('h2')?.textContent).toBe(user.name)
        expect(avatar?.querySelector('path')).not.toBeNull()
        expect(container.querySelector('img.photo')).toBeNull()
    })

    it('preserves profile photos and falls back when they fail to load', () => {
        act(() => root.render(<Card user={{ ...user, img: 'photo.jpg' }} />))
        const photo = container.querySelector('img.photo')
        expect(photo?.getAttribute('src')).toBe('photo.jpg')
        expect(container.querySelector('.photo--fallback')).toBeNull()

        act(() => photo?.dispatchEvent(new Event('error')))
        expect(container.querySelector('svg.photo--fallback')).not.toBeNull()
        expect(container.querySelector('img.photo')).toBeNull()
    })

    it('tries a replacement photo after the previous photo failed', () => {
        act(() => root.render(<Card user={{ ...user, img: 'broken.jpg' }} />))
        act(() =>
            container
                .querySelector('img.photo')
                ?.dispatchEvent(new Event('error'))
        )
        act(() =>
            root.render(<Card user={{ ...user, img: 'replacement.jpg' }} />)
        )
        expect(container.querySelector('img.photo')?.getAttribute('src')).toBe(
            'replacement.jpg'
        )
        expect(container.querySelector('.photo--fallback')).toBeNull()
    })
})
