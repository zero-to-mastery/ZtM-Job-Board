import React, { act, useState } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { DEFAULT_FILTERS, PeopleFilters } from '../util/filterPeople'
import { browserTimeZone, timeZoneLabel } from '../util/timezone'
import RecruiterFilters from './RecruiterFilters'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root
const onOverlapChange = vi.fn()

function Harness() {
    const [filters, setFilters] = useState<PeopleFilters>({
        ...DEFAULT_FILTERS,
        overlap: { timeZone: 'Europe/London', minHours: 0 },
    })
    return (
        <RecruiterFilters
            signals={[]}
            filters={filters}
            onSignalChange={() => {}}
            onOverlapChange={(overlap) => {
                onOverlapChange(overlap)
                setFilters((current) => ({
                    ...current,
                    overlap: { ...current.overlap, ...overlap },
                }))
            }}
        />
    )
}

beforeEach(() => {
    onOverlapChange.mockClear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(<Harness />))
})

afterEach(() => {
    act(() => root.unmount())
    container.remove()
})

function input() {
    const element = container.querySelector<HTMLInputElement>(
        'input[role="combobox"]'
    )
    if (!element) throw new Error('Time-zone input is missing')
    return element
}

function type(query: string) {
    const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
    )?.set
    if (!setter) throw new Error('Input value setter is missing')
    act(() => {
        setter.call(input(), query)
        input().dispatchEvent(new Event('input', { bubbles: true }))
    })
}

function press(key: string) {
    act(() =>
        input().dispatchEvent(
            new KeyboardEvent('keydown', { key, bubbles: true })
        )
    )
}

test.each(['GMT', 'UTC', 'gmt-5', 'UTC-5', 'GMT+5:30'])(
    'typing %s and Enter selects the first match',
    (query) => {
        act(() => input().focus())
        expect(input().value).toBe('')
        for (let length = 1; length <= query.length; length++) {
            type(query.slice(0, length))
            expect(input().value).toBe(query.slice(0, length))
        }
        const expected =
            query === 'GMT' || query === 'UTC'
                ? 'UTC'
                : query.includes('5:30')
                  ? 'UTC+5:30'
                  : 'UTC-5'
        press('Enter')
        expect(onOverlapChange).toHaveBeenLastCalledWith({
            timeZone: expected,
        })
        expect(input().value).toBe(expected)
        act(() => input().blur())
        expect(input().value).toBe(expected)
    }
)

test('arrow keys select offset suggestions and clicking opens a fresh search', () => {
    act(() => input().focus())
    type('gmt-')
    press('ArrowDown')
    press('ArrowDown')
    press('Enter')
    expect(onOverlapChange).toHaveBeenLastCalledWith({ timeZone: 'UTC-2' })
    act(() => input().click())
    expect(input().value).toBe('')
    type('new york')
    const option = container.querySelector<HTMLButtonElement>('[role="option"]')
    if (!option) throw new Error('New York option is missing')
    act(() => option.click())
    expect(onOverlapChange).toHaveBeenLastCalledWith({
        timeZone: 'America/New_York',
    })
    expect(input().value).toBe('New York · America')
})

test('deleting a query does not change the selected zone, but clear resets to local', () => {
    act(() => input().focus())
    type('GMT-5')
    type('')
    expect(input().value).toBe('')
    expect(onOverlapChange).not.toHaveBeenCalled()
    type('GMT-5')
    const clear = container.querySelector<HTMLButtonElement>(
        '.recruiter-filters__timezone-clear'
    )
    if (!clear) throw new Error('Time-zone reset button is missing')
    act(() => clear.click())
    expect(onOverlapChange).toHaveBeenLastCalledWith({
        timeZone: browserTimeZone(),
    })
    expect(input().value).toBe(timeZoneLabel(browserTimeZone()))
})

test('invalid offsets show no matches and do not replace the selected zone', () => {
    act(() => input().focus())
    type('GMT+25')
    expect(container.textContent).toContain('No matching time zones')
    press('Enter')
    expect(onOverlapChange).not.toHaveBeenCalled()
    act(() => input().blur())
    expect(input().value).toBe('London · Europe')
})

test('Escape cancels the draft without changing the selected zone', () => {
    act(() => input().focus())
    type('GMT-5')
    press('Escape')
    expect(input().value).toBe('London · Europe')
    expect(input().getAttribute('aria-expanded')).toBe('false')
    expect(onOverlapChange).not.toHaveBeenCalled()
})
