import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import App from './App'
import { people } from './data/people'
import Person from './interfaces/person'

// Capture what each view receives instead of rendering cards and Leaflet
const received: {
    cards?: Person[]
    map?: Person[]
    focusId?: string | null
} = {}

vi.mock('./components/BatchCards', () => ({
    default: ({ persons }: { persons: Person[] }) => {
        received.cards = persons
        return <div data-testid="cards">{persons.length}</div>
    },
}))

vi.mock('./components/Map', () => ({
    default: ({
        people,
        focusId,
    }: {
        people: Person[]
        focusId: string | null
    }) => {
        received.map = people
        if (focusId) received.focusId = focusId
        return <div data-testid="map">{people.length}</div>
    },
}))

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    received.cards = undefined
    received.map = undefined
    received.focusId = undefined
    window.history.replaceState(null, '', '/')
})

afterEach(() => {
    act(() => root.unmount())
    container.remove()
})

const typeSearch = (text: string) => {
    const input = container.querySelector<HTMLInputElement>(
        '.visible-on-desktopview-only input[type="search"]'
    )!
    const setValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
    )!.set!
    act(() => {
        setValue.call(input, text)
        input.dispatchEvent(new Event('input', { bubbles: true }))
    })
}

const switchView = async () => {
    const mapLink = Array.from(container.querySelectorAll('span.pointer')).find(
        (element) =>
            element.textContent === 'Map' || element.textContent === 'Home'
    ) as HTMLElement
    await act(async () => {
        mapLink.click()
    })
}

const ids = (list?: Person[]) => list?.map(({ id }) => id)

describe('shared filters', () => {
    test('card view and map receive the same filtered developers', async () => {
        act(() => root.render(<App />))
        expect(received.cards).toHaveLength(people.length)

        typeSearch('india')
        const cards = received.cards!
        expect(cards.length).toBeGreaterThan(0)
        expect(cards.length).toBeLessThan(people.length)

        await switchView()
        expect(container.querySelector('[data-testid="map"]')).not.toBeNull()
        expect(ids(received.map)).toEqual(ids(cards))

        // The search text is kept in the inputs after switching views
        const input = container.querySelector<HTMLInputElement>(
            '.visible-on-desktopview-only input[type="search"]'
        )!
        expect(input.value).toBe('india')

        // Changing the sort on the map view applies to both views
        const select = container.querySelector('select')!
        act(() => {
            select.value = 'name-asc'
            select.dispatchEvent(new Event('change', { bubbles: true }))
        })
        const sorted = ids(received.map)!
        expect(sorted).not.toEqual(ids(cards))

        await switchView()
        expect(ids(received.cards)).toEqual(sorted)
    })

    test('shuffle reorders the cards without changing who is shown', () => {
        act(() => root.render(<App />))
        const before = ids(received.cards)!
        const shuffleButton = Array.from(
            container.querySelectorAll('span.pointer')
        ).find((element) => element.textContent === 'Shuffle') as HTMLElement
        act(() => shuffleButton.click())
        const after = ids(received.cards)!
        expect(after).not.toEqual(before)
        expect([...after].sort()).toEqual([...before].sort())
    })
})

describe('#person-<id> links', () => {
    test('open the map on that developer', async () => {
        const target = people[people.length - 1]
        window.history.replaceState(null, '', `/#person-${target.id}`)
        await act(async () => root.render(<App />))
        expect(container.querySelector('[data-testid="map"]')).not.toBeNull()
        expect(received.focusId).toBe(target.id)
        expect(ids(received.map)).toContain(target.id)
    })

    test('clear filters that would hide the developer', async () => {
        await act(async () => root.render(<App />))
        typeSearch('zzzz-no-match')
        expect(received.cards).toHaveLength(0)

        const target = people[0]
        await act(async () => {
            window.location.hash = `#person-${target.id}`
            window.dispatchEvent(new HashChangeEvent('hashchange'))
        })
        expect(received.focusId).toBe(target.id)
        expect(ids(received.map)).toContain(target.id)
    })

    test('ignore unknown ids', async () => {
        window.history.replaceState(null, '', '/#person-does-not-exist')
        await act(async () => root.render(<App />))
        expect(container.querySelector('[data-testid="map"]')).toBeNull()
    })
})
