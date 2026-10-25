import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const html = readFileSync('index.html', 'utf8')
const bootstrap = html.match(
    /<script data-theme-bootstrap>([\s\S]*?)<\/script>/
)?.[1]

const runBootstrap = ({
    savedTheme = null,
    systemDark = false,
    storageThrows = false,
    matchMediaThrows = false,
}: {
    savedTheme?: string | null
    systemDark?: boolean
    storageThrows?: boolean
    matchMediaThrows?: boolean
} = {}) => {
    if (!bootstrap) throw new Error('Theme bootstrap script was not found')
    const root = document.createElement('html')
    const storage = {
        getItem: () => {
            if (storageThrows) throw new Error('storage unavailable')
            return savedTheme
        },
    }
    const browser = {
        matchMedia: () => {
            if (matchMediaThrows) throw new Error('matchMedia unavailable')
            return { matches: systemDark }
        },
    }

    new Function('localStorage', 'window', 'document', bootstrap)(
        storage,
        browser,
        { documentElement: root }
    )
    return root
}

describe('index theme bootstrap', () => {
    it('applies valid saved preferences before rendering', () => {
        expect(runBootstrap({ savedTheme: 'dark' }).dataset.theme).toBe('dark')
        expect(
            runBootstrap({ savedTheme: 'light', systemDark: true }).dataset
                .theme
        ).toBe('light')
    })

    it('uses the system preference when the saved value is missing or invalid', () => {
        expect(runBootstrap({ systemDark: true }).dataset.theme).toBe('dark')
        expect(
            runBootstrap({ savedTheme: 'purple', systemDark: true }).dataset
                .theme
        ).toBe('dark')
    })

    it('falls back to light when preference detection is unavailable', () => {
        expect(runBootstrap({ matchMediaThrows: true }).dataset.theme).toBe(
            'light'
        )
        expect(
            runBootstrap({ storageThrows: true, matchMediaThrows: true })
                .dataset.theme
        ).toBe('light')
    })

    it('sets color-scheme along with the theme attribute', () => {
        expect(runBootstrap({ savedTheme: 'dark' }).style.colorScheme).toBe(
            'dark'
        )
    })
})
