import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import Person from '../interfaces/person'
import Card from './Card'
import DeveloperList from './DeveloperList'
import DeveloperPopupCard from './DeveloperPopupCard'

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const person = (id: string, overrides: Partial<Person> = {}): Person => ({
    id,
    img: '',
    name: `Dev ${id}`,
    email: `${id}@example.com`,
    jobTitle: 'Front End Developer',
    location: { city: 'Lagos', country: 'Nigeria' },
    links: {
        website: 'https://example.com',
        github: `https://github.com/${id}`,
        linkedin: '',
    },
    normalized: {
        countries: ['NG'],
        roles: ['frontend-developer'],
        seniority: null,
        technologies: [],
        geo: { lat: 6.45, lng: 3.39, approximate: false },
        timezone: { name: 'Africa/Lagos', utcOffset: 60 },
    },
    ...overrides,
})

let container: HTMLDivElement
let root: Root

beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
})

afterEach(() => {
    act(() => root.unmount())
    container.remove()
})

const hrefs = (element: Element) =>
    Array.from(element.querySelectorAll('a')).map((a) => a.href)

describe('DeveloperList', () => {
    test('marks the selected entry and reports clicks', () => {
        const onSelect = vi.fn()
        const people = [person('a'), person('b')]
        act(() =>
            root.render(
                <DeveloperList
                    people={people}
                    selectedId="b"
                    onSelect={onSelect}
                />
            )
        )
        const buttons = container.querySelectorAll<HTMLButtonElement>(
            '.devmap-entry__select'
        )
        expect(buttons[0].getAttribute('aria-pressed')).toBe('false')
        expect(buttons[1].getAttribute('aria-pressed')).toBe('true')
        expect(buttons[0].textContent).toContain('Dev a')

        act(() => buttons[0].click())
        expect(onSelect).toHaveBeenCalledWith('a')
    })

    test('renders the selected entry even past the first batch', () => {
        const people = Array.from({ length: 120 }, (_, index) =>
            person(String(index))
        )
        act(() =>
            root.render(
                <DeveloperList
                    people={people}
                    selectedId="110"
                    onSelect={() => {}}
                />
            )
        )
        expect(
            container.querySelector('.devmap-entry--selected')?.textContent
        ).toContain('Dev 110')
    })

    test('says when nothing matches', () => {
        act(() =>
            root.render(
                <DeveloperList
                    people={[]}
                    selectedId={null}
                    onSelect={() => {}}
                />
            )
        )
        expect(container.textContent).toContain('No developers match')
    })
})

describe('contact links', () => {
    test('cards, popups and list entries expose the same links', () => {
        const developer = person('x')
        act(() =>
            root.render(
                <>
                    <div id="card">
                        <Card user={developer} />
                    </div>
                    <div id="popup">
                        <DeveloperPopupCard person={developer} />
                    </div>
                    <div id="list">
                        <DeveloperList
                            people={[developer]}
                            selectedId={null}
                            onSelect={() => {}}
                        />
                    </div>
                </>
            )
        )
        const card = hrefs(container.querySelector('#card')!)
        expect(card).toEqual([
            'mailto:x@example.com',
            'https://example.com/',
            'https://github.com/x',
        ])
        expect(hrefs(container.querySelector('#popup')!)).toEqual(card)
        expect(hrefs(container.querySelector('#list')!)).toEqual(card)
    })
})
