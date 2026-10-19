import { useCallback, useEffect, useMemo, useState } from 'react'
import { parseShortlist, SHORTLIST_STORAGE_KEY } from '../util/shortlist'

const read = () => {
    try {
        return parseShortlist(localStorage.getItem(SHORTLIST_STORAGE_KEY))
    } catch {
        return []
    }
}

const write = (ids: string[]) => {
    try {
        localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(ids))
    } catch {
        // Storage can be unavailable (private mode, blocked site data);
        // the shortlist then lasts for this visit only
    }
}

/** Starred developer ids, kept in localStorage so they survive reloads. */
export function useShortlist() {
    const [ids, setIds] = useState<string[]>(read)

    // Keep other open tabs in step
    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === SHORTLIST_STORAGE_KEY) {
                setIds(parseShortlist(event.newValue))
            }
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    const update = useCallback((change: (current: string[]) => string[]) => {
        setIds((current) => {
            const next = change(current)
            write(next)
            return next
        })
    }, [])

    const idSet = useMemo(() => new Set(ids), [ids])

    return {
        ids,
        has: useCallback((id: string) => idSet.has(id), [idSet]),
        toggle: useCallback(
            (id: string) =>
                update((current) =>
                    current.includes(id)
                        ? current.filter((item) => item !== id)
                        : [...current, id]
                ),
            [update]
        ),
        clear: useCallback(() => update(() => []), [update]),
    }
}

export type Shortlist = ReturnType<typeof useShortlist>
