import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CheckboxDropdown from './CheckboxDropdown'

let container: HTMLDivElement
let root: Root

const renderDropdown = (
    overrides: Partial<React.ComponentProps<typeof CheckboxDropdown>> = {}
) => {
    const props: React.ComponentProps<typeof CheckboxDropdown> = {
        id: 'test-options',
        label: 'Test options',
        isOpen: true,
        selectedCount: 1,
        options: [
            { value: 'React', label: 'React' },
            { value: 'TypeScript', label: 'TypeScript' },
        ],
        selectedValues: ['React'],
        searchValue: '',
        onSearchChange: vi.fn(),
        onOptionChange: vi.fn(),
        onToggle: vi.fn(),
        ...overrides,
    }

    act(() => root.render(<CheckboxDropdown {...props} />))

    return props
}

describe('CheckboxDropdown', () => {
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

    it('renders the trigger with the selected count and expanded state', () => {
        renderDropdown()

        const trigger = container.querySelector('button')

        expect(trigger?.textContent).toBe('Test options (1)')
        expect(trigger?.getAttribute('aria-expanded')).toBe('true')
        expect(trigger?.getAttribute('aria-controls')).toBe('test-options')
        expect(container.querySelector('#test-options')).not.toBeNull()
    })

    it('shows selected checkboxes and calls the callback for the chosen option', () => {
        const onOptionChange = vi.fn()
        renderDropdown({ onOptionChange })

        const checkboxes = [
            ...container.querySelectorAll<HTMLInputElement>(
                '#test-options input[type="checkbox"]'
            ),
        ]

        expect(checkboxes).toHaveLength(2)
        expect(checkboxes[0].checked).toBe(true)
        expect(checkboxes[1].checked).toBe(false)

        act(() => checkboxes[1].click())

        expect(onOptionChange).toHaveBeenCalledWith('TypeScript')
    })

    it('renders an accessible search field and reports search changes', () => {
        const onSearchChange = vi.fn()
        renderDropdown({
            onSearchChange,
            searchLabel: 'Search declared skills',
        })

        const input = container.querySelector<HTMLInputElement>(
            '#test-options-search'
        )

        expect(input).not.toBeNull()
        expect(input?.getAttribute('aria-label')).toBeNull()
        expect(
            container.querySelector('label[for="test-options-search"]')
                ?.textContent
        ).toBe('Search declared skills')

        act(() => {
            if (input) {
                Object.getOwnPropertyDescriptor(
                    HTMLInputElement.prototype,
                    'value'
                )!.set!.call(input, 'Type')

                input.dispatchEvent(new Event('input', { bubbles: true }))
            }
        })

        expect(onSearchChange).toHaveBeenCalledWith('Type')
    })

    it('associates help text with the trigger via aria-describedby while closed', () => {
        renderDropdown({
            isOpen: false,
            helpText: 'Some help text',
        })

        const trigger = container.querySelector('button')
        const describedBy = trigger?.getAttribute('aria-describedby')
        const described = describedBy
            ? container.querySelector(`#${describedBy}`)
            : null

        expect(describedBy).not.toBeNull()
        expect(described?.textContent).toBe('Some help text')
    })

    it('emits no aria-describedby when help text is omitted', () => {
        renderDropdown({ isOpen: false })

        const trigger = container.querySelector('button')

        expect(trigger?.hasAttribute('aria-describedby')).toBe(false)
    })

    it('shows the custom empty-state message when there are no matching options', () => {
        renderDropdown({
            options: [],
            noResultsMessage: 'No options match this search.',
        })

        expect(container.textContent).toContain('No options match this search.')
        expect(container.querySelector('[role="status"]')).not.toBeNull()
    })

    it('shows the default empty-state message when none is provided', () => {
        renderDropdown({ options: [] })

        expect(container.textContent).toContain('No matches found.')
        expect(container.querySelector('[role="status"]')).not.toBeNull()
    })

    it('does not render the options panel when closed', () => {
        renderDropdown({ isOpen: false })

        expect(container.querySelector('#test-options')).toBeNull()
        expect(container.querySelector('#test-options-search')).toBeNull()
    })
})
