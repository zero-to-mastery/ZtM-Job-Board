import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useShortlist } from '../hooks/useShortlist'
import Person from '../interfaces/person'
import { SHORTLIST_STORAGE_KEY } from '../util/shortlist'
import ShortlistControls from './ShortlistControls'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const person = (id: string): Person => ({
    id,
    img: '',
    name: `Dev ${id}`,
    jobTitle: '',
    location: {},
    links: {},
})

function Harness() {
    const shortlist = useShortlist()
    return (
        <ShortlistControls
            shortlist={shortlist}
            people={shortlist.ids.map(person)}
            showing={false}
            onShowingChange={() => {}}
        />
    )
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
    localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(['a', 'b']))
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(<Harness />))
})

afterEach(() => {
    act(() => root.unmount())
    container.remove()
    localStorage.clear()
    vi.restoreAllMocks()
})

const button = (text: string) => {
    const found = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === text
    )
    if (!found) throw new Error(`No button "${text}"`)
    return found
}
const dialog = () => container.querySelector('dialog')!
const stored = () => JSON.parse(localStorage.getItem(SHORTLIST_STORAGE_KEY)!)

describe('clearing the shortlist', () => {
    test('asks in a custom dialog instead of window.confirm', () => {
        const confirm = vi.spyOn(window, 'confirm')
        expect(dialog().open).toBe(false)

        act(() => button('Clear').click())

        expect(confirm).not.toHaveBeenCalled()
        expect(dialog().open).toBe(true)
        expect(dialog().getAttribute('aria-labelledby')).toBe(
            dialog().querySelector('h2')?.id
        )
        expect(dialog().textContent).toContain(
            'This removes all 2 developers from your shortlist.'
        )
        // Cancel is focused first so Enter never clears by accident
        expect(document.activeElement).toBe(button('Cancel'))
    })

    test('cancel keeps the shortlist and returns focus to Clear', () => {
        act(() => button('Clear').click())
        act(() => button('Cancel').click())

        expect(dialog().open).toBe(false)
        expect(stored()).toEqual(['a', 'b'])
        expect(document.activeElement).toBe(button('Clear'))
    })

    test('Escape cancels', () => {
        act(() => button('Clear').click())
        act(() => {
            dialog().dispatchEvent(new Event('cancel', { cancelable: true }))
        })

        expect(dialog().open).toBe(false)
        expect(stored()).toEqual(['a', 'b'])
    })

    test('confirming clears it and moves focus to the shortlist toggle', () => {
        act(() => button('Clear').click())
        act(() => button('Clear shortlist').click())

        expect(dialog().open).toBe(false)
        expect(stored()).toEqual([])
        expect(container.textContent).toContain('Shortlist cleared')
        expect(document.activeElement?.textContent).toContain('Shortlist (0)')
    })

    test('names the developer when only one is shortlisted', () => {
        act(() => root.unmount())
        localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(['a']))
        root = createRoot(container)
        act(() => root.render(<Harness />))

        act(() => button('Clear').click())
        expect(dialog().textContent).toContain(
            'This removes Dev a from your shortlist.'
        )
    })
})
