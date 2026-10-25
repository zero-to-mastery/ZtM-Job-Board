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

const fixturePeople = [
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
