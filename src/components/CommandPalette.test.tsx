import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CommandPalette from './CommandPalette'
import type { PaletteSource } from '../util/paletteCommands'

let container: HTMLDivElement
let root: Root

const sourceProps = (): PaletteSource => ({
    countries: [
        { code: 'DE', label: 'Germany' },
        { code: 'CA', label: 'Canada' },
    ],
    selectedCountries: [],
    onCountryChange: vi.fn(),
    jobTitles: ['Frontend Developer', 'Backend Developer'],
    selectedJobTitles: [],
    onJobTitleChange: vi.fn(),
    skills: ['React', 'TypeScript'],
    selectedSkills: [],
    onSkillChange: vi.fn(),
    sortOption: 'default',
    onSortChange: vi.fn(),
    onClear: vi.fn(),
    onSearch: vi.fn(),
})

const renderPalette = (
    overrides: Partial<React.ComponentProps<typeof CommandPalette>> = {}
) => {
    const props = {
        open: true,
        onClose: vi.fn(),
        ...sourceProps(),
        ...overrides,
    }
    act(() => root.render(<CommandPalette {...props} />))
    return props
}

const input = () =>
    container.querySelector<HTMLInputElement>('.command-palette__input')!
const labels = () =>
    [...container.querySelectorAll('.command-palette__label')].map(
        (element) => element.textContent
    )
const options = () => [...container.querySelectorAll('[role="option"]')]

function keyDown(key: string) {
    let event!: KeyboardEvent
    act(() => {
        event = new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true,
        })
        input().dispatchEvent(event)
    })
    return event
}

function typeQuery(value: string) {
    act(() => {
        Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
        )!.set!.call(input(), value)
        input().dispatchEvent(new Event('input', { bubbles: true }))
    })
}

describe('CommandPalette', () => {
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

    it('renders nothing while closed', () => {
        renderPalette({ open: false })

        expect(container.innerHTML).toBe('')
    })

    it('lists every command and focuses the search field on open', () => {
        renderPalette()

        expect(labels()).toEqual([
            'React',
            'TypeScript',
            'Germany',
            'Canada',
            'Frontend Developer',
            'Backend Developer',
            'Default',
            'Name A–Z',
            'Name Z–A',
            'Clear all filters',
        ])
        expect(document.activeElement).toBe(input())
    })

    it('narrows the list as the query is typed', () => {
        renderPalette()

        typeQuery('canada')

        expect(labels()).toEqual(['Canada', 'Search developers for “canada”'])
    })

    it('runs the highlighted command with the arrow keys and Enter', () => {
        const props = renderPalette()

        keyDown('ArrowDown')
        keyDown('ArrowDown')
        keyDown('ArrowDown')
        keyDown('Enter')

        expect(props.onCountryChange).toHaveBeenCalledWith('CA')
        expect(props.onClose).toHaveBeenCalledTimes(1)
    })

    it('wraps the highlight from the first row to the last', () => {
        const props = renderPalette()

        keyDown('ArrowUp')
        keyDown('Enter')

        expect(props.onClear).toHaveBeenCalledTimes(1)
    })

    it('points aria-activedescendant at the highlighted option', () => {
        renderPalette()

        keyDown('ArrowDown')

        const active = container.querySelector('[aria-selected="true"]')!
        expect(active.textContent).toContain('TypeScript')
        expect(input().getAttribute('aria-activedescendant')).toBe(active.id)
    })

    it('marks the commands that are already applied', () => {
        renderPalette({
            selectedSkills: ['React'],
            sortOption: 'name-desc',
        })

        const applied = options()
            .filter((option) => option.querySelector('.command-palette__state'))
            .map(
                (option) =>
                    option.querySelector('.command-palette__label')!.textContent
            )
        expect(applied).toEqual(['React', 'Name Z–A'])
    })

    it('offers a text search for a query that matches no command', () => {
        const props = renderPalette()

        typeQuery('react native')
        keyDown('Enter')

        expect(props.onSearch).toHaveBeenCalledWith('react native')
        expect(props.onClose).toHaveBeenCalledTimes(1)
    })

    it('closes on Escape without changing any filter', () => {
        const props = renderPalette()

        keyDown('Escape')

        expect(props.onClose).toHaveBeenCalledTimes(1)
        expect(props.onCountryChange).not.toHaveBeenCalled()
    })

    it('keeps Tab inside the dialog', () => {
        renderPalette()

        expect(keyDown('Tab').defaultPrevented).toBe(true)
    })

    it('closes on a backdrop press but not a press inside the dialog', () => {
        const props = renderPalette()

        act(() =>
            input().dispatchEvent(new Event('pointerdown', { bubbles: true }))
        )
        expect(props.onClose).not.toHaveBeenCalled()

        act(() =>
            container
                .querySelector('.command-palette-backdrop')!
                .dispatchEvent(new Event('pointerdown', { bubbles: true }))
        )
        expect(props.onClose).toHaveBeenCalledTimes(1)
    })

    it('runs a command on click and closes', () => {
        const props = renderPalette()
        const germany = options().find((option) =>
            option.textContent.includes('Germany')
        )!

        act(() => (germany as HTMLElement).click())

        expect(props.onCountryChange).toHaveBeenCalledWith('DE')
        expect(props.onClose).toHaveBeenCalledTimes(1)
    })

    it('returns focus to the element that had it before opening', () => {
        const opener = document.createElement('button')
        document.body.appendChild(opener)
        opener.focus()

        renderPalette()
        expect(document.activeElement).toBe(input())

        renderPalette({ open: false })
        expect(document.activeElement).toBe(opener)
        opener.remove()
    })
})
