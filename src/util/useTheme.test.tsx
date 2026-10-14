import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DARK_SCHEME_QUERY, THEME_STORAGE_KEY } from './theme'
import ThemeToggle from '../components/ThemeToggle'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

// A controllable stand-in for window.matchMedia
const mockSystemTheme = (initial: 'light' | 'dark') => {
    const listeners = new Set<(event: { matches: boolean }) => void>()
    const query = {
        matches: initial === 'dark',
        media: DARK_SCHEME_QUERY,
        addEventListener: vi.fn((_: string, listener: any) =>
            listeners.add(listener)
        ),
        removeEventListener: vi.fn((_: string, listener: any) =>
            listeners.delete(listener)
        ),
    }
    window.matchMedia = vi.fn(() => query) as any

    return {
        listeners,
        change(theme: 'light' | 'dark') {
            query.matches = theme === 'dark'
            act(() => listeners.forEach((l) => l({ matches: query.matches })))
        },
    }
}

let container: HTMLDivElement
let root: Root

const render = () => {
    act(() => root.render(<ThemeToggle />))
}
const getButton = () => container.querySelector('button') as HTMLButtonElement
const activeTheme = () => document.documentElement.dataset.theme

describe('useTheme', () => {
    beforeEach(() => {
        localStorage.clear()
        delete document.documentElement.dataset.theme
        container = document.createElement('div')
        document.body.appendChild(container)
        root = createRoot(container)
    })

    afterEach(() => {
        act(() => root.unmount())
        container.remove()
        delete (window as any).matchMedia
        vi.restoreAllMocks()
    })

    it('uses the system theme when nothing is saved', () => {
        mockSystemTheme('dark')
        render()
        expect(activeTheme()).toBe('dark')
        expect(getButton().getAttribute('aria-label')).toBe(
            'Switch to light mode'
        )
    })

    it('falls back to the system theme for invalid saved values', () => {
        localStorage.setItem(THEME_STORAGE_KEY, 'purple')
        mockSystemTheme('dark')
        render()
        expect(activeTheme()).toBe('dark')
    })

    it('falls back to light when system detection is unavailable', () => {
        render()
        expect(activeTheme()).toBe('light')
        expect(getButton().getAttribute('aria-label')).toBe(
            'Switch to dark mode'
        )
    })

    it('prefers a saved theme over the system theme', () => {
        localStorage.setItem(THEME_STORAGE_KEY, 'light')
        mockSystemTheme('dark')
        render()
        expect(activeTheme()).toBe('light')
    })

    it('toggles, persists, and keeps label and tooltip in sync', () => {
        mockSystemTheme('light')
        render()

        act(() => getButton().click())
        expect(activeTheme()).toBe('dark')
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
        expect(getButton().getAttribute('aria-label')).toBe(
            'Switch to light mode'
        )
        expect(container.querySelector('[role="tooltip"]')?.textContent).toBe(
            'Click to enable light mode'
        )

        act(() => getButton().click())
        expect(activeTheme()).toBe('light')
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
        expect(getButton().getAttribute('aria-label')).toBe(
            'Switch to dark mode'
        )
    })

    it('restores a saved manual choice after a reload', () => {
        mockSystemTheme('light')
        render()
        act(() => getButton().click())
        act(() => root.unmount())

        root = createRoot(container)
        render()
        expect(activeTheme()).toBe('dark')
    })

    it('follows system changes while no preference is saved', () => {
        const system = mockSystemTheme('light')
        render()
        system.change('dark')
        expect(activeTheme()).toBe('dark')
        expect(getButton().getAttribute('aria-label')).toBe(
            'Switch to light mode'
        )
        system.change('light')
        expect(activeTheme()).toBe('light')
    })

    it('ignores system changes after a manual choice', () => {
        const system = mockSystemTheme('light')
        render()
        act(() => getButton().click())
        system.change('light')
        expect(activeTheme()).toBe('dark')
    })

    it('keeps manual selections when storage writes fail', () => {
        const system = mockSystemTheme('light')
        render()
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('blocked')
        })

        act(() => getButton().click())
        expect(activeTheme()).toBe('dark')
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
        system.change('dark')
        system.change('light')
        expect(activeTheme()).toBe('dark')
        expect(getButton().getAttribute('aria-label')).toBe(
            'Switch to light mode'
        )

        act(() => getButton().click())
        system.change('dark')
        expect(activeTheme()).toBe('light')
        expect(getButton().getAttribute('aria-label')).toBe(
            'Switch to dark mode'
        )
    })

    it('keeps a manual selection when storage reads become unavailable', () => {
        const system = mockSystemTheme('light')
        render()
        act(() => getButton().click())
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked')
        })

        system.change('light')
        expect(activeTheme()).toBe('dark')
    })

    it('removes the system listener on unmount', () => {
        const system = mockSystemTheme('light')
        render()
        expect(system.listeners.size).toBe(1)
        act(() => root.unmount())
        expect(system.listeners.size).toBe(0)
        root = createRoot(container)
    })

    it('renders an accessible, keyboard-focusable toggle', () => {
        render()
        const button = getButton()
        expect(button.type).toBe('button')
        button.focus()
        expect(document.activeElement).toBe(button)
        const tooltip = container.querySelector('[role="tooltip"]')
        expect(button.getAttribute('aria-describedby')).toBe(tooltip?.id)
    })
})
