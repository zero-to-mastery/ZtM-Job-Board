export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

type MatchMedia = (query: string) => MediaQueryList

const isTheme = (value: unknown): value is Theme =>
    value === 'light' || value === 'dark'

const getStorage = (): Storage | null => {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null
    } catch {
        // Accessing localStorage can throw (e.g. blocked site data)
        return null
    }
}

const getMatchMedia = (): MatchMedia | null =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia.bind(window)
        : null

// Returns the manually saved theme, or null when missing or invalid
export const getSavedTheme = (
    storage: Storage | null = getStorage()
): Theme | null => {
    try {
        const value = storage?.getItem(THEME_STORAGE_KEY)
        return isTheme(value) ? value : null
    } catch {
        return null
    }
}

export const saveTheme = (
    theme: Theme,
    storage: Storage | null = getStorage()
) => {
    try {
        storage?.setItem(THEME_STORAGE_KEY, theme)
    } catch {
        // Ignore: the theme still applies for this visit
    }
}

// Returns the system theme, or null when it can't be detected
export const getSystemTheme = (
    matchMedia: MatchMedia | null = getMatchMedia()
): Theme | null => {
    try {
        const query = matchMedia?.(DARK_SCHEME_QUERY)
        if (!query || query.media === 'not all') return null
        return query.matches ? 'dark' : 'light'
    } catch {
        return null
    }
}

// Saved preference first, then system preference, then light
export const resolveTheme = (
    savedTheme: Theme | null,
    systemTheme: Theme | null
): Theme => savedTheme ?? systemTheme ?? 'light'

export const getInitialTheme = (): Theme =>
    resolveTheme(getSavedTheme(), getSystemTheme())

export const applyTheme = (theme: Theme, root: HTMLElement) => {
    root.dataset.theme = theme
    root.style.colorScheme = theme
}

// Calls onChange whenever the system theme changes. Returns a cleanup function.
export const subscribeToSystemTheme = (
    onChange: (theme: Theme) => void,
    matchMedia: MatchMedia | null = getMatchMedia()
): (() => void) => {
    let mediaQuery: MediaQueryList | undefined
    try {
        mediaQuery = matchMedia?.(DARK_SCHEME_QUERY)
    } catch {
        mediaQuery = undefined
    }
    if (!mediaQuery) return () => {}
    const query = mediaQuery

    const listener = (event: MediaQueryListEvent) =>
        onChange(event.matches ? 'dark' : 'light')

    // Older Safari only supports addListener/removeListener
    if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', listener)
        return () => query.removeEventListener('change', listener)
    }
    if (typeof query.addListener === 'function') {
        query.addListener(listener)
        return () => query.removeListener(listener)
    }
    return () => {}
}
