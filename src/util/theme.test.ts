import { describe, expect, it, vi } from 'vitest'
import {
    DARK_SCHEME_QUERY,
    THEME_STORAGE_KEY,
    applyTheme,
    getSavedTheme,
    getSystemTheme,
    resolveTheme,
    saveTheme,
    subscribeToSystemTheme,
} from './theme'

const createStorage = (initial: Record<string, string> = {}): Storage => {
    const data = new Map(Object.entries(initial))
    return {
        get length() {
            return data.size
        },
        clear: () => data.clear(),
        getItem: (key) => data.get(key) ?? null,
        key: (index) => Array.from(data.keys())[index] ?? null,
        removeItem: (key) => {
            data.delete(key)
        },
        setItem: (key, value) => {
            data.set(key, String(value))
        },
    }
}

const createMatchMedia = (matches: boolean, media = DARK_SCHEME_QUERY) => {
    const query = {
        matches,
        media,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    } as unknown as MediaQueryList
    return { query, matchMedia: vi.fn(() => query) }
}

describe('resolveTheme', () => {
    it('prefers a saved preference over the system theme', () => {
        expect(resolveTheme('light', 'dark')).toBe('light')
        expect(resolveTheme('dark', 'light')).toBe('dark')
    })

    it('falls back to the system theme without a saved preference', () => {
        expect(resolveTheme(null, 'dark')).toBe('dark')
        expect(resolveTheme(null, 'light')).toBe('light')
    })

    it('falls back to light when nothing is available', () => {
        expect(resolveTheme(null, null)).toBe('light')
    })
})

describe('getSavedTheme', () => {
    it('returns valid saved values', () => {
        expect(
            getSavedTheme(createStorage({ [THEME_STORAGE_KEY]: 'dark' }))
        ).toBe('dark')
        expect(
            getSavedTheme(createStorage({ [THEME_STORAGE_KEY]: 'light' }))
        ).toBe('light')
    })

    it('treats missing or invalid values as no preference', () => {
        expect(getSavedTheme(createStorage())).toBeNull()
        expect(
            getSavedTheme(createStorage({ [THEME_STORAGE_KEY]: 'blue' }))
        ).toBeNull()
        expect(
            getSavedTheme(createStorage({ [THEME_STORAGE_KEY]: 'DARK' }))
        ).toBeNull()
        expect(getSavedTheme(null)).toBeNull()
    })

    it('returns null when storage throws', () => {
        const storage = createStorage()
        storage.getItem = () => {
            throw new Error('blocked')
        }
        expect(getSavedTheme(storage)).toBeNull()
    })
})

describe('saveTheme', () => {
    it('persists the theme', () => {
        const storage = createStorage()
        saveTheme('dark', storage)
        expect(storage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })

    it('does not throw when storage is unavailable', () => {
        const storage = createStorage()
        storage.setItem = () => {
            throw new Error('quota')
        }
        expect(() => saveTheme('dark', storage)).not.toThrow()
        expect(() => saveTheme('dark', null)).not.toThrow()
    })
})

describe('getSystemTheme', () => {
    it('reads the dark color scheme query', () => {
        const { matchMedia } = createMatchMedia(true)
        expect(getSystemTheme(matchMedia)).toBe('dark')
        expect(matchMedia).toHaveBeenCalledWith(DARK_SCHEME_QUERY)
        expect(getSystemTheme(createMatchMedia(false).matchMedia)).toBe('light')
    })

    it('returns null when detection is unavailable', () => {
        expect(getSystemTheme(null)).toBeNull()
        expect(
            getSystemTheme(createMatchMedia(false, 'not all').matchMedia)
        ).toBeNull()
        expect(
            getSystemTheme(() => {
                throw new Error('unsupported')
            })
        ).toBeNull()
    })
})

describe('applyTheme', () => {
    it('sets the theme attribute and color scheme', () => {
        const root = document.createElement('html')
        applyTheme('dark', root)
        expect(root.dataset.theme).toBe('dark')
        expect(root.style.colorScheme).toBe('dark')
        applyTheme('light', root)
        expect(root.dataset.theme).toBe('light')
    })
})

describe('subscribeToSystemTheme', () => {
    it('reports changes and removes its listener on cleanup', () => {
        const { query, matchMedia } = createMatchMedia(false)
        const onChange = vi.fn()

        const unsubscribe = subscribeToSystemTheme(onChange, matchMedia)
        const [[eventName, listener]] = vi.mocked(query.addEventListener).mock
            .calls as any
        expect(eventName).toBe('change')

        listener({ matches: true })
        listener({ matches: false })
        expect(onChange.mock.calls).toEqual([['dark'], ['light']])

        unsubscribe()
        expect(query.removeEventListener).toHaveBeenCalledWith(
            'change',
            listener
        )
    })

    it('falls back to addListener for older browsers', () => {
        const addListener = vi.fn()
        const removeListener = vi.fn()
        const query = {
            matches: false,
            media: DARK_SCHEME_QUERY,
            addListener,
            removeListener,
        } as unknown as MediaQueryList

        const unsubscribe = subscribeToSystemTheme(vi.fn(), () => query)
        expect(addListener).toHaveBeenCalledTimes(1)
        unsubscribe()
        expect(removeListener).toHaveBeenCalledWith(
            addListener.mock.calls[0][0]
        )
    })

    it('is a no-op when detection is unavailable', () => {
        const unsubscribe = subscribeToSystemTheme(vi.fn(), null)
        expect(() => unsubscribe()).not.toThrow()
    })
})
