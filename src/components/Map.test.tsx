import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="map">{children}</div>
    ),
    TileLayer: () => null,
    Marker: ({
        children,
        opacity,
    }: {
        children: React.ReactNode
        opacity?: number
    }) => (
        <div data-testid="marker" data-opacity={opacity ?? ''}>
            {children}
        </div>
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
        city?: string
        country?: string
        coordinates?: { lat: number; lng: number }
    }
    links: { github?: string }
    normalized: {
        countries: string[]
        geo?: { lat: number; lng: number; approximate: boolean } | null
    }
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
    // Dev placed from normalized geo only, shown as an approximate pin.
    {
        id: 'g',
        name: 'Gbenga Ade',
        location: { country: 'NG', city: 'Nowhereville' },
        links: {},
        normalized: {
            countries: ['NG'],
            geo: { lat: 9.08, lng: 8.68, approximate: true },
        },
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

    it('shows a geo-only dev as its own faded marker', () => {
        act(() => root.render(<SimpleMap />))
        const faded = Array.from(
            container.querySelectorAll('[data-testid="marker"]')
        ).filter((marker) => marker.getAttribute('data-opacity') === '0.6')
        expect(faded).toHaveLength(1)
        expect(faded[0].textContent).toContain('Gbenga Ade')
        expect(faded[0].textContent).toContain('Approximate location')
    })

    it('keeps exact pins and country markers at full opacity', () => {
        act(() => root.render(<SimpleMap />))
        const fadedTexts = Array.from(
            container.querySelectorAll('[data-opacity="0.6"]')
        ).map((marker) => marker.textContent ?? '')
        expect(fadedTexts.join(' ')).not.toContain('Ada Lovelace')
        expect(fadedTexts.join(' ')).not.toContain('Cora Diaz')
        expect(fadedTexts.join(' ')).not.toContain(
            'developers without exact pins'
        )
    })

    it('labels a city-matched fallback differently from a region or country centre', () => {
        setFixturePeople([
            {
                id: 'c1',
                name: 'City Match',
                location: { country: 'NG', city: 'Lagos' },
                links: {},
                normalized: {
                    countries: ['NG'],
                    geo: { lat: 6.45, lng: 3.39, approximate: false },
                },
            },
        ])
        act(() => root.render(<SimpleMap />))
        const text = container.textContent ?? ''
        expect(text).toContain('Estimated from city name')
        expect(text).not.toContain('Approximate location')
    })

    it('lets submitted coordinates win over a differing normalized geo', () => {
        setFixturePeople([
            {
                id: 'p',
                name: 'Pinned Dev',
                location: {
                    country: 'NG',
                    coordinates: { lat: 51.5, lng: -0.12 },
                },
                links: {},
                normalized: {
                    countries: ['NG'],
                    geo: { lat: 9.08, lng: 8.68, approximate: true },
                },
            },
        ])
        act(() => root.render(<SimpleMap />))
        const text = container.textContent ?? ''
        expect(text).toContain('Pinned Dev')
        expect(text).not.toContain('Approximate location')
        expect(container.querySelectorAll('[data-opacity="0.6"]')).toHaveLength(
            0
        )
    })
})
