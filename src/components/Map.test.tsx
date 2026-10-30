import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="map">{children}</div>
    ),
    TileLayer: () => null,
    Marker: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="marker">{children}</div>
    ),
    Popup: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="popup">{children}</div>
    ),
    Tooltip: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="tooltip">{children}</div>
    ),
}))

// Persistently shared with the mocked persons.json module: Map holds this
// array reference, so tests swap contents in place via setFixturePeople.
const fixturePeople: {
    id: string
    name: string
    location: {
        country?: string
        coordinates?: { lat: number; lng: number }
    }
    links: { github?: string }
    normalized: { countries: string[] }
}[] = []

const setFixturePeople: (people: typeof fixturePeople) => void = (people) => {
    fixturePeople.splice(0, fixturePeople.length, ...people)
}

const defaultFixtures: typeof fixturePeople = [
    // Two devs sharing exact coordinates: one combined pin, both selectable.
    {
        id: 'a',
        name: 'Ada Lovelace',
        location: { country: 'US', coordinates: { lat: 40.71, lng: -74 } },
        links: {},
        normalized: { countries: ['US'] },
    },
    {
        id: 'b',
        name: 'Bodhi Lin',
        location: { country: 'US', coordinates: { lat: 40.71, lng: -74 } },
        links: {},
        normalized: { countries: ['US'] },
    },
    // Dev with no exact pin, counted in the US country marker.
    {
        id: 'c',
        name: 'Cora Diaz',
        location: { country: 'US' },
        links: {},
        normalized: { countries: ['US'] },
    },
]

vi.mock('../assets/persons.json', () => ({ default: fixturePeople }))

let SimpleMap: typeof import('./Map').default
let container: HTMLDivElement
let root: Root

describe('Map', () => {
    beforeEach(async () => {
        vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
        setFixturePeople(defaultFixtures)
        container = document.createElement('div')
        document.body.appendChild(container)
        root = createRoot(container)
        ;({ default: SimpleMap } = await import('./Map'))
    })

    afterEach(() => {
        act(() => root.unmount())
        container.remove()
        vi.unstubAllGlobals()
        vi.resetModules()
    })

    it('shows one country marker for the dev without an exact pin', () => {
        act(() => root.render(<SimpleMap />))
        expect(container.textContent).toContain(
            '1 developer without an exact pin from United States'
        )
    })

    it('does not double count a pinned dev in the country marker', () => {
        act(() => root.render(<SimpleMap />))
        expect(container.textContent).not.toContain(
            'developers without exact pins'
        )
    })

    it('shows a lone pinned developer by name, without plural pin text', () => {
        setFixturePeople([
            {
                id: 's',
                name: 'Solo Gomez',
                location: {
                    country: 'US',
                    coordinates: { lat: 51.5, lng: -0.12 },
                },
                links: { github: 'https://github.com/sologomez' },
                normalized: { countries: ['US'] },
            },
        ])
        act(() => root.render(<SimpleMap />))
        const text = container.textContent ?? ''
        // Single dev: tooltip is the plain name, popup header is 'Developer'.
        expect(text).toContain('Solo Gomez')
        expect(text).not.toContain('developers at this location')
        expect(text).toContain('GitHub profile')
        // Pinned dev must not leak into any country count.
        expect(text).not.toContain('developer without an exact pin')
    })

    it('groups overlapping coordinates into one pin with both names selectable', () => {
        act(() => root.render(<SimpleMap />))
        const popups = container.querySelectorAll('[data-testid="popup"]')
        const coordinatePopup = Array.from(popups).find((popup) =>
            popup.textContent?.includes('2 developers at this location')
        )
        expect(coordinatePopup).toBeTruthy()
        expect(coordinatePopup?.textContent).toContain('Ada Lovelace')
        expect(coordinatePopup?.textContent).toContain('Bodhi Lin')
    })
})
